import { BaseDeviceDriver } from './base-device-driver';

const debug = require('debug')('tuya-mqtt:device');

/**
 * Smart Plug Device Driver
 * Model: WP3-B (Gosund)
 * Category: cz (Socket/Plug)
 *
 * Controls smart plug power and related features
 * This driver handles only Tuya-specific device information
 */
export class SmartPlugDriver extends BaseDeviceDriver {
  async init(): Promise<void> {
    // Set device-specific DPS values with defaults based on specification
    const dpsPowerSwitch = 1;
    const dpsCountdown = 9;
    const dpsChildLock = 16;
    const dpsPowerOnBehavior = 38;
    const dpsLedIndicator = 39;

    // Set device metadata (Tuya device information only)
    this.metadata = {
      name: this.config.name,
      deviceType: 'SmartPlug',
      category: 'cz',
      // model: 'WP3-B',
      // productName: 'Mini Smart Plug',
    };

    // Set functional data with DPS schema (Tuya-specific)
    this.functionalData = {
      dpsSchema: {
        [dpsPowerSwitch]: {
          id: dpsPowerSwitch,
          code: 'switch_1',
          name: 'Power Switch',
          type: 'Boolean',
          mode: 'rw',
        },
        [dpsCountdown]: {
          id: dpsCountdown,
          code: 'countdown_1',
          name: 'Countdown Timer',
          type: 'Integer',
          mode: 'rw',
          unit: 's',
        },
        [dpsChildLock]: {
          id: dpsChildLock,
          code: 'child_lock',
          name: 'Child Lock',
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
        [dpsLedIndicator]: {
          id: dpsLedIndicator,
          code: 'light',
          name: 'LED Indicator',
          type: 'Enum',
          mode: 'rw',
          values: { none: 'Off', relay: 'Follow Switch', pos: 'Always On' },
        },
      },
      standardFunctions: ['switch_1', 'countdown_1', 'relay_status'],
      customFunctions: ['child_lock', 'light'],
    };
  }
}
