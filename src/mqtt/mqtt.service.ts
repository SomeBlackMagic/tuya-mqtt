import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as mqtt from 'mqtt';
import { MqttConfig, DeviceCommand } from './types/mqtt.types';
import type { MqttMessage } from './types/mqtt.types';
import { MqttConfigProvider } from './config/mqtt-config.provider';
import { QoS } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private mqttClient: mqtt.MqttClient | null = null;
  private config: MqttConfig | null = null;
  private isInitializing = false;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configProvider: MqttConfigProvider,
  ) {
    this.logger.log('MQTT Service initialized');
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing MQTT connection on module start');
    this.isInitializing = true;

    try {
      const config = this.configProvider.getMqttConfig();
      await this.connect(config);
      this.logger.log(
        'MQTT connection successfully established during module initialization',
      );
    } catch (error) {
      this.logger.error(
        'Failed to establish MQTT connection during module initialization',
        error,
      );
      // Don't terminate the application, but log critical error
      this.eventEmitter.emit('mqtt.connection.failed', error);
      throw error; // This will stop application initialization if MQTT is critical
    } finally {
      this.isInitializing = false;
    }
  }

  async connect(config: MqttConfig): Promise<void> {
    if (this.mqttClient?.connected) {
      this.logger.warn('MQTT client is already connected');
      return;
    }

    if (this.mqttClient && !this.mqttClient.connected) {
      this.logger.log('Disconnecting existing MQTT client');
      await this.disconnect();
    }

    this.config = config;

    return new Promise((resolve, reject) => {
      try {
        this.logger.log(
          `Connecting to MQTT broker at ${config.host}:${config.port}`,
        );

        this.mqttClient = mqtt.connect({
          host: config.host,
          port: config.port,
          username: config.mqtt_user,
          password: config.mqtt_pass,
          connectTimeout: 30 * 1000, // 30 seconds
          reconnectPeriod: 1000, // 1 second
          // will: {
          //   topic: config.topic + config.lwtTopic,
          //   payload: 'Offline',
          //   qos: config.qos,
          //   retain: true
          // }
        });

        // Successful connection handler
        this.mqttClient.once('connect', () => {
          this.logger.log('MQTT connection established successfully');
          resolve();
        });

        // Connection error handler
        this.mqttClient.once('error', (error) => {
          this.logger.error('MQTT connection error:', error);
          reject(error);
        });

        // Set up event handlers
        this.mqttClient.on('connect', this.onConnect.bind(this));
        this.mqttClient.on('reconnect', this.onReconnect.bind(this));
        this.mqttClient.on('error', this.onError.bind(this));
        this.mqttClient.on('message', this.onMessage.bind(this));
        this.mqttClient.on('close', this.onClose.bind(this));
      } catch (error) {
        this.logger.error('Failed to initialize MQTT connection', error);
        reject(error);
      }
    });
  }

  async publish(
    topic: string,
    message: string,
    options: { qos?: number; retain?: boolean } = {},
  ): Promise<void> {
    if (!this.mqttClient || !this.mqttClient.connected) {
      throw new Error('MQTT client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.mqttClient!.publish(
        topic,
        message,
        {
          qos: (options.qos as QoS) || (this.config?.qos as QoS) || (1 as QoS),
          retain: options.retain || this.config?.retain || false,
        },
        (error) => {
          if (error) {
            this.logger.error(`Failed to publish to topic ${topic}:`, error);
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
  }

  async subscribe(topic: string | string[]): Promise<void> {
    if (!this.mqttClient || !this.mqttClient.connected) {
      throw new Error('MQTT client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.mqttClient!.subscribe(topic, (error) => {
        if (error) {
          this.logger.error(`Failed to subscribe to topic(s) ${topic}:`, error);
          reject(error);
        } else {
          this.logger.debug(
            `Subscribed to topic(s): ${Array.isArray(topic) ? topic.join(', ') : topic}`,
          );
          resolve();
        }
      });
    });
  }

  private async onConnect(): Promise<void> {
    if (!this.config) return;

    this.logger.log('Connection established to MQTT server');

    // Publish LWT
    // await this.publish(this.config.topic + this.config.lwtTopic, 'Online', { qos: this.config.qos, retain: true });

    // Subscribe to basic topics - specific topic subscriptions will be handled by other modules
    const topics = ['homeassistant/status', 'hass/status'];

    for (const topic of topics) {
      await this.subscribe(topic);
    }

    // Emit connection event so other modules can subscribe to their topics
    this.eventEmitter.emit('mqtt.connected');
  }

  @OnEvent('mqtt.subscribe')
  async handleMqttSubscribe(data: { topic: string | string[] }): Promise<void> {
    try {
      await this.subscribe(data.topic);
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to topic(s) ${data.topic}:`,
        error,
      );
    }
  }

  private onReconnect(): void {
    if (this.mqttClient?.connected) {
      this.logger.log(
        'Connection to MQTT server lost. Attempting to reconnect...',
      );
    } else {
      this.logger.log('Unable to connect to MQTT server');
    }
  }

  private onError(error: Error): void {
    this.logger.error('MQTT connection error:', error);
    if (this.isInitializing) {
      this.eventEmitter.emit('mqtt.connection.error', error);
    }
  }

  private onClose(): void {
    this.logger.warn('MQTT connection closed');
    this.eventEmitter.emit('mqtt.disconnected');
  }

  private async onMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const messageStr = message.toString();
      const splitTopic = topic.split('/');
      const topicLength = splitTopic.length;
      const suffix = splitTopic[topicLength - 1];
      const commandTopic = splitTopic[2];
      const deviceId = splitTopic[1];

      if (topic === 'homeassistant/status' || topic === 'hass/status') {
        this.logger.log(`Home Assistant status: ${messageStr}`);
        if (messageStr === 'online') {
          this.eventEmitter.emit('homeassistant.online');
        }
      } else if (suffix === 'command') {
        // Legacy format: device.command event
        const deviceCommand: DeviceCommand = {
          deviceId,
          commandTopic,
          message: messageStr,
          topicParts: splitTopic,
        };
        this.logger.log(
          `📥 Command: device=${deviceId}, topic=${commandTopic}, payload=${messageStr}`,
        );
        this.eventEmitter.emit('device.command', deviceCommand);
      }

      // Emit mqtt.message event for all messages (new unified format)
      this.eventEmitter.emit('mqtt.message', {
        topic,
        message: messageStr,
      });
    } catch (error) {
      this.logger.error('Error processing MQTT message:', error);
    }
  }

  async processDeviceCommand(deviceCommand: DeviceCommand): Promise<void> {
    this.logger.debug(
      `Processing device command: ${JSON.stringify(deviceCommand)}`,
    );
    // Emit event for processing in other modules
    this.eventEmitter.emit('device.command.processed', deviceCommand);
  }

  isConnected(): boolean {
    return this.mqttClient?.connected === true;
  }

  @OnEvent('mqtt.publish')
  async handleMqttPublish(message: MqttMessage): Promise<void> {
    try {
      await this.publish(message.topic, message.message, {
        qos: message.qos,
        retain: message.retain,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish MQTT message to topic ${message.topic}:`,
        error,
      );
    }
  }

  @OnEvent('message.publish')
  async handleMessagePublish(data: {
    route: string;
    message: string;
    retain?: boolean;
  }): Promise<void> {
    try {
      await this.publish(data.route, data.message, {
        retain: data.retain ?? true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish message to route ${data.route}:`,
        error,
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.mqttClient) {
      // if (this.config) {
      //   await this.publish(this.config.topic + this.config.lwtTopic, 'Offline', { qos: this.config.qos, retain: true });
      // }

      return new Promise((resolve) => {
        // @ts-ignore
        this.mqttClient!.end(() => {
          this.logger.log('MQTT client disconnected');
          resolve();
        });
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }
}
