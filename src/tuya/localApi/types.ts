export interface DeviceConfig {
  id: string;
  key: string;
  name?: string;
  ip?: string;
  version?: string;
  type?: string;
  persist?: boolean;
  retain?: boolean;
  allowMerge?: boolean;
  issueGetOnConnect?: boolean;
  issueRefreshOnConnect?: boolean;
  shouldWaitForResponse?: boolean;
  template?: Record<string, DeviceTopic>;

  // Device specific configs
  dpsPower?: number;
  dpsBrightness?: number;
  brightnessScale?: number;
  dpsColor?: number;
  dpsMode?: number;
  dpsWhiteValue?: number;
  dpsColorTemp?: number;
  colorType?: 'hsb' | 'hsbhex';

  // Computer Power Switch specific configs
  dpsPowerSwitch?: number;
  dpsUsbSwitch?: number;
  dpsPowerOnBehavior?: number;
  dpsChildLock?: number;
  dpsResetMode?: number;
  dpsRFRemote?: number;
}

export interface DeviceInfo {
  configDevice: DeviceConfig;
  eventEmitter: any;
  topic: string;
  bridgeId: string;
}

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
  val: any;
  updated: boolean;
}

export interface TuyaCommand {
  dps: number;
  set: any;
  cid?: string;
  shouldWaitForResponse?: boolean;
}

export interface ColorState {
  h: number;
  s: number;
  b: number;
}

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
  onData(data: any): void;
}
