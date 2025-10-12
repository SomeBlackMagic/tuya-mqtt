import { BaseDeviceDriver } from './base-device-driver';

const debug = require('debug')('tuya-mqtt:device');

/**
 * Computer Power Switch Device Driver
 * Model: JH-usb (Tuya/eWeLink)
 *
 * Controls computer power, USB ports, and various power management features
 */
export class ComputerPowerSwitchDriver extends BaseDeviceDriver {
  async init(): Promise<void> {
    // Set device-specific DPS values with defaults based on specification
    const dpsPowerSwitch = this.config.dpsPowerSwitch || 1;
    const dpsUsbSwitch = this.config.dpsUsbSwitch || 7;
    const dpsPowerOnBehavior = this.config.dpsPowerOnBehavior || 38;
    const dpsChildLock = this.config.dpsChildLock || 40;
    const dpsResetMode = this.config.dpsResetMode || 101;
    const dpsRFRemote = this.config.dpsRFRemote || 102;

    // Update device data with model-specific information
    this.deviceData.model = 'JH-usb';
    this.deviceData.manufacturer = 'Tuya/eWeLink';
    this.deviceData.serial_number = '0wwwgfhmcjepvs10';

    // Map DPS to route names
    this.deviceRoutes = {
      computer_power: {
        key: dpsPowerSwitch,
        type: 'bool',
      },
      usb_power: {
        key: dpsUsbSwitch,
        type: 'bool',
      },
      power_on_behavior: {
        key: dpsPowerOnBehavior,
        type: 'enum',
        values: ['off', 'on', 'memory'],
      },
      child_lock: {
        key: dpsChildLock,
        type: 'bool',
      },
      reset_mode: {
        key: dpsResetMode,
        type: 'enum',
        values: ['Reset', 'forceReset', '0'],
      },
      rf_remote: {
        key: dpsRFRemote,
        type: 'enum',
        values: ['on', 'off'],
      },
    };

    // Initialize Home Assistant discovery
    this.initDiscovery();

    debug(`Computer Power Switch driver initialized for ${this.config.id}`);
  }

  protected initDiscovery(): void {
    const baseName = this.config.name || this.config.id;

    // Computer power switch discovery
    this.publishSwitchDiscovery(
      'computer_power',
      `${baseName} Computer Power`,
      'Computer power control switch',
    );

    // USB power switch discovery
    this.publishSwitchDiscovery(
      'usb_power',
      `${baseName} USB Power`,
      'USB port power control',
    );

    // Child lock discovery
    this.publishSwitchDiscovery(
      'child_lock',
      `${baseName} Child Lock`,
      'Prevents accidental power changes',
    );

    // Power-on behavior discovery (select entity)
    this.publishSelectDiscovery(
      'power_on_behavior',
      `${baseName} Power-on Behavior`,
      'Computer behavior after power loss',
      ['off', 'on', 'memory'],
    );

    // Reset mode discovery (button entities for different reset types)
    this.publishButtonDiscovery(
      'reset_soft',
      `${baseName} Soft Reset`,
      'Perform soft computer reset',
    );

    this.publishButtonDiscovery(
      'reset_force',
      `${baseName} Force Reset`,
      'Perform forced computer reset',
    );

    // RF Remote discovery (select entity)
    this.publishSelectDiscovery(
      'rf_remote',
      `${baseName} RF Remote`,
      'RF remote control enable/disable',
      ['on', 'off'],
    );
  }

  protected getIcon(entityId: string): string {
    const icons: Record<string, string> = {
      computer_power: 'mdi:desktop-tower',
      usb_power: 'mdi:usb-port',
      child_lock: 'mdi:lock',
      power_on_behavior: 'mdi:power-settings',
      reset_soft: 'mdi:restart',
      reset_force: 'mdi:power-cycle',
      rf_remote: 'mdi:remote',
    };
    return icons[entityId] || 'mdi:toggle-switch';
  }

  /**
   * Override processTopicCommand to handle reset buttons
   */
  // processTopicCommand(message: string, commandTopic: string): boolean {
  //   // Handle reset buttons specially
  //   if (commandTopic === 'reset_soft' && message === 'PRESS') {
  //     const resetModeTopic = this.deviceTopics.reset_mode;
  //     if (resetModeTopic) {
  //       this.sendTuyaCommand('Reset', resetModeTopic);
  //     }
  //     return true;
  //   } else if (commandTopic === 'reset_force' && message === 'PRESS') {
  //     const resetModeTopic = this.deviceTopics.reset_mode;
  //     if (resetModeTopic) {
  //       this.sendTuyaCommand('forceReset', resetModeTopic);
  //     }
  //     return true;
  //   }
  //
  //   // Call parent method for other commands
  //   return super.processTopicCommand(message, commandTopic);
  // }
}
