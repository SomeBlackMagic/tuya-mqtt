import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import * as json5 from 'json5';
import { TuyaDevice } from './tuya-device';
import { TuyaService } from '../tuya.service';

import {TuyaConfigProvider} from "./config/localApi-config.provider";
import {LanModuleConfig, LocalDeviceConfig} from "./interfaces/lan.interface";

const debug = require('debug')('tuya-mqtt:localapi');
const debugError = require('debug')('tuya-mqtt:error');

@Injectable()
export class LanService implements OnModuleInit, OnModuleDestroy {
  private devices: Map<string, TuyaDevice> = new Map();
  private devicesConfig: LocalDeviceConfig[] = [];
  private config: LanModuleConfig;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly tuyaService: TuyaService,
    tuyaConfigProvider : TuyaConfigProvider,
  ) {
    this.config = tuyaConfigProvider.getLanConfig();
  }

  async onModuleInit(): Promise<void> {
    debug('LanService initializing');
    await this.initialize();
    this.setupEventListeners();
  }

  async onModuleDestroy(): Promise<void> {
    debug('LanService shutting down');
    await this.shutdown();
  }

  private setupEventListeners(): void {
    // Listen for application shutdown
    this.eventEmitter.on('app.shutdown', () => {
      this.shutdown();
    });

    // Listen for device config reload requests
    this.eventEmitter.on('localapi.reload', () => {
      this.reloadDevicesConfig();
    });
  }

  private async initialize(): Promise<void> {
    debug('Initializing LanService');

    try {
      await this.loadDevicesConfig();
      await this.createDevices();
      await this.connectDevices();

      debug(`LanService initialized with ${this.devices.size} devices`);

      // Emit initialization complete event
      this.eventEmitter.emit('localapi.initialized', {
        deviceCount: this.devices.size,
      });
    } catch (error) {
      debugError('Failed to initialize LanService:', error);
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
          this.devices.set(configDevice.deviceId, device);
          debug(`Created device: ${configDevice.name || configDevice.deviceId}`);
        }
      } catch (error) {
        debugError(`Failed to create device ${configDevice.deviceId}:`, error);
      }
    }
  }

  private getDevice(configDevice: LocalDeviceConfig): TuyaDevice | null {
    try {
      const device = new TuyaDevice(configDevice, this.eventEmitter);

      // Register a device with TuyaService for MQTT handling
      this.tuyaService.registerDevice(device);

      return device;
    } catch (error) {
      debugError(`Failed to create device ${configDevice.deviceId}:`, error);
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
          this.tuyaService.subscribeToDeviceTopics(device);
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

      // Clear devices from TuyaService
      this.tuyaService.clearDevices();

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
    debug('Shutting down LanService');

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

    // Clear devices from TuyaService
    this.tuyaService.clearDevices();

    debug('LanService shutdown complete');
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

    const commandString = typeof command === 'string' ? command : JSON.stringify(command);
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
