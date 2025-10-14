import {TuyaDeviceId} from "../../types/tuya.types";
import {BaseDeviceDefinition} from "../base-device-definition";

/**
 * Computer Power Switch Device Definition
 * Model: JH-usb (Tuya/eWeLink)
 *
 * Controls computer power, USB ports, and various power management features
 * This definition handles only Tuya-specific device information
 */
@TuyaDeviceId('ComputerPowerSwitch')
export class ComputerPowerSwitchDefinition extends BaseDeviceDefinition {


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

    this.registerFunctionalDataDpsSchema(dpsPowerSwitch, {
      id: dpsPowerSwitch,
      code: 'switch_1',
      name: 'Computer Power Switch',
      type: 'Boolean',
      mode: 'rw',
    })

    this.registerFunctionalDataDpsSchema(dpsUsbSwitch, {
      id: dpsUsbSwitch,
      code: 'switch_usb',
      name: 'USB Power Switch',
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

    this.registerFunctionalDataDpsSchema(dpsChildLock, {
      id: dpsChildLock,
      code: 'child_lock',
      name: 'Child Lock',
      type: 'Boolean',
      mode: 'rw',
    })

    this.registerFunctionalDataDpsSchema(dpsResetMode, {
      id: dpsResetMode,
      code: 'reset_mode',
      name: 'Reset Mode',
      type: 'Enum',
      mode: 'wo',
      values: { Reset: 'Soft Reset', forceReset: 'Force Reset' },
    })

    this.registerFunctionalDataDpsSchema(dpsRFRemote, {
      id: dpsRFRemote,
      code: 'rf_remote',
      name: 'RF Remote Control',
      type: 'Enum',
      mode: 'rw',
      values: { on: 'On', off: 'Off' },
    })

    this.registerFunctionalDataStandardFunctions(['switch_1', 'switch_usb', 'relay_status', 'child_lock'])

    this.registerFunctionalDataCustomFunctions(['reset_mode', 'rf_remote'])

  }
}
