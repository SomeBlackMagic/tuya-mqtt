import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  BridgeConfig,
  BridgeDevice,
  BridgeSensorConfig,
  BridgeStats,
} from './types/bridge.types';
import { BridgeConfigProvider } from './config/bridge-config.provider';
import { TuyaConfigProvider } from '../config/tuya-config.provider';

@Injectable()
export class BridgeService implements OnModuleInit {
  private readonly logger = new Logger(BridgeService.name);
  private config: BridgeConfig;
  private startTime: Date = new Date();
  private statsInterval: NodeJS.Timeout | null = null;
  private devicesCount = 0;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configProvider: BridgeConfigProvider,
    private readonly tuyaConfigProvider: TuyaConfigProvider,
  ) {
    this.logger.log('Bridge Service initialized');
  }

  async onModuleInit(): Promise<void> {
    // Initialize configuration
    this.config = this.configProvider.getBridgeConfig();
    this.logger.log('Bridge module initialized, waiting for MQTT connection');
  }

  @OnEvent('mqtt.connected')
  private async onMqttConnected(): Promise<void> {
    this.logger.log('🔥 MQTT connected event received, initializing bridge...');

    if (!this.config) {
      this.logger.error('Bridge config not initialized, cannot proceed');
      return;
    }

    try {
      // Subscribe to Tuya topics
      this.logger.log(
        `Subscribing to base topic: ${this.tuyaConfigProvider.getTuyaConfig().baseTopic}#`,
      );
      this.eventEmitter.emit('mqtt.subscribe', {
        topic: `${this.tuyaConfigProvider.getTuyaConfig().baseTopic}#`,
      });

      // Initialize bridge after MQTT connection
      this.logger.log('Starting bridge initialization...');
      await this.initBridge();
      this.logger.log('✅ Bridge initialization completed successfully');

      // Start statistics publication
      setTimeout(() => this.publishBridgeStats(), 5000);
      this.statsInterval = setInterval(() => this.publishBridgeStats(), 60000);
      this.logger.log('📊 Bridge statistics publishing scheduled');
    } catch (error) {
      this.logger.error(
        '❌ Failed to initialize bridge after MQTT connection:',
        error,
      );
    }
  }

  async initBridge(): Promise<void> {
    this.logger.log('Initializing bridge discovery');

    // Publish bridge configuration
    await this.publishBridgeDiscovery();

    // Initialize bridge sensors
    await this.initBridgeSensors();
  }

  private async publishBridgeDiscovery(): Promise<void> {
    const bridgeId = this.config.bridgeId || 'tuya-mqtt';
    const bridgeConfigTopic = `homeassistant/device/${bridgeId}/config`;
    const bridgeConfig = this.getBridgeDiscoveryConfig();

    this.eventEmitter.emit('mqtt.publish', {
      topic: bridgeConfigTopic,
      message: JSON.stringify(bridgeConfig),
      qos: 1,
      retain: true,
    });

    this.logger.log('Publishing bridge discovery data');
  }

  private async initBridgeSensors(): Promise<void> {
    this.logger.log('Initializing bridge sensors');

    const bridgeId = this.config.bridgeId || 'tuya-mqtt';
    const baseTopic = this.tuyaConfigProvider.getTuyaConfig().baseTopic;
    const sensorConfigs = this.getBridgeSensorConfigs();

    for (const sensorConfig of sensorConfigs) {
      let topic = '';
      const configWithTopic: BridgeSensorConfig = { ...sensorConfig };

      if (sensorConfig.unique_id.endsWith('_uptime')) {
        topic = `homeassistant/sensor/${bridgeId}_uptime/config`;
        configWithTopic.state_topic = `${baseTopic}${bridgeId}/uptime`;
      } else if (sensorConfig.unique_id.endsWith('_devices')) {
        topic = `homeassistant/sensor/${bridgeId}_devices/config`;
        configWithTopic.state_topic = `${baseTopic}${bridgeId}/devices_count`;
      } else if (sensorConfig.unique_id.endsWith('_status')) {
        topic = `homeassistant/sensor/${bridgeId}_status/config`;
        configWithTopic.state_topic = `${baseTopic}${bridgeId}/status`;
      }

      if (topic) {
        this.eventEmitter.emit('mqtt.publish', {
          topic,
          message: JSON.stringify(configWithTopic),
          qos: 1,
          retain: true,
        });
      }
    }
  }

  private async publishBridgeStats(): Promise<void> {
    try {
      const bridgeId = this.config.bridgeId || 'tuya-mqtt';
      const baseTopic = this.tuyaConfigProvider.getTuyaConfig().baseTopic;
      const uptime = this.startTime.toISOString();
      const status = 'online';

      // Publish statistics via MQTT events
      this.eventEmitter.emit('mqtt.publish', {
        topic: `${baseTopic}${bridgeId}/uptime`,
        message: uptime,
        qos: 1,
        retain: true,
      });

      this.eventEmitter.emit('mqtt.publish', {
        topic: `${baseTopic}${bridgeId}/devices_count`,
        message: this.devicesCount.toString(),
        qos: 1,
        retain: true,
      });

      this.eventEmitter.emit('mqtt.publish', {
        topic: `${baseTopic}${bridgeId}/status`,
        message: status,
        qos: 1,
        retain: true,
      });

      // Request actual device count from other modules
      this.eventEmitter.emit('bridge.stats.request');
    } catch (error) {
      this.logger.error('Failed to publish bridge stats:', error);
    }
  }

  @OnEvent('bridge.devices.count.updated')
  handleDevicesCountUpdate(count: number): void {
    this.devicesCount = count;
    this.logger.debug(`Updated devices count: ${count}`);
  }

  @OnEvent('bridge.stats.request')
  private handleStatsRequest(): void {
    // Statistics request handler - re-emit for other modules
    this.eventEmitter.emit('bridge.stats.request.devices');
  }

  getBridgeDiscoveryConfig(): BridgeDevice {
    const bridgeId = this.config.bridgeId || 'tuya-mqtt';

    return {
      identifiers: [bridgeId],
      name: this.config.bridgeName || bridgeId,
      model: 'Tuya MQTT Bridge',
      manufacturer: 'tuya-mqtt',
      sw_version: '2.0.0',
      configuration_url: 'https://github.com/SomeBlackMagic/tuya-mqtt',
    };
  }

  getBridgeSensorConfigs(): BridgeSensorConfig[] {
    const bridgeId = this.config.bridgeId || 'tuya-mqtt';
    const bridgeName = this.config.bridgeName || bridgeId;

    return [
      // Uptime sensor
      {
        name: `${bridgeName} Uptime`,
        unique_id: `${bridgeId}_uptime`,
        // state_topic: `${config.topic}${bridgeId}/uptime`,
        device_class: 'timestamp',
        entity_category: 'diagnostic',
        device: {
          identifiers: [bridgeId],
          name: bridgeName,
        },
      },
      // Connected devices count sensor
      {
        name: `${bridgeName} Connected Devices`,
        unique_id: `${bridgeId}_devices`,
        // state_topic: `${config.topic}${bridgeId}/devices_count`,
        icon: 'mdi:devices',
        entity_category: 'diagnostic',
        device: {
          identifiers: [bridgeId],
          name: bridgeName,
        },
      },
      // Status sensor
      {
        name: `${bridgeName} Status`,
        unique_id: `${bridgeId}_status`,
        // state_topic: `${config.topic}${bridgeId}/status`,
        icon: 'mdi:bridge',
        entity_category: 'diagnostic',
        device: {
          identifiers: [bridgeId],
          name: bridgeName,
        },
      },
    ];
  }

  async destroy(): Promise<void> {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }
}
