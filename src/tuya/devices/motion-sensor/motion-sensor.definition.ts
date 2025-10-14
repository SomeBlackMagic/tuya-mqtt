import {BaseDeviceDefinition} from "../base-device-definition";
import {TuyaDeviceId} from "../../types/tuya.types";

/**
 * Motion Sensor Device Definition
 * Model: HW400B
 * Category: pir (Passive Infrared Sensor)
 *
 * Handles human motion detection sensor
 * This definition handles only Tuya-specific device information
 */
@TuyaDeviceId('MotionSensor')
export class MotionSensorDefinition extends BaseDeviceDefinition {
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

    this.registerFunctionalDataDpsSchema(dpsMotionState, {
      id: dpsMotionState,
      code: 'pir',
      name: 'Motion Detected',
      type: 'Enum',
      mode: 'ro',
      values: { none: 'No Motion', pir: 'Motion Detected' },
    })

    this.registerFunctionalDataDpsSchema(dpsBatteryPercentage, {
      id: dpsBatteryPercentage,
      code: 'battery_percentage',
      name: 'Battery Percentage',
      type: 'Integer',
      mode: 'ro',
      unit: '%',
    })

    this.registerFunctionalDataDpsSchema(dpsSensitivity, {
      id: dpsSensitivity,
      code: 'sensitivity',
      name: 'Sensitivity',
      type: 'Enum',
      mode: 'rw',
      values: { low: 'Low', medium: 'Medium', high: 'High' },
    })

    this.registerFunctionalDataDpsSchema(dpsTemperature, {
      id: dpsTemperature,
      code: 'va_temperature',
      name: 'Temperature',
      type: 'Integer',
      mode: 'ro',
      unit: '°C',
    })

    this.registerFunctionalDataDpsSchema(dpsHumidity, {
      id: dpsHumidity,
      code: 'va_humidity',
      name: 'Humidity',
      type: 'Integer',
      mode: 'ro',
      unit: '%',
    })


    this.registerFunctionalDataStandardFunctions(['pir', 'battery_percentage', 'va_temperature', 'va_humidity'])

    this.registerFunctionalDataCustomFunctions(['sensitivity'])

  }

}
