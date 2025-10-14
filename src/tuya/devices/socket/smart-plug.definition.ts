import { TuyaDeviceId } from '../../types/tuya.types';
import { BaseDeviceDefinition } from '../base-device-definition';

/**
 * Smart Plug Device Definition
 * Model: WP3-B (Gosund)
 * Category: cz (Socket/Plug)
 *
 * Controls smart plug power and related features
 * This definition handles only Tuya-specific device information
 */
@TuyaDeviceId('SmartPlug')
export class SmartPlugDefinition extends BaseDeviceDefinition {
  async init(): Promise<void> {
    // Set device-specific DPS values with defaults based on specification
    const dpsPowerSwitch = 1;
    const dpsCountdown = 9;
    const dpsChildLock = 16;
    const dpsPowerOnBehavior = 38;
    const dpsLedIndicator = 39;

    // Set device metadata (Tuya device information only)
    // this.metadata = {
    //   name: this.config.name,
    //   deviceType: 'SmartPlug',
    //   category: 'cz',
    //   // model: 'WP3-B',
    //   // productName: 'Mini Smart Plug',
    // };

    this.registerFunctionalDataDpsSchema(dpsPowerSwitch, {
      id: dpsPowerSwitch,
      code: 'switch_1',
      name: 'Power Switch',
      type: 'Boolean',
      mode: 'rw',
    })

    this.registerFunctionalDataDpsSchema(dpsCountdown, {
      id: dpsCountdown,
      code: 'countdown_1',
      name: 'Countdown Timer',
      type: 'Integer',
      mode: 'rw',
      unit: 's',
    })

    this.registerFunctionalDataDpsSchema(dpsChildLock, {
      id: dpsChildLock,
      code: 'child_lock',
      name: 'Child Lock',
      type: 'Boolean',
      mode: 'rw',
    })

    this.registerFunctionalDataDpsSchema(dpsPowerOnBehavior, {
      id: dpsPowerOnBehavior,
      code: 'relay_status',
      name: 'Power-on Behavior',
      type: 'Enum',
      mode: 'rw',
      values: { off: 'Off', on: 'On', memory: 'Memory' },
    })

    this.registerFunctionalDataDpsSchema(dpsLedIndicator, {
      id: dpsLedIndicator,
      code: 'light',
      name: 'LED Indicator',
      type: 'Enum',
      mode: 'rw',
      values: { none: 'Off', relay: 'Follow Switch', pos: 'Always On' },
    })

    this.registerFunctionalDataStandardFunctions(['switch_1', 'countdown_1', 'relay_status'])

    this.registerFunctionalDataCustomFunctions(['child_lock', 'light'])

  }
}
