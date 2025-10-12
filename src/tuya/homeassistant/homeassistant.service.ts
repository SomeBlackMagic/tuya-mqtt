import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  HomeAssistantDeviceInfo,
  HomeAssistantEntityConfig,
  SwitchConfig,
  SelectConfig,
  ButtonConfig,
  SensorConfig,
} from './homeassistant.types';

const debug = require('debug')('tuya-mqtt:homeassistant');
const debugDiscovery = require('debug')('tuya-mqtt:discovery');

@Injectable()
export class HomeAssistantService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Publish a Home Assistant discovery message
   */
  publishDiscovery(
    entityType: 'switch' | 'select' | 'button' | 'sensor',
    deviceId: string,
    entityId: string,
    payload: HomeAssistantEntityConfig,
  ): void {
    const configTopic = `homeassistant/${entityType}/${deviceId}_${entityId}/config`;

    debugDiscovery(`Home Assistant config topic: ${configTopic}`);
    debugDiscovery(payload);

    this.eventEmitter.emit('message.publish', {
      route: configTopic,
      message: JSON.stringify(payload),
      retain: true,
    });
  }

  /**
   * Publish switch discovery
   */
  publishSwitchDiscovery(
    deviceId: string,
    entityId: string,
    name: string,
    baseTopic: string,
    deviceInfo: HomeAssistantDeviceInfo,
    icon?: string,
  ): void {
    const payload: SwitchConfig = {
      name,
      state_topic: `${baseTopic}${entityId}`,
      command_topic: `${baseTopic}${entityId}/command`,
      availability_topic: `${baseTopic}status`,
      payload_on: 'ON',
      payload_off: 'OFF',
      payload_available: 'online',
      payload_not_available: 'offline',
      unique_id: `${deviceId}_${entityId}`,
      device: deviceInfo,
      icon: icon || 'mdi:power',
    };

    this.publishDiscovery('switch', deviceId, entityId, payload);
  }

  /**
   * Publish select discovery
   */
  publishSelectDiscovery(
    deviceId: string,
    entityId: string,
    name: string,
    baseTopic: string,
    deviceInfo: HomeAssistantDeviceInfo,
    options: string[],
    icon?: string,
  ): void {
    const payload: SelectConfig = {
      name,
      state_topic: `${baseTopic}${entityId}`,
      command_topic: `${baseTopic}${entityId}/command`,
      availability_topic: `${baseTopic}status`,
      options,
      payload_available: 'online',
      payload_not_available: 'offline',
      unique_id: `${deviceId}_${entityId}`,
      device: deviceInfo,
      icon: icon || 'mdi:form-select',
    };

    this.publishDiscovery('select', deviceId, entityId, payload);
  }

  /**
   * Publish button discovery
   */
  publishButtonDiscovery(
    deviceId: string,
    entityId: string,
    name: string,
    baseTopic: string,
    deviceInfo: HomeAssistantDeviceInfo,
    icon?: string,
  ): void {
    const payload: ButtonConfig = {
      name,
      command_topic: `${baseTopic}${entityId}/command`,
      availability_topic: `${baseTopic}status`,
      payload_press: 'PRESS',
      payload_available: 'online',
      payload_not_available: 'offline',
      unique_id: `${deviceId}_${entityId}`,
      device: deviceInfo,
      icon: icon || 'mdi:gesture-tap-button',
    };

    this.publishDiscovery('button', deviceId, entityId, payload);
  }

  /**
   * Publish sensor discovery
   */
  publishSensorDiscovery(
    deviceId: string,
    entityId: string,
    name: string,
    baseTopic: string,
    deviceInfo: HomeAssistantDeviceInfo,
    options: {
      unit_of_measurement?: string;
      device_class?: string | any;
      state_class?: string | any;
      icon?: string;
    } = {},
  ): void {
    const payload: SensorConfig = {
      name,
      state_topic: `${baseTopic}${entityId}`,
      availability_topic: `${baseTopic}status`,
      payload_available: 'online',
      payload_not_available: 'offline',
      unique_id: `${deviceId}_${entityId}`,
      device: deviceInfo,
      icon: options.icon || 'mdi:information',
      ...options,
    };

    this.publishDiscovery('sensor', deviceId, entityId, payload);
  }
}
