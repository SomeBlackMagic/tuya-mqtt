export interface TuyaModuleConfig {
  baseTopic: string;
}

export interface CommonDeviceConfig {
  deviceId: string;           // Unique Tuya device ID
  mode: 'lan' | 'cloud' | 'auto'; // Selected control mode
  pollInterval?: number;      // State polling interval (ms)
}


// DPS Schema definition for a single data point
export interface DpsSchemaItem {
  id: string | number;
  code: string;
  name?: string;
  type: 'Boolean' | 'Integer' | 'Enum' | 'String' | 'Json' | 'Raw';
  mode: 'rw' | 'ro' | 'wo'; // read-write, read-only, write-only
  values?: Record<string, string>; // For enum types
  min?: number; // For integer types
  max?: number; // For integer types
  step?: number; // For integer types
  scale?: number; // Scaling factor (e.g., 0 for integers, 1 for 0.1 precision)
  unit?: string; // Unit of measurement
}

// Device network information (3)
export interface DeviceNetworkInfo {
  connectionStatus: 'online' | 'offline';
  ip?: string;
  port?: number;
  macAddress?: string;
}

// Device firmware and configuration (4)
export interface DeviceFirmwareInfo {
  firmwareVersion?: string;
  mcuVersion?: string;
  hardwareVersion?: string;
  protocolVersion?: string;
}

// Device functional data (5)
export interface DeviceFunctionalData {
  dpsSchema?: Record<string, DpsSchemaItem>;
  standardFunctions?: string[];
  customFunctions?: string[];
}

// Device additional metadata (6)
export interface DeviceMetadata {
  name?: string;
  deviceType?: string;
  category?: string;
  sceneLinkage?: boolean;
  pushNotificationEnabled?: boolean;
}
