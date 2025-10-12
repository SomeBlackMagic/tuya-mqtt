/**
 * Abstract messaging interfaces for device communication
 * These interfaces are transport-agnostic and don't depend on MQTT or any specific message broker
 */

/**
 * Device message route definition - maps device capabilities to communication channels
 */
export interface DeviceMessageRoute {
  key: number; // DPS key
  type: 'bool' | 'int' | 'float' | 'str' | 'enum';
  values?: string[];
}

/**
 * Callbacks for a device driver to communicate with the outside world
 */
export interface DeviceDriverCallbacks {
  publishMessage: (route: string, message: string, retain?: boolean) => void;
  sendCommand: (dps: number, value: any) => void;
}
