import { DeviceTopic, TuyaCommand, ColorState, DpsData } from '../types';

export interface IDeviceConnectionHandler {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  isConnected(): boolean;
  get(options?: any): void;
  refresh(options?: any): void;
  set(command: TuyaCommand): Promise<any>;
}

export interface IDeviceStateHandler {
  updateState(data: any): void;
  getDpsValue(key: string): any;
  getAllDps(): Record<string, DpsData>;
  restoreState(): void;
  saveState(): void;
}

export interface IDeviceMqttHandler {
  publishTopics(): void;
  processCommand(message: string): void;
  processDpsCommand(message: string): void;
  processDpsKeyCommand(message: string, dpsKey: string): void;
  publishMqtt(topic: string, message: string, options?: any): void;
}

export interface IDeviceColorHandler {
  updateColorState(value: string): void;
  parseColorCommand(command: string, components: string): string;
  setLight(topic: DeviceTopic, command: TuyaCommand): Promise<void>;
  getColorState(): ColorState;
}
