import { Injectable } from '@nestjs/common';
import { BridgeConfig } from '../types/bridge.types';

@Injectable()
export class BridgeConfigProvider {
  getBridgeConfig(): BridgeConfig {
    return {
      bridgeId: process.env.MQTT_BRIDGE_ID || 'tuya-mqtt',
      bridgeName: process.env.MQTT_BRIDGE_NAME || 'Tuya MQTT Bridge',
    };
  }
}
