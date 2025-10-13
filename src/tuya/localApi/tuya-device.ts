import { Utils } from './utils';
import { DeviceConfig, TuyaCommand, DeviceData, SubDevice } from './types';
import {DeviceConnectionHandler, TuyaDeviceOptions} from './handlers/device-connection.handler';
import { DeviceStateHandler } from './handlers/device-state.handler';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';
import { HomeAssistantDeviceInfo } from '../homeassistant/homeassistant.types';
import {
  BaseDeviceDriver,
  DeviceDriverCallbacks,
} from './devices/base-device-driver';
import { DeviceDriverFactory } from './devices/device-driver.factory';

const debug = require('debug')('tuya-mqtt:tuyapi');
const debugError = require('debug')('tuya-mqtt:error');

import { Logger } from '@nestjs/common';

export class TuyaDevice {
  private readonly logger = new Logger('TuyaDevice');

  protected options: TuyaDeviceOptions;
  protected deviceData: DeviceData;
  protected subDevices: Record<string, SubDevice> = {};

  // Handlers
  private connectionHandler: DeviceConnectionHandler;
  private stateHandler: DeviceStateHandler;
  private deviceDriver: BaseDeviceDriver;



  // Callbacks for external integration
  private onStateChangedCallback?: (
    deviceId: string,
    updatedKeys: string[],
  ) => void;
  private onDeviceConnectedCallback?: (deviceId: string) => void;
  private onDeviceDisconnectedCallback?: (deviceId: string) => void;

  constructor(
      protected readonly config: DeviceConfig,
      private readonly eventEmitter: EventEmitter2,
      private readonly _baseRoute: string,
      private readonly homeAssistantService?: HomeAssistantService,
  ) {

    this.buildDeviceOptions();
    this.setupDeviceData();
    this.initializeDeviceDriver();
    this.initializeHandlers();
  }

  private initializeDeviceDriver(): void {
    // Create callbacks for a driver to communicate with TuyaDevice
    const driverCallbacks: DeviceDriverCallbacks = {
      publishMessage: (route: string, message: string, retain?: boolean) => {
        this.eventEmitter.emit('message.publish', {
          route,
          message,
          retain: retain ?? true,
        });
      },
      sendCommand: (dps: number, value: any) => {
        debug(`Driver sending command to DPS ${dps}:`, value);
        this.set({ dps, set: value });
      },
    };

    // Try to create a device-specific driver
    this.deviceDriver = DeviceDriverFactory.createDriver(
      this.config,
      this._baseRoute,
      this.getHomeAssistantDeviceInfo(),
      driverCallbacks,
      this.homeAssistantService,
    );
  }

  private buildDeviceOptions(): void {
    this.options = {
      id: this.config.id,
      key: this.config.key,
      // Use issueGetOnConnect instead of issueRefreshOnConnect for better compatibility
      issueGetOnConnect: this.config.issueRefreshOnConnect !== false,
      issueRefreshOnConnect: false,
    };

    // if (this.config.name) {
    //   this.options.name = Utils.sanitizeName(this.config.name);
    // }

    if (this.config.ip) {
      this.options.ip = this.config.ip;
      this.options.version = this.config.version || '3.1';
    }
  }

  private setupDeviceData(): void {
    // Set default device data for Home Assistant
    this.deviceData = {
      ids: [this.config.id],
      name: this.config.name || this.config.id,
      mf: 'Tuya',
      via_device: 'tuya-local',
    };
  }

  private getHomeAssistantDeviceInfo(): HomeAssistantDeviceInfo {
    return {
      identifiers: [this.config.id],
      name: this.config.name || this.config.id,
      manufacturer: 'Tuya',
      via_device: 'tuya-local',
    };
  }

  private initializeHandlers(): void {
    // Initialize state handler
    this.stateHandler = new DeviceStateHandler(this.config);

    // Initialize connection handler
    this.connectionHandler = new DeviceConnectionHandler(
      this.config,
      this.options,
    );

    this.setupHandlerCallbacks();
  }

  private setupHandlerCallbacks(): void {
    // Connection handler callbacks
    this.connectionHandler.setCallbacks({
      onConnected: () => this.onConnected(),
      onDisconnected: () => this.onDisconnected(),
      onData: (data: any) => this.onData(data),
      onError: (error: Error) => this.onError(error),
    });

    // State handler callbacks
    this.stateHandler.setStateUpdatedCallback((updatedKeys: string[]) => {
      this.handleStateUpdated(updatedKeys);
      this.onStateChangedCallback?.(this.config.id, updatedKeys);
    });
  }

  private handleStateUpdated(updatedKeys: string[]): void {
    // If a device driver exists, let it handle state updates
    if (this.deviceDriver) {
      const dpsData: Record<string, any> = {};
      for (const key of updatedKeys) {
        dpsData[key] = this.getDpsValue(key);
      }
      // Driver will publish via its own routes (computer_power, usb_power, etc.)
      this.deviceDriver.updateState(dpsData);
    } else {
      // If no driver exists, publish raw DPS updates
      this.publishStateUpdate(updatedKeys);
    }
  }

  private publishStateUpdate(updatedKeys: string[]): void {
    // Publish individual DPS updates to message bus (only when no driver handles them)
    for (const key of updatedKeys) {
      const value = this.getDpsValue(key);
      const route = `${this._baseRoute}dps/${key}`;

      this.eventEmitter.emit('message.publish', {
        route,
        message: JSON.stringify(value),
        retain: true,
      });
    }
  }

  async onConnected(): Promise<void> {
    if (this.connectionHandler.isConnected()) {
      debug('Connected to device ' + this.toString());

      // Initialize device (restore state and init driver)
      await this.init();

      // Note: get() is automatically called by TuyaAPI due to issueGetOnConnect: true
      // This ensures we always have the latest DPS state after connection

      // Publish connection status to message bus
      this.publishDeviceStatus('online');

      // Publish initial state
      await this.publishState();

      this.onDeviceConnectedCallback?.(this.config.id);

      for (const cid of Object.keys(this.subDevices)) {
        this.subDevices[cid].onConnected();
      }
    }
  }

  async onDisconnected(): Promise<void> {
    debug('Disconnected from device ' + this.toString());

    // Publish disconnection status to message bus
    this.publishDeviceStatus('offline');

    for (const cid of Object.keys(this.subDevices)) {
      this.subDevices[cid].onDisconnected();
    }

    this.onDeviceDisconnectedCallback?.(this.config.id);
    await Utils.sleep(5);
    this.connectionHandler.reconnect();
  }

  private publishDeviceStatus(status: 'online' | 'offline'): void {
    const route = `${this._baseRoute}status`;

    this.eventEmitter.emit('message.publish', {
      route,
      message: status,
      retain: true,
    });

    debug(`Published device status: ${status} to ${route}`);
  }

  private onError(error: Error): void {
    debugError('Device error: ' + error.message);
  }

  protected async init(): Promise<void> {
    this.stateHandler.restoreState();

    // First initialize driver (this sets up deviceRoutes)
    await this.deviceDriver.init();

    // Then update driver with current state after restore
    const allDps = this.getAllDpsValues();
    if (Object.keys(allDps).length > 0) {
      debug(
        `[init] Updating driver state with ${Object.keys(allDps).length} DPS values`,
      );
      this.deviceDriver.updateState(allDps);
    }
  }

  onData(data: any): void {
    if (typeof data === 'object') {
      // if the data contains cid then pass it to subdevice
      if (data.cid) {
        debug(
          'Received JSON data from device ' +
            this.options.id +
            ' for cid: ' +
            data.cid +
            ' ->',
          JSON.stringify(data.dps),
        );
        const subdevice = this.subDevices[data.cid];
        if (subdevice) {
          debug('Passing data to subdevice');
          subdevice.onData(data);
        } else {
          debugError('Subdevice with cid ' + data.cid + ' not found.');
        }
      } else {
        debug(
          'Received JSON data from device ' + this.options.id + ' ->',
          JSON.stringify(data.dps),
        );
        this.stateHandler.updateState(data);
      }
    } else {
      if (data !== 'json obj data invalid') {
        debug(
          'Received string data from device ' + this.options.id + ' ->',
          String(data).replace(/[^a-zA-Z0-9 ]/g, ''),
        );
      }
    }
  }

  async getStates(): Promise<void> {
    debug('getStates() for ' + this.toString());
    this.connectionHandler.get();
  }

  get(options: any = {}): void {
    this.connectionHandler.get(options);
  }

  refresh(options: any = {}): void {
    this.connectionHandler.refresh(options);
  }

  toString(): string {
    return (
      this.config.name +
      ' (' +
      (this.options.ip ? this.options.ip + ', ' : '') +
      this.options.id +
      ')'
    );
  }

  set(command: TuyaCommand): Promise<any> {
    return this.connectionHandler.set(command);
  }

  connectDevice(): void {
    this.connectionHandler.connect().catch((error) => {
      debugError('Failed to connect: ' + error.message);
    });
  }

  disconnect(): Promise<void> {
    return this.connectionHandler.disconnect();
  }

  // Public getters for external access
  get deviceId(): string {
    return this.config.id;
  }

  get deviceName(): string {
    return this.config.name || this.config.id;
  }

  get isConnected(): boolean {
    return this.connectionHandler.isConnected();
  }

  // Backward compatibility alias
  get baseMqttTopic(): string {
    return this._baseRoute;
  }

  getDeviceDriver(): BaseDeviceDriver | null {
    return this.deviceDriver;
  }

  // Get the current device state
  getDpsValue(key: string): any {
    return this.stateHandler.getDpsValue(key);
  }

  getAllDpsValues(): Record<string, any> {
    const allDps = this.stateHandler.getAllDps();
    const values: Record<string, any> = {};
    for (const key in allDps) {
      values[key] = allDps[key].val;
    }
    return values;
  }

  async publishState(): Promise<void> {
    const state = this.getAllDpsValues();
    this.logger.debug(
      `Device state: ${this.config.name || this.config.id} - ${JSON.stringify(state)}`,
    );
    //this.publishMqtt('state', JSON.stringify(state));
  }

  // Command handlers
  handleCommand(message: string): void {
    try {
      const command = JSON.parse(message);
      debug(`Received command for ${this.toString()}:`, command);

      // Build DPS command object
      const dpsCommand: Record<string, any> = {};

      for (const key in command) {
        const dpsKey = this.getDpsKeyForCommand(key);
        if (dpsKey) {
          dpsCommand[dpsKey] = this.convertCommandValue(key, command[key]);
        }
      }

      if (Object.keys(dpsCommand).length > 0) {
        // this.set({ dps: dpsCommand });
      }
    } catch (error) {
      debugError(`Failed to handle command for ${this.toString()}:`, error);
    }
  }

  handleDpsCommand(message: string): void {
    try {
      const dpsCommand = JSON.parse(message);
      debug(`Received DPS command for ${this.toString()}:`, dpsCommand);
      // this.set({ dps: dpsCommand });
    } catch (error) {
      debugError(`Failed to handle DPS command for ${this.toString()}:`, error);
    }
  }

  handleDpsKeyCommand(dpsKey: string, message: string): void {
    try {
      let value: any;
      try {
        value = JSON.parse(message);
      } catch {
        value = message;
      }

      debug(
        `Received DPS key command for ${this.toString()}, key ${dpsKey}:`,
        value,
      );
      // this.set({ dps: { [dpsKey]: value } });
    } catch (error) {
      debugError(
        `Failed to handle DPS key command for ${this.toString()}:`,
        error,
      );
    }
  }

  private getDpsKeyForCommand(commandKey: string): string | null {
    // Map command keys to DPS keys based on config
    const mapping: Record<string, keyof DeviceConfig> = {
      // 'state': 'dpsSwitch',
      brightness: 'dpsBrightness',
      color: 'dpsColor',
      mode: 'dpsMode',
    };

    const configKey = mapping[commandKey];
    if (configKey && this.config[configKey]) {
      return String(this.config[configKey]);
    }

    // If no mapping found, try to use the key directly if it's numeric
    if (/^\d+$/.test(commandKey)) {
      return commandKey;
    }

    return null;
  }

  private convertCommandValue(commandKey: string, value: any): any {
    // Convert command values to appropriate DPS format
    switch (commandKey) {
      case 'state':
        return value === 'ON' || value === true || value === 1 || value === '1';
      case 'brightness':
        // Normalize brightness to device range if specified
        if (typeof value === 'number') {
          return Math.round(value);
        }
        return value;
      default:
        return value;
    }
  }
}
