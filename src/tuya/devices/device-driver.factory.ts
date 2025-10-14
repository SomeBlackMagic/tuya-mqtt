import { DeviceConfig } from '../types';
import { BaseDeviceDriver, DeviceDriverCallbacks } from './base-device-driver';
import { ComputerPowerSwitchDriver } from './computer-power-switch.driver';
import { DefaultDriver } from './default.driver';

const debug = require('debug')('tuya-mqtt:factory');

/**
 * Factory for creating device-specific drivers based on device type
 */
export class DeviceDriverFactory {
  /**
   * Create a device driver instance based on the device type
   *
   * @param config Device configuration
   * @param callbacks Callbacks for driver to communicate with TuyaDevice
   * @returns Device driver instance
   */
  static createDriver(
    config: DeviceConfig,
    callbacks: DeviceDriverCallbacks,
  ): BaseDeviceDriver {
    debug(`Creating driver for device type: ${config.type || 'generic'}`);

    switch (config.type) {
      case 'ComputerPowerSwitch':
        return new ComputerPowerSwitchDriver(config, callbacks);

      default:
        debug(
          `No specific driver found for device type: ${config.type || 'generic'}`,
        );
        return new DefaultDriver(config, callbacks);
    }
  }
}
