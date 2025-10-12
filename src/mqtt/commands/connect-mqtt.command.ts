import { MqttConfig } from '../types/mqtt.types';

export class ConnectMqttCommand {
  constructor(public readonly config: MqttConfig) {}
}
