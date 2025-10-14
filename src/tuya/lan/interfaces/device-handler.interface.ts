import { TuyaCommand } from '../types';
import {DpsStateData} from "../handlers/device-state.handler";

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
  getAllDps(): Record<string, DpsStateData>;
  restoreState(): void;
  saveState(): void;
}
