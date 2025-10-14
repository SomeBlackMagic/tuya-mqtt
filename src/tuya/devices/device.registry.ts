import { Type } from '@nestjs/common';
import { BaseDeviceDefinition } from './base-device-definition';

/**
 * Registry for device drivers
 * Maps device type IDs to their corresponding driver classes
 */
class DeviceRegistry {
  private readonly drivers = new Map<string, Type<BaseDeviceDefinition>>();

  /**
   * Register a device driver class
   */
  register(deviceId: string, driver: T): void {
    if (this.drivers.has(deviceId)) {
      console.warn(
        `Device driver for "${deviceId}" is already registered. Overwriting.`,
      );
    }
    this.drivers.set(deviceId, driver);
  }

  /**
   * Get a device driver class by device ID
   */
  get(deviceId: string): Type<BaseDeviceDefinition> | undefined {
    return this.drivers.get(deviceId);
  }

  /**
   * Get all registered device IDs
   */
  getAllDeviceIds(): string[] {
    return Array.from(this.drivers.keys());
  }

  /**
   * Check if a device ID is registered
   */
  has(deviceId: string): boolean {
    return this.drivers.has(deviceId);
  }

  /**
   * Get all registered drivers
   */
  getAllDrivers(): Map<string, Type<BaseDeviceDefinition>> {
    return new Map(this.drivers);
  }
}

// Singleton instance
export const deviceRegistry = new DeviceRegistry();
