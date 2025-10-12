import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import * as json5 from 'json5';
import { DeviceConfig } from './types';
import { TuyaDevice } from './tuya-device';
import { TuyaConfigProvider } from '../config/tuya-config.provider';
import { BridgeConfigProvider } from '../bridge/config/bridge-config.provider';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';

const debug = require('debug')('tuya-mqtt:localapi');
const debugError = require('debug')('tuya-mqtt:error');

@Injectable()
export class LocalApiService implements OnModuleInit, OnModuleDestroy {
  private devices: Map<string, TuyaDevice> = new Map();
  private devicesConfig: DeviceConfig[] = [];
  private config: {
    topic: string;
    bridgeId: string;
    devicesFile: string;
  };

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly homeAssistantService: HomeAssistantService,
    tuyaConfigProvider: TuyaConfigProvider,
    bridgeConfigProvider: BridgeConfigProvider,
  ) {
    this.config = {
      topic: tuyaConfigProvider.getTuyaConfig().baseTopic,
      bridgeId: bridgeConfigProvider.getBridgeConfig().bridgeId,
      devicesFile: 'devices.json',
    };
  }

  async onModuleInit(): Promise<void> {
    debug('LocalApiService initializing');
    await this.initialize();
    this.setupEventListeners();
  }

  async onModuleDestroy(): Promise<void> {
    debug('LocalApiService shutting down');
    await this.shutdown();
  }

  private setupEventListeners(): void {
    // Listen for MQTT messages and route to appropriate devices
    this.eventEmitter.on(
      'mqtt.message',
      (data: { topic: string; message: string }) => {
        this.handleMqttMessage(data.topic, data.message);
      },
    );

    // Listen for application shutdown
    this.eventEmitter.on('app.shutdown', () => {
      this.shutdown();
    });

    // Listen for device config reload requests
    this.eventEmitter.on('localapi.reload', () => {
      this.reloadDevicesConfig();
    });
  }

  private handleMqttMessage(topic: string, message: string): void {
    debug('Handling MQTT message for topic:', topic, 'message:', message);

    // Find which device this message is for
    for (const device of this.devices.values()) {
      const baseTopic = device.baseMqttTopic;

      if (topic.startsWith(baseTopic)) {
        const subtopic = topic.substring(baseTopic.length);
        debug(
          `Message matched device ${device.deviceId}, subtopic: ${subtopic}`,
        );

        // Check if a device has a driver and if it can handle this command
        const driver = device.getDeviceDriver();
        if (driver && subtopic.endsWith('/command')) {
          const commandRoute = subtopic.substring(
            0,
            subtopic.length - '/command'.length,
          );

          debug(
            `Attempting to handle command via driver, route: ${commandRoute}`,
          );
          // Try to let the driver handle the command
          if (driver.processTopicCommand(message, commandRoute)) {
            debug(
              `Command handled by device driver for route: ${commandRoute}`,
            );
            break;
          }
          debug(
            `Driver could not handle route: ${commandRoute}, falling back to generic handling`,
          );
        }

        // Fall back to generic command handling
        if (subtopic === 'command') {
          debug('Handling generic command');
          device.handleCommand(message);
        } else if (subtopic === 'dps/command') {
          debug('Handling DPS command');
          device.handleDpsCommand(message);
        } else if (
          subtopic.startsWith('dps/') &&
          subtopic.endsWith('/command')
        ) {
          const dpsKey = subtopic.split('/')[1];
          debug(`Handling DPS key command for key: ${dpsKey}`);
          device.handleDpsKeyCommand(dpsKey, message);
        }
        break;
      }
    }
  }

  private async initialize(): Promise<void> {
    debug('Initializing LocalApiService');

    try {
      await this.loadDevicesConfig();
      await this.createDevices();
      await this.connectDevices();

      debug(`LocalApiService initialized with ${this.devices.size} devices`);

      // Emit initialization complete event
      this.eventEmitter.emit('localapi.initialized', {
        deviceCount: this.devices.size,
      });
    } catch (error) {
      debugError('Failed to initialize LocalApiService:', error);
      this.eventEmitter.emit('localapi.error', { error });
      throw error;
    }
  }

  private async loadDevicesConfig(): Promise<void> {
    const devicesPath = path.resolve(process.cwd(), this.config.devicesFile);

    debug('Loading devices config from:', devicesPath);

    try {
      if (!fs.existsSync(devicesPath)) {
        debugError(`Devices config file not found: ${devicesPath}`);
        throw new Error(`Devices config file not found: ${devicesPath}`);
      }

      const devicesData = fs.readFileSync(devicesPath, 'utf8');
      this.devicesConfig = json5.parse(devicesData);

      if (!Array.isArray(this.devicesConfig)) {
        throw new Error('Devices config must be an array');
      }

      debug(`Loaded ${this.devicesConfig.length} device configurations`);
    } catch (error) {
      debugError('Could not parse devices config file:', error);
      throw error;
    }
  }

  private async createDevices(): Promise<void> {
    debug('Creating devices');

    for (const configDevice of this.devicesConfig) {
      try {
        const device = this.getDevice(configDevice);
        if (device) {
          this.devices.set(configDevice.id, device);
          debug(
            `Created device: ${configDevice.name || configDevice.id} (${configDevice.type || 'Generic'})`,
          );
        }
      } catch (error) {
        debugError(`Failed to create device ${configDevice.id}:`, error);
      }
    }
  }

  private getDevice(configDevice: DeviceConfig): TuyaDevice | null {
    try {
      const baseTopic = `${this.config.topic}${configDevice.id}/`;
      const device = new TuyaDevice(
        configDevice,
        this.eventEmitter,
        baseTopic,
        this.homeAssistantService,
      );
      return device;
    } catch (error) {
      debugError(`Failed to create device ${configDevice.id}:`, error);
      return null;
    }
  }

  private async connectDevices(): Promise<void> {
    debug('Connecting to devices');

    const connectionPromises = Array.from(this.devices.values()).map(
      async (device) => {
        try {
          debug(`Connecting to device: ${device.toString()}`);
          device.connectDevice();

          // Subscribe to MQTT topics for this device
          this.subscribeToDeviceTopics(device);
        } catch (error) {
          debugError(
            `Failed to connect to device ${device.toString()}:`,
            error,
          );
        }
      },
    );

    await Promise.allSettled(connectionPromises);
  }

  private subscribeToDeviceTopics(device: TuyaDevice): void {
    const baseTopic = device.baseMqttTopic;

    // Subscribe to generic command topics
    this.eventEmitter.emit('mqtt.subscribe', { topic: `${baseTopic}command` });
    this.eventEmitter.emit('mqtt.subscribe', {
      topic: `${baseTopic}dps/command`,
    });

    // Subscribe to individual DPS command topics
    for (let dpsKey = 1; dpsKey <= 20; dpsKey++) {
      this.eventEmitter.emit('mqtt.subscribe', {
        topic: `${baseTopic}dps/${dpsKey}/command`,
      });
    }

    // Subscribe to device-specific driver topics
    const driver = device.getDeviceDriver();
    if (driver) {
      const deviceTopics = driver.getDeviceTopics();
      for (const topic of deviceTopics) {
        this.eventEmitter.emit('mqtt.subscribe', {
          topic: `${baseTopic}${topic}/command`,
        });
        debug(
          `Subscribed to device-specific topic: ${baseTopic}${topic}/command`,
        );
      }
    }
  }

  getDeviceById(deviceId: string): TuyaDevice | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): TuyaDevice[] {
    return Array.from(this.devices.values());
  }

  getDevicesCount(): number {
    return this.devices.size;
  }

  getConnectedDevicesCount(): number {
    return Array.from(this.devices.values()).filter(
      (device) => device.isConnected,
    ).length;
  }

  async reloadDevicesConfig(): Promise<void> {
    debug('Reloading devices configuration');

    try {
      // Disconnect existing devices
      for (const device of this.devices.values()) {
        if (device.isConnected) {
          await device.disconnect();
        }
      }

      // Clear devices map
      this.devices.clear();

      // Reload configuration and reconnect
      await this.loadDevicesConfig();
      await this.createDevices();
      await this.connectDevices();

      debug('Devices configuration reloaded successfully');
      this.eventEmitter.emit('localapi.reloaded', {
        deviceCount: this.devices.size,
      });
    } catch (error) {
      debugError('Failed to reload devices configuration:', error);
      this.eventEmitter.emit('localapi.error', { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    debug('Shutting down LocalApiService');

    const shutdownPromises = Array.from(this.devices.values()).map(
      async (device) => {
        try {
          if (device.isConnected) {
            await device.disconnect();
          }
        } catch (error) {
          debugError(`Error disconnecting device ${device.toString()}:`, error);
        }
      },
    );

    await Promise.allSettled(shutdownPromises);
    this.devices.clear();

    debug('LocalApiService shutdown complete');
    this.eventEmitter.emit('localapi.shutdown');
  }

  getDeviceStats(): { total: number; connected: number; disconnected: number } {
    const total = this.devices.size;
    const connected = this.getConnectedDevicesCount();
    const disconnected = total - connected;

    return { total, connected, disconnected };
  }

  // Public API methods for external access
  async sendDeviceCommand(deviceId: string, command: any): Promise<void> {
    const device = this.getDeviceById(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const commandString =
      typeof command === 'string' ? command : JSON.stringify(command);
    device.handleCommand(commandString);
  }

  async getDeviceState(deviceId: string): Promise<any> {
    const device = this.getDeviceById(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    return {
      id: device.deviceId,
      name: device.deviceName,
      connected: device.isConnected,
      state: device.getAllDpsValues(),
    };
  }
}
