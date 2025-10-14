import {BaseDeviceDefinition} from "../devices/base-device-definition";

export interface TuyaModuleConfig {
  baseTopic: string;
}

export interface CommonDeviceConfig {
  deviceId: string;           // Unique Tuya device ID
  mode: 'lan' | 'cloud' | 'auto'; // Selected control mode
  pollInterval?: number;      // State polling interval (ms)
}

import { Type } from '@nestjs/common';
import { deviceRegistry } from '../devices/device.registry';

/**
 * Decorator to register a device driver in the registry
 * @param id - Unique device type identifier
 */
export function TuyaDeviceId(id: string) {
  return function <T extends Type<BaseDeviceDefinition>>(ctor: T) {
    // Store the device ID as a static property
    (ctor as any).deviceId = id;

    // Register the driver in the registry
    deviceRegistry.register(id, ctor);

    return ctor;
  };
}


/**
 * Data Point Specification (DPS) entry defining a single data point with its properties and constraints.
 * DPS represents individual controllable or readable parameters of a Tuya device.
 */
export interface DpsSchemaItem {
  /** Unique identifier for the data point within the device */
  id: string | number;

  /** Standardized code name for the data point (e.g., "switch", "brightness", "temperature") */
  code: string;

  /** Human-readable display name for the data point */
  name?: string;

  /** Data type of the value this data point accepts */
  type: 'Boolean' | 'Integer' | 'Enum' | 'String' | 'Json' | 'Raw';

  /** Access mode: read-write, read-only, or write-only */
  mode: 'rw' | 'ro' | 'wo';

  /** Key-value pairs defining possible enum values and their display names */
  values?: Record<string, string>;

  /** Minimum allowed value for integer types */
  min?: number;

  /** Maximum allowed value for integer types */
  max?: number;

  /** Step increment for integer values (e.g., 1, 5, 10) */
  step?: number;

  /** Decimal scaling factor (0 for integers, 1 for 0.1 precision, 2 for 0.01 precision) */
  scale?: number;

  /** Unit of measurement for display purposes (e.g., "°C", "%", "W", "s") */
  unit?: string;
}

/**
 * Device network connectivity and communication information.
 * Contains current network status and connection parameters.
 */
export interface DeviceNetworkInfo {
  /** Current network connection status of the device */
  connectionStatus: 'online' | 'offline';

  /** Device IP address on the local network */
  ip?: string;

  /** Network port used for device communication */
  port?: number;

  /** Media Access Control (MAC) address for network identification */
  macAddress?: string;
}

/**
 * Device firmware and version information.
 * Contains details about device software and hardware versions.
 */
export interface DeviceFirmwareInfo {
  /** Current firmware version running on the device */
  firmwareVersion?: string;

  /** Microcontroller unit (MCU) version or firmware version */
  mcuVersion?: string;

  /** Hardware revision or version identifier */
  hardwareVersion?: string;

  /** Tuya protocol version used for communication (e.g., "3.3", "3.4", "3.5") */
  protocolVersion?: string;
}

/**
 * Device capabilities, data points, and supported functions.
 * Defines what the device can do and how to interact with it.
 */
export interface DeviceFunctionalData {
  /** Dictionary mapping DPS (Data Point Specification) IDs to their schema definitions, describing available device controls and sensors */
  dpsSchema?: Record<string, DpsSchemaItem>;

  /** Array of standard Tuya platform functions supported by the device (e.g., "switch", "brightness") */
  standardFunctions?: string[];

  /** Array of custom or device-specific functions not part of standard Tuya specifications */
  customFunctions?: string[];
}

/**
 * Basic device identification and metadata information.
 * Contains human-readable information and device categorization.
 */
export interface DeviceMetadata {
  /** Human-readable device name for display purposes */
  name?: string;

  /** Device type identifier (e.g., "kg" for switch, "dj" for light) used for driver selection and device categorization */
  deviceType?: string;

  /** Human-readable category name (e.g., "Switch", "Light", "Air Conditioner") derived from deviceType */
  category?: string;

  /** Indicates whether the device supports scene automation and linkage functionality */
  sceneLinkage?: boolean;

  /** Defines if push notifications are enabled for this device */
  pushNotificationEnabled?: boolean;


}

export const DeviceCategoryNames: Record<string, string> = {
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
