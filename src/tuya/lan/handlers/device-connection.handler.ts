import TuyAPI from 'tuyapi';
import {  TuyaCommand } from '../types';
import { Utils } from '../utils';
import { IDeviceConnectionHandler } from '../interfaces/device-handler.interface';
import {TuyAPIConnectOptions} from "../interfaces/lan.interface";

const debug = require('debug')('tuya-mqtt:connection');
const debugError = require('debug')('tuya-mqtt:error');

export class DeviceConnectionHandler implements IDeviceConnectionHandler {
  private readonly device: TuyAPI;
  private connected: boolean = false;
  private heartbeatTimer: NodeJS.Timeout;
  private heartbeatsMissed: number = 0;
  private reconnecting: boolean = false;

  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onDataCallback?: (data: any) => void;
  private onErrorCallback?: (error: Error) => void;

  constructor(
    private readonly config: TuyAPIConnectOptions,
  ) {
    this.device = new TuyAPI(JSON.parse(JSON.stringify(this.config)));
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.device.on('connected', () => {
      debug('Connected to device ' + this.toString());
      this.connected = true;
      this.heartbeatsMissed = 0;
      this.monitorHeartbeat();
      this.onConnectedCallback?.();
    });

    this.device.on('disconnected', () => {
      debug('Disconnected from device ' + this.toString());
      this.connected = false;
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }
      this.onDisconnectedCallback?.();
    });

    this.device.on('error', async (err: Error) => {
      debugError(this.toString() + ' ' + err);
      this.onErrorCallback?.(err);
      await Utils.sleep(1);
      this.reconnect();
    });

    this.device.on('heartbeat', () => {
      this.heartbeatsMissed = 0;
    });

    this.device.on('data', (data: any) => this.onDataCallback?.(data));
    this.device.on('dp-refresh', (data: any) => this.onDataCallback?.(data));

  }

  setCallbacks(callbacks: {
    onConnected?: () => void;
    onDisconnected?: () => void;
    onData?: (data: any) => void;
    onError?: (error: Error) => void;
  }): void {
    this.onConnectedCallback = callbacks.onConnected;
    this.onDisconnectedCallback = callbacks.onDisconnected;
    this.onDataCallback = callbacks.onData;
    this.onErrorCallback = callbacks.onError;
  }

  async connect(): Promise<void> {
    debug('Search for device id ' + this.config.id);
    try {
      await this.device.find();
      debug('Found device id ' + this.config.id);
      await this.device.connect();
    } catch (error) {
      debugError(this.toString() + ' ' + error.message);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.device && this.connected) {
      this.device.disconnect();
    }
  }

  async reconnect(): Promise<void> {
    if (!this.reconnecting) {
      this.reconnecting = true;
      debugError('Error connecting to device id ' + this.config.id + '...retry in 10 seconds.');
      await Utils.sleep(10);
      try {
        await this.connect();
      } catch (error) {
        debugError('Failed to reconnect: ' + error.message);
        await Utils.sleep(60);
        this.reconnect();
      }
      this.reconnecting = false;
    }
  }

  isConnected(): boolean {
    return this.connected && this.device?.isConnected();
  }

  get(options: any = {}): void {
    debug('Requesting data for ' + this.toString() + (options.cid === undefined ? '' : ' cid: ' + options.cid));
    this.device.get(options);
  }

  refresh(options: any = {}): void {
    debug('Requesting refresh for ' + this.toString() + (options.cid === undefined ? '' : ' cid: ' + options.cid));
    this.device.refresh(options);
  }

  async set(command: TuyaCommand): Promise<any> {
    // if (this.config.shouldWaitForResponse !== undefined) {
    //   command.shouldWaitForResponse = this.config.shouldWaitForResponse;
    // }
    // debug('Set device ' + this.toString() + ' -> ' + JSON.stringify(command));
    return this.device.set(command);
  }

  private monitorHeartbeat(): void {
    debug('Starting heartbeat monitoring');
    this.heartbeatTimer = setInterval(async () => {
      if (this.connected) {
        if (this.heartbeatsMissed > 3) {
          debugError('Device id ' + this.config.id + ' not responding to heartbeats...disconnecting',);
          this.device.disconnect();
          await Utils.sleep(1);
          this.connect().catch((err) =>
            debugError('Reconnect failed: ' + err.message),
          );
        } else if (this.heartbeatsMissed > 0) {
          const errMessage = this.heartbeatsMissed > 1 ? ' heartbeats' : ' heartbeat';
          debugError('Device id ' + this.config.id + ' has missed ' + this.heartbeatsMissed + errMessage,
          );
        }
        this.heartbeatsMissed++;
      }
    }, 10000);
  }

  private toString(): string {
    return (
      this.config.metadata?.name +
      ' (' +
      (this.config.ip ? this.config.ip + ', ' : '') +
      this.config.id +
      ')'
    );
  }
}
