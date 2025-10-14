import { BaseDeviceDriver } from './base-device-driver';

const debug = require('debug')('tuya-mqtt:device');

/**
 * Motion Sensor Device Driver
 * Model: HW400B
 * Category: pir (Passive Infrared Sensor)
 *
 * Handles human motion detection sensor
 * This driver handles only Tuya-specific device information
 */
export class MotionSensorDriver extends BaseDeviceDriver {
  async init(): Promise<void> {
    // Set device-specific DPS values with defaults based on PIR sensor specification
    const dpsMotionState = 1;
    const dpsBatteryPercentage =  4;
    const dpsSensitivity = 9;
    const dpsTemperature = 11;
    const dpsHumidity = 12;

    // Set device metadata (Tuya device information only)
    this.metadata = {
      name: this.config.name,
      deviceType: 'MotionSensor',
      category: 'pir',
      // model: 'HW400B',
      // productName: '人体运动传感器',
    };

    // Set functional data with DPS schema (Tuya-specific)
    this.functionalData = {
      dpsSchema: {
        [dpsMotionState]: {
          id: dpsMotionState,
          code: 'pir',
          name: 'Motion Detected',
          type: 'Enum',
          mode: 'ro',
          values: { none: 'No Motion', pir: 'Motion Detected' },
        },
        [dpsBatteryPercentage]: {
          id: dpsBatteryPercentage,
          code: 'battery_percentage',
          name: 'Battery Percentage',
          type: 'Integer',
          mode: 'ro',
          unit: '%',
        },
        [dpsSensitivity]: {
          id: dpsSensitivity,
          code: 'sensitivity',
          name: 'Sensitivity',
          type: 'Enum',
          mode: 'rw',
          values: { low: 'Low', medium: 'Medium', high: 'High' },
        },
        [dpsTemperature]: {
          id: dpsTemperature,
          code: 'va_temperature',
          name: 'Temperature',
          type: 'Integer',
          mode: 'ro',
          unit: '°C',
        },
        [dpsHumidity]: {
          id: dpsHumidity,
          code: 'va_humidity',
          name: 'Humidity',
          type: 'Integer',
          mode: 'ro',
          unit: '%',
        },
      },
      standardFunctions: ['pir', 'battery_percentage', 'va_temperature', 'va_humidity'],
      customFunctions: ['sensitivity'],
    };
  }
}
