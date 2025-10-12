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
 * Discovery payload for home automation platforms
 * Generic structure that can be adapted to different platforms
 */
export interface DeviceDiscoveryPayload {
  name: string;
  unique_id: string;
  state_route?: string;
  command_route?: string;
  availability_route: string;
  device: any;
  icon?: string;
  [key: string]: any;
}

/**
 * Callbacks for a device driver to communicate with the outside world
 */
export interface DeviceDriverCallbacks {
  publishMessage: (route: string, message: string, retain?: boolean) => void;
  sendCommand: (dps: number, value: any) => void;
}
