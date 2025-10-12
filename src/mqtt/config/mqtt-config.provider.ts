import { Injectable } from '@nestjs/common';
import { MqttConfig } from '../types/mqtt.types';

@Injectable()
export class MqttConfigProvider {
  getMqttConfig(): MqttConfig {
    // TODO: ConfigService can be connected here to read from environment variables
    return {
      host: process.env.MQTT_HOST || 'localhost',
      port: parseInt(process.env.MQTT_PORT || '1883', 10),
      mqtt_user: process.env.MQTT_USER,
      mqtt_pass: process.env.MQTT_PASSWORD,
      lwtTopic: process.env.MQTT_LWT_TOPIC || 'bridge/state',
      qos: parseInt(process.env.MQTT_QOS || '1', 10),
      retain: process.env.MQTT_RETAIN === 'true',
    };
  }
}
