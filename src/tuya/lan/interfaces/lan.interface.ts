import {CommonDeviceConfig} from "../../types/tuya.types";
import TuyAPI from "tuyapi";

export interface LanModuleConfig {
  devicesFile: string
}

// Parameters for local (LAN) connection
export interface LocalDeviceConfig extends CommonDeviceConfig {
  type:string;
  name: string;
  ip: string;                 // Current device IP address
  localKey: string;           // AES encryption key
  protocolVersion: '2.2' | '3.1' | '3.3' | '3.4' | '3.5'; // Protocol version
  timeout?: number;           // Response timeout (ms)
  retry?: number;             // Number of retry attempts
  heartbeatInterval?: number; // Heartbeat sending interval (ms)
}


export interface TuyAPIConnectOptions {
  ip?: string;
  port?: number;
  id: string;
  gwID?: string;
  key: string;
  productKey?: string;
  version?: number|string;
  nullPayloadOnJSONError?: boolean;
  issueGetOnConnect?: boolean;
  issueRefreshOnConnect?: boolean;
  issueRefreshOnPing?: boolean;
  metadata?: {
    name?: string;
  }
}
