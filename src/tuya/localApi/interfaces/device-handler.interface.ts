import { TuyaCommand, DpsData } from '../types';

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
