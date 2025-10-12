export interface BridgeDevice {
  identifiers: string[];
  name: string;
  model: string;
  manufacturer: string;
  sw_version: string;
  configuration_url: string;
}

export interface BridgeSensorConfig {
  name: string;
  unique_id: string;
  state_topic?: string;
  device_class?: string;
  icon?: string;
  entity_category?: string;
  device: {
    identifiers: string[];
    name: string;
  };
}

export interface BridgeStats {
  uptime: string;
  devicesCount: number;
  status: string;
}

export interface BridgeConfig {
  bridgeId: string;
  bridgeName: string;
}
