export interface DeviceConfig {
  id: string;
  key: string;
  name?: string;
  ip?: string;
  port?: number;
  version?: string;
  type?: string;
  issueGetOnConnect?: boolean;
  issueRefreshOnConnect?: boolean;
  shouldWaitForResponse?: boolean;
  template?: Record<string, DeviceTopic>;
}

// export interface DeviceInfo {
//   configDevice: DeviceConfig;
//   eventEmitter: any;
//   topic: string;
//   bridgeId: string;
// }

export interface DeviceTopic {
  key: number;
  type: 'bool' | 'int' | 'float' | 'str' | 'hsb' | 'hsbhex';
  topicMin?: number;
  topicMax?: number;
  stateMath?: string;
  commandMath?: string;
  components?: string;
}

export interface DpsData {
  val: TuyaDpsValue;
  updated: boolean;
}

export interface TuyaCommand {
  dps: number;
  set: TuyaDpsValue;
  cid?: string;
  shouldWaitForResponse?: boolean;
}

export interface TuyaEvent {
  dps: Record<string, TuyaDpsValue>;
  time?: number;
  cid?: string;

  // set: any;
  // cid?: string;
  // shouldWaitForResponse?: boolean;
}

export type TuyaDpsValue = boolean|'0'|'1'|'on'|'off';

// export interface ColorState {
//   h: number;
//   s: number;
//   b: number;
// }

export interface DeviceData {
  ids: string[];
  name: string;
  mf: string;
  mdl?: string;
  via_device: string;
}

export interface SubDevice {
  onConnected(): void;
  onDisconnected(): void;
  onData(data: TuyaEvent): void;
}
