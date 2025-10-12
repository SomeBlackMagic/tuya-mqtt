import { DeviceConfig } from '../types';
import { BaseDeviceDriver, DeviceDriverCallbacks } from './base-device-driver';
import { ComputerPowerSwitchDriver } from './computer-power-switch.driver';
import { DefaultDriver } from './default.driver';
import { HomeAssistantService } from '../../homeassistant/homeassistant.service';
import { HomeAssistantDeviceInfo } from '../../homeassistant/homeassistant.types';

const debug = require('debug')('tuya-mqtt:factory');

/**
 * Factory for creating device-specific drivers based on device type
 */
export class DeviceDriverFactory {
  /**
   * Create a device driver instance based on device type
   *
   * @param config Device configuration
   * @param baseRoute Base route for the device
   * @param deviceData Device data for Home Assistant discovery
   * @param callbacks Callbacks for driver to communicate with TuyaDevice
   * @param homeAssistantService Optional Home Assistant service for discovery
   * @returns Device driver instance or null if no specific driver exists
   */
  static createDriver(
    config: DeviceConfig,
    baseRoute: string,
    deviceData: HomeAssistantDeviceInfo,
    callbacks: DeviceDriverCallbacks,
    homeAssistantService?: HomeAssistantService,
  ): BaseDeviceDriver {
    debug(`Creating driver for device type: ${config.type || 'generic'}`);

    switch (config.type) {
      case 'ComputerPowerSwitch':
        return new ComputerPowerSwitchDriver(
          config,
          baseRoute,
          deviceData,
          callbacks,
          homeAssistantService,
        );

      default:
        debug(
          `No specific driver found for device type: ${config.type || 'generic'}`,
        );
        return new DefaultDriver(
          config,
          baseRoute,
          deviceData,
          callbacks,
          homeAssistantService,
        );
    }
  }

  /**
   * Get list of supported device types
   */
  static getSupportedTypes(): string[] {
    return [
      'computer-power-switch',
      'computer_power_switch',
      'jh-usb',
      // Add more as implemented
    ];
  }

  /**
   * Check if a device type has a specific driver
   */
  static hasDriver(deviceType: string): boolean {
    const testCallbacks: DeviceDriverCallbacks = {
      publishMessage: () => {},
      sendCommand: () => {},
    };

    const testDeviceInfo: HomeAssistantDeviceInfo = {
      identifiers: ['test'],
      name: 'test',
      manufacturer: 'test',
      via_device: 'test',
    };

    return (
      this.createDriver(
        { id: 'test', key: 'test', type: deviceType },
        '',
        testDeviceInfo,
        testCallbacks,
      ) !== null
    );
  }
}
