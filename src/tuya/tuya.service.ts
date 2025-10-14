import { Logger } from '@nestjs/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TuyaConfigProvider } from './config/tuya-config.provider';
import { BridgeConfigProvider } from './bridge/config/bridge-config.provider';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';
import { TuyaDevice } from './localApi/tuya-device';

const debug = require('debug')('tuya-mqtt:tuyaservice');

@Injectable()
export class TuyaService implements OnModuleInit {
  private readonly logger = new Logger(TuyaService.name);

  private config: {
    topic: string;
    bridgeId: string;
  };

  private devicesMap: Map<string, TuyaDevice> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly homeAssistantService: HomeAssistantService,
    tuyaConfigProvider: TuyaConfigProvider,
    bridgeConfigProvider: BridgeConfigProvider,
  ) {
    this.config = {
      topic: tuyaConfigProvider.getTuyaConfig().baseTopic,
      bridgeId: bridgeConfigProvider.getBridgeConfig().bridgeId,
    };
  }

  async onModuleInit(): Promise<void> {
    debug('TuyaService initializing');
    this.setupMqttListeners();
  }

  private setupMqttListeners(): void {
    // Listen for MQTT messages and route to appropriate devices
    this.eventEmitter.on(
      'mqtt.message',
      (data: { topic: string; message: string }) => {
        this.handleMqttMessage(data.topic, data.message);
      },
    );
  }

  registerDevice(device: TuyaDevice): void {
    this.devicesMap.set(device.deviceId, device);
    debug(`Registered device: ${device.deviceId}`);
  }

  unregisterDevice(deviceId: string): void {
    this.devicesMap.delete(deviceId);
    debug(`Unregistered device: ${deviceId}`);
  }

  clearDevices(): void {
    this.devicesMap.clear();
    debug('Cleared all devices');
  }

  handleMqttMessage(topic: string, message: string): void {
    debug('Handling MQTT message for topic:', topic, 'message:', message);

    // Find which device this message is for
    for (const device of this.devicesMap.values()) {
      const baseTopic = this.getBaseTopic();

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

  subscribeToDeviceTopics(device: TuyaDevice): void {
    const baseTopic = 'device.baseMqttTopic';

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

  getBaseTopic(): string {
    return this.config.topic;
  }

  getBridgeId(): string {
    return this.config.bridgeId;
  }

  getHomeAssistantService(): HomeAssistantService {
    return this.homeAssistantService;
  }
}
