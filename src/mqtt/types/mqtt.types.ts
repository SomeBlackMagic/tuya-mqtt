export interface MqttConfig {
  host: string;
  port: number;
  mqtt_user?: string;
  mqtt_pass?: string;
  lwtTopic: string;
  qos: number;
  retain: boolean;
}

export interface MqttMessage {
  topic: string;
  message: string;
  qos?: number;
  retain?: boolean;
}

export interface DeviceCommand {
  deviceId: string;
  commandTopic: string;
  message: string;
  topicParts: string[];
}
