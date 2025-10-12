import { DeviceConfig } from '../types';
import {
  DeviceMessageRoute,
  DeviceDriverCallbacks,
} from '../../messaging/messaging.types';
import { HomeAssistantService } from '../../homeassistant/homeassistant.service';
import { HomeAssistantDeviceInfo } from '../../homeassistant/homeassistant.types';

const debug = require('debug')('tuya-mqtt:device');

// Export types for backward compatibility
export type DeviceTopicDefinition = DeviceMessageRoute;
export type { DeviceDriverCallbacks };

/**
 * Base class for device-specific drivers
 * Contains only device-specific configuration, topics, and communication
 * Works through callbacks to TuyaDevice instead of direct EventEmitter access
 */
export abstract class BaseDeviceDriver {
  protected config: DeviceConfig;
  protected baseRoute: string;
  protected state: Record<string, any> = {};
  protected deviceData: HomeAssistantDeviceInfo;
  protected callbacks: DeviceDriverCallbacks;
  protected homeAssistantService?: HomeAssistantService;

  // Device-specific route mappings
  protected deviceRoutes: Record<string, DeviceTopicDefinition> = {};

  constructor(
    config: DeviceConfig,
    baseRoute: string,
    deviceData: HomeAssistantDeviceInfo,
    callbacks: DeviceDriverCallbacks,
    homeAssistantService?: HomeAssistantService,
  ) {
    this.config = config;
    this.baseRoute = baseRoute;
    this.deviceData = deviceData;
    this.callbacks = callbacks;
    this.homeAssistantService = homeAssistantService;
  }

  /**
   * Initialize device-specific configuration and discovery
   */
  abstract init(): Promise<void>;

  /**
   * Initialize Home Assistant discovery for all device entities
   * Only called if homeAssistantService is available
   */
  protected abstract initDiscovery(): void;

  /**
   * Get icon for specific entity
   */
  protected abstract getIcon(entityId: string): string;

  /**
   * Update device state from DPS data
   */
  updateState(dpsData: Record<string, any>): void {
    debug('Received device state update:', dpsData);
    debug('Current deviceRoutes:', Object.keys(this.deviceRoutes));
    debug('Current state before update:', this.state);

    // Merge new DPS values into existing state
    Object.keys(dpsData).forEach((dpsKey) => {
      this.state[dpsKey] = dpsData[dpsKey];
    });

    debug('Current state after update:', this.state);

    // Publish states only for routes that were updated
    Object.keys(this.deviceRoutes).forEach((route) => {
      const routeDef = this.deviceRoutes[route];
      const dpsKey = String(routeDef.key);
      debug(
        `Checking route ${route} with DPS key ${routeDef.key} (as string: "${dpsKey}")`,
      );
      debug(`DPS data keys:`, Object.keys(dpsData));

      if (
        dpsData.hasOwnProperty(dpsKey) ||
        dpsData.hasOwnProperty(routeDef.key)
      ) {
        debug(`Publishing state for route ${route}`);
        this.publishState(route);
      }
    });
  }

  /**
   * Publish state for specific route
   */
  protected publishState(route: string): void {
    const routeDef = this.deviceRoutes[route];
    if (!routeDef) {
      debug(`No route definition found for ${route}`);
      return;
    }

    // Try both numeric and string keys since DPS keys can come as either
    const dpsKey = String(routeDef.key);
    const dpsValue = this.state[dpsKey] ?? this.state[routeDef.key];

    debug(
      `Getting state for route ${route}, DPS key ${routeDef.key}: ${dpsValue}`,
    );
    debug(`Current state keys:`, Object.keys(this.state));

    if (dpsValue === undefined) {
      debug(
        `No value found for DPS key ${routeDef.key} (tried both ${routeDef.key} and "${dpsKey}")`,
      );
      return;
    }

    let publishValue: string;

    if (routeDef.type === 'bool') {
      publishValue = dpsValue ? 'ON' : 'OFF';
    } else if (routeDef.type === 'enum') {
      publishValue = String(dpsValue);
    } else {
      publishValue = String(dpsValue);
    }

    const stateRoute = `${this.baseRoute}${route}`;
    debug(`Publishing state to ${stateRoute}: ${publishValue}`);
    this.callbacks.publishMessage(stateRoute, publishValue);
  }

  /**
   * Process incoming command
   * Returns true if command was handled, false otherwise
   */
  processCommand(message: string, commandRoute: string): boolean {
    const routeDef = this.deviceRoutes[commandRoute];
    if (!routeDef) {
      return false;
    }

    debug(`Processing command for route ${commandRoute}: ${message}`);

    let dpsValue: any;

    if (routeDef.type === 'bool') {
      dpsValue = message === 'ON' || message === 'true' || message === '1';
    } else if (routeDef.type === 'int') {
      dpsValue = parseInt(message, 10);
    } else if (routeDef.type === 'float') {
      dpsValue = parseFloat(message);
    } else if (routeDef.type === 'enum') {
      dpsValue = message;
    } else {
      dpsValue = message;
    }

    this.sendTuyaCommand(dpsValue, routeDef);
    return true;
  }

  // Backward compatibility alias
  processTopicCommand(message: string, commandTopic: string): boolean {
    return this.processCommand(message, commandTopic);
  }

  /**
   * Send command to Tuya device via callback
   */
  protected sendTuyaCommand(value: any, topicDef: DeviceTopicDefinition): void {
    this.callbacks.sendCommand(topicDef.key, value);
  }

  /**
   * Publish message via callback
   */
  protected publishMessage(
    route: string,
    message: string,
    retain: boolean = true,
  ): void {
    this.callbacks.publishMessage(route, message, retain);
  }

  // Backward compatibility alias
  protected publishMqtt(
    topic: string,
    message: string,
    retain: boolean = true,
  ): void {
    this.publishMessage(topic, message, retain);
  }

  /**
   * Helper methods for Home Assistant discovery
   * These methods delegate to HomeAssistantService if available
   */
  protected publishSwitchDiscovery(
    entityId: string,
    name: string,
    description?: string,
  ): void {
    if (!this.homeAssistantService) {
      debug('HomeAssistantService not available, skipping discovery');
      return;
    }

    this.homeAssistantService.publishSwitchDiscovery(
      this.config.id,
      entityId,
      name,
      this.baseRoute,
      this.deviceData,
      this.getIcon(entityId),
    );
  }

  protected publishSelectDiscovery(
    entityId: string,
    name: string,
    description: string,
    options: string[],
  ): void {
    if (!this.homeAssistantService) {
      debug('HomeAssistantService not available, skipping discovery');
      return;
    }

    this.homeAssistantService.publishSelectDiscovery(
      this.config.id,
      entityId,
      name,
      this.baseRoute,
      this.deviceData,
      options,
      this.getIcon(entityId),
    );
  }

  protected publishButtonDiscovery(
    entityId: string,
    name: string,
    description?: string,
  ): void {
    if (!this.homeAssistantService) {
      debug('HomeAssistantService not available, skipping discovery');
      return;
    }

    this.homeAssistantService.publishButtonDiscovery(
      this.config.id,
      entityId,
      name,
      this.baseRoute,
      this.deviceData,
      this.getIcon(entityId),
    );
  }

  protected publishSensorDiscovery(
    entityId: string,
    name: string,
    options: {
      unit_of_measurement?: string;
      device_class?: string;
      state_class?: string;
      icon?: string;
    } = {},
  ): void {
    if (!this.homeAssistantService) {
      debug('HomeAssistantService not available, skipping discovery');
      return;
    }

    this.homeAssistantService.publishSensorDiscovery(
      this.config.id,
      entityId,
      name,
      this.baseRoute,
      this.deviceData,
      {
        ...options,
        icon: options.icon || this.getIcon(entityId),
      },
    );
  }

  /**
   * Get all device routes
   */
  getDeviceRoutes(): string[] {
    return Object.keys(this.deviceRoutes);
  }

  // Backward compatibility alias
  getDeviceTopics(): string[] {
    return this.getDeviceRoutes();
  }

  /**
   * Get state for specific route
   */
  getState(route: string): any {
    const routeDef = this.deviceRoutes[route];
    if (!routeDef) return undefined;

    // Try both numeric and string keys since DPS keys can come as either
    const dpsKey = String(routeDef.key);
    return this.state[dpsKey] ?? this.state[routeDef.key];
  }

  /**
   * Get all state
   */
  getAllState(): Record<string, any> {
    return { ...this.state };
  }
}
