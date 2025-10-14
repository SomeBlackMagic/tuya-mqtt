import { BaseDeviceDriver } from './base-device-driver';
import {DpsSchemaItem} from "../types";

const debug = require('debug')('tuya-mqtt:device');

/**
 * Computer Power Switch Device Driver
 * Model: JH-usb (Tuya/eWeLink)
 *
 * Controls computer power, USB ports, and various power management features
 * This driver handles only Tuya-specific device information
 */
export class ComputerPowerSwitchDriver extends BaseDeviceDriver {


  async init(): Promise<void> {
    // Set device-specific DPS values with defaults based on specification
    const dpsPowerSwitch = 1;
    const dpsUsbSwitch = 7;
    const dpsPowerOnBehavior = 38;
    const dpsChildLock = 40;
    const dpsResetMode = 101;
    const dpsRFRemote = 102;

    // Set device metadata (Tuya device information only)
    this.metadata = {
      name: this.config.name,
      deviceType: 'ComputerPowerSwitch',
      category: 'switch',
    };

    // Set functional data with DPS schema (Tuya-specific)
    this.functionalData = {
      dpsSchema: {
        [dpsPowerSwitch]: {
          id: dpsPowerSwitch,
          code: 'switch_1',
          name: 'Computer Power Switch',
          type: 'Boolean',
          mode: 'rw',
        },
        [dpsUsbSwitch]: {
          id: dpsUsbSwitch,
          code: 'switch_usb',
          name: 'USB Power Switch',
          type: 'Boolean',
          mode: 'rw',
        },
        [dpsPowerOnBehavior]: {
          id: dpsPowerOnBehavior,
          code: 'relay_status',
          name: 'Power-on Behavior',
          type: 'Enum',
          mode: 'rw',
          values: { off: 'Off', on: 'On', memory: 'Memory' },
        },
        [dpsChildLock]: {
          id: dpsChildLock,
          code: 'child_lock',
          name: 'Child Lock',
          type: 'Boolean',
          mode: 'rw',
        },
        [dpsResetMode]: {
          id: dpsResetMode,
          code: 'reset_mode',
          name: 'Reset Mode',
          type: 'Enum',
          mode: 'wo',
          values: { Reset: 'Soft Reset', forceReset: 'Force Reset' },
        },
        [dpsRFRemote]: {
          id: dpsRFRemote,
          code: 'rf_remote',
          name: 'RF Remote Control',
          type: 'Enum',
          mode: 'rw',
          values: { on: 'On', off: 'Off' },
        },
      },
      standardFunctions: [
        'switch_1',
        'switch_usb',
        'relay_status',
        'child_lock',
      ],
      customFunctions: ['reset_mode', 'rf_remote'],
    };
  }
}
