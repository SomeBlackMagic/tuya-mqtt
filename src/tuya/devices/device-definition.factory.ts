
import { BaseDeviceDefinition, DeviceDefinitionCallbacks } from './base-device-definition';
import { deviceRegistry } from './device.registry';
import {LocalDeviceConfig} from "../lan/interfaces/lan.interface";

// Import all definitions to ensure they are registered


const debug = require('debug')('tuya-mqtt:factory');

/**
 * Factory for creating device-specific definitions based on device type
 * Uses the device registry populated by @TuyaDeviceId decorators
 */
export class DeviceDefinitionFactory {
  /**
   * Create a device definition instance based on the device type
   *
   * @param config Device configuration
   * @param callbacks Callbacks for a definition to communicate with TuyaDevice
   * @returns Device definition instance
   */
  public static createDefinition(
    config: LocalDeviceConfig,
    callbacks: DeviceDefinitionCallbacks,
  ): BaseDeviceDefinition {
    const deviceType = config.type || 'Default';
    debug(`Creating definition for device type: ${deviceType}`);

    // Try to get definition from registry
    const DefinitionClass = deviceRegistry.get(deviceType);

    if (DefinitionClass) {
      debug(`Found registered definition for type: ${deviceType}`);
      return new DefinitionClass(config, callbacks);
    }

    // Fallback to a Default definition
    debug(`No specific definition found for device type: ${deviceType}, using Default definition`);
    const DefaultDefinitionClass = deviceRegistry.get('Default');

    if (!DefaultDefinitionClass) {
      throw new Error('Default definition not registered in device registry');
    }

    return new DefaultDefinitionClass(config, callbacks);
  }

  /**
   * Get all registered device types
   */
  static getRegisteredDeviceTypes(): string[] {
    return deviceRegistry.getAllDeviceIds();
  }
}
