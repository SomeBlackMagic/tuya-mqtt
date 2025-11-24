import { DeviceMessageRoute } from '../../messaging/messaging.types';
import { DeviceStateManager } from './device-state.manager';

const debug = require('debug')('tuya-mqtt:device-route-manager');

export type MessagePublisher = (route: string, message: string, retain?: boolean) => void;

/**
 * Manages device routes (topics) and state publishing
 * Handles conversion between DPS values and MQTT messages
 */
export class DeviceRouteManager {
  private routes: Record<string, DeviceMessageRoute> = {};

  constructor(
    private stateManager: DeviceStateManager,
    private messagePublisher: MessagePublisher,
  ) {}

  /**
   * Register a device route
   */
  registerRoute(routeName: string, route: DeviceMessageRoute): void {
    this.routes[routeName] = route;
    debug(`Registered route: ${routeName}`, route);
  }

  /**
   * Register multiple routes at once
   */
  registerRoutes(routes: Record<string, DeviceMessageRoute>): void {
    Object.entries(routes).forEach(([name, route]) => {
      this.registerRoute(name, route);
    });
  }

  /**
   * Get a route definition by name
   */
  getRoute(routeName: string): DeviceMessageRoute | undefined {
    return this.routes[routeName];
  }

  /**
   * Get all registered route names
   */
  getAllRouteNames(): string[] {
    return Object.keys(this.routes);
  }

  /**
   * Get all routes
   */
  getAllRoutes(): Record<string, DeviceMessageRoute> {
    return { ...this.routes };
  }

  /**
   * Publish state for specific routes that were updated
   * @param updatedDpsKeys - Array of DPS keys that were updated
   */
  publishUpdatedStates(updatedDpsKeys: string[]): void {
    debug('Publishing states for updated DPS keys:', updatedDpsKeys);

    Object.entries(this.routes).forEach(([routeName, routeDef]) => {
      const dpsKey = String(routeDef.key);

      if (
        updatedDpsKeys.includes(dpsKey) ||
        updatedDpsKeys.includes(String(routeDef.key))
      ) {
        debug(`Publishing state for route: ${routeName}`);
        this.publishState(routeName);
      }
    });
  }

  /**
   * Publish state for a specific route
   */
  publishState(routeName: string): void {
    const routeDef = this.routes[routeName];
    if (!routeDef) {
      debug(`No route definition found for ${routeName}`);
      return;
    }

    const dpsValue = this.stateManager.getState(routeDef.key);

    if (dpsValue === undefined) {
      debug(`No value found for DPS key ${routeDef.key} in route ${routeName}`);
      return;
    }

    const publishValue = this.convertDpsValueToMessage(dpsValue, routeDef.type);

    debug(`Publishing to route ${routeName}: ${publishValue}`);
    this.messagePublisher(routeName, publishValue);
  }

  /**
   * Convert DPS value to publishable message based on type
   */
  private convertDpsValueToMessage(dpsValue: any, type?: string): string {
    if (type === 'bool') {
      return dpsValue ? 'ON' : 'OFF';
    } else if (type === 'enum') {
      return String(dpsValue);
    } else {
      return String(dpsValue);
    }
  }
}
