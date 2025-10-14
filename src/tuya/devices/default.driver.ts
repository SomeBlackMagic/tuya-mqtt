import { BaseDeviceDriver } from './base-device-driver';

const debug = require('debug')('tuya-mqtt:device');

/**
 * Default Device Driver
 *
 * Used for devices without specific driver implementation
 * Provides basic Tuya device information and category mapping
 *
 * Supported Tuya Categories:
 * - dj: Light
 * - kg: Switch
 * - kt: Air conditioner
 * - sp: Smart camera
 * - ms: Residential lock
 * - sd: Robot vacuum
 * - kj: Air purifier
 * - rs: Water heater
 * - cz: Socket
 * - cl: Curtain
 * - fs: Fan
 * - js: Water purifier
 * - pir: Motion sensor
 * And many more...
 */
export class DefaultDriver extends BaseDeviceDriver {
  // Category code to name mapping based on Tuya standard description
  private static readonly CATEGORY_NAMES: Record<string, string> = {
    dj: 'Light',
    kg: 'Switch',
    kt: 'Air Conditioner',
    sp: 'Smart Camera',
    ms: 'Residential Lock',
    sd: 'Robot Vacuum',
    kj: 'Air Purifier',
    rs: 'Water Heater',
    cz: 'Socket',
    cl: 'Curtain',
    fs: 'Fan',
    js: 'Water Purifier',
    pir: 'Motion Sensor',
    wk: 'Thermostat',
    pc: 'Power Strip',
    jtmspro: 'Dehumidifier',
    jsq: 'Humidifier',
    xxj: 'Diffuser',
    cs: 'Pet Feeder',
    sfkzq: 'Irrigator',
    dlq: 'Electric Blanket',
    hj: 'Door/Window Controller',
    qn: 'Heater',
    zndb: 'Bathroom Heater',
    bhqz: 'Smart Milk Kettle',
    mjj: 'Cat Toilet',
    cjq: 'Pet Fountain',
    cwwsq: 'Pet Ball Thrower',
    cwlsq: 'Pet Treat Feeder',
    ylj: 'Towel Rack',
    znbl: 'Electric Fireplace',
    znzwy: 'Smart Indoor Garden',
  };

  async init(): Promise<void> {
    const category = this.config.category || 'unknown';
    const categoryName = DefaultDriver.CATEGORY_NAMES[category] || 'Unknown Device';

    // Set device metadata (Tuya device information only)
    this.metadata = {
      name: this.config.name,
      deviceType: 'DefaultDevice',
      category: category,
      categoryName: categoryName,
    };


    // Basic DPS schema for common data points across Tuya devices
    this.functionalData = {
      dpsSchema: {
        1: {
          id: 1,
          code: 'switch',
          name: 'Power Switch',
          type: 'Boolean',
          mode: 'rw',
        },
        2: {
          id: 2,
          code: 'countdown',
          name: 'Countdown',
          type: 'Integer',
          mode: 'rw',
          unit: 's',
        },
        3: {
          id: 3,
          code: 'mode',
          name: 'Mode',
          type: 'Enum',
          mode: 'rw',
        },
        4: {
          id: 4,
          code: 'battery_percentage',
          name: 'Battery Percentage',
          type: 'Integer',
          mode: 'ro',
          unit: '%',
        },
        9: {
          id: 9,
          code: 'countdown_1',
          name: 'Countdown Timer',
          type: 'Integer',
          mode: 'rw',
          unit: 's',
        },
        20: {
          id: 20,
          code: 'switch_1',
          name: 'Switch 1',
          type: 'Boolean',
          mode: 'rw',
        },
        21: {
          id: 21,
          code: 'switch_2',
          name: 'Switch 2',
          type: 'Boolean',
          mode: 'rw',
        },
        22: {
          id: 22,
          code: 'switch_3',
          name: 'Switch 3',
          type: 'Boolean',
          mode: 'rw',
        },
        38: {
          id: 38,
          code: 'relay_status',
          name: 'Power-on Behavior',
          type: 'Enum',
          mode: 'rw',
          values: { off: 'Off', on: 'On', memory: 'Memory' },
        },
        40: {
          id: 40,
          code: 'child_lock',
          name: 'Child Lock',
          type: 'Boolean',
          mode: 'rw',
        },
      },
      standardFunctions: ['switch', 'countdown', 'mode'],
      customFunctions: [],
    };
  }
}
