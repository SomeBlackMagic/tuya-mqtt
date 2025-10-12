import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { DeviceConfig, DpsData } from '../types';
import { IDeviceStateHandler } from '../interfaces/device-handler.interface';

const debug = require('debug')('tuya-mqtt:state');
const debugError = require('debug')('tuya-mqtt:error');

export class DeviceStateHandler implements IDeviceStateHandler {
  private readonly logger = new Logger('DeviceState');
  private dps: Record<string, DpsData> = {};
  private config: DeviceConfig;
  private onStateUpdatedCallback?: (updatedKeys: string[]) => void;
  private isInitialStateSet = false;

  constructor(config: DeviceConfig) {
    this.config = config;
  }

  setStateUpdatedCallback(callback: (updatedKeys: string[]) => void): void {
    this.onStateUpdatedCallback = callback;
  }

  setInitialState(data: any): void {
    debug('setInitialState() for device ' + this.config.id);
    if (typeof data.dps !== 'undefined') {
      debug('data.dps exists:', JSON.stringify(data.dps));
      for (const key in data.dps) {
        if (!this.dps[key]) {
          debug(`Creating new DPS entry for key ${key}`);
          this.dps[key] = {
            val: data.dps[key],
            updated: false,
          };
        }
      }
      this.isInitialStateSet = true;
    }
  }

  updateState(data: any): void {
    const updatedKeys: string[] = [];
    debug('updateState() for device ' + this.config.id);

    if (typeof data.dps !== 'undefined') {
      // Call setInitialState on first dps data
      if (!this.isInitialStateSet) {
        this.setInitialState(data);
      }

      debug('data.dps exists:', JSON.stringify(data.dps));
      for (const key in data.dps) {
        if (!this.dps[key]) {
          debug(`Creating new DPS entry for key ${key}`);
          this.dps[key] = {} as DpsData;
        }

        if (this.dps[key].val !== data.dps[key]) {
          const oldVal = this.dps[key].val;
          const newVal = data.dps[key];
          this.dps[key] = {
            val: newVal,
            updated: true,
          };
          this.logger.log(
            `📤 State change: device=${this.config.name || this.config.id}, dps.${key}: ${oldVal} → ${newVal}`,
          );
          updatedKeys.push(key);
        } else {
          debug(`Value unchanged for key ${key}: ${data.dps[key]}`);
        }
      }

      debug('Updated keys:', updatedKeys);
      debug('Final this.dps state:', JSON.stringify(this.dps));

      if (updatedKeys.length > 0) {
        if (this.config.persist) {
          this.saveState();
        }
        debug('Calling onStateUpdatedCallback with keys:', updatedKeys);
        this.onStateUpdatedCallback?.(updatedKeys);
      } else {
        debug('No keys were updated, callback not called');
      }
    } else {
      debugError(
        'No dps info in data. Received data structure:',
        JSON.stringify(data),
      );
    }
  }

  getDpsValue(key: string): any {
    return this.dps[key]?.val;
  }

  getAllDps(): Record<string, DpsData> {
    return this.dps;
  }

  restoreState(): void {
    if (this.config.persist) {
      debug('Restoring saved state for device ' + this.config.id);
      try {
        const dpsData = fs.readFileSync('./persist/' + this.config.id, 'utf8');
        this.dps = JSON.parse(dpsData);
        debug('Restored state for device ' + this.config.id);
        debug(dpsData);

        for (const key of Object.keys(this.dps)) {
          this.dps[key].updated = true;
        }
      } catch (e) {
        debugError('Error restoring persist data:');
        debugError(e);
      }
    }
  }

  saveState(): void {
    debug('Saving persist data for device ' + this.config.id);
    const data = JSON.stringify(this.dps);

    if (!fs.existsSync('./persist')) {
      fs.mkdir('./persist', (error) => {
        if (error) {
          debugError('Error creating persist directory:' + error);
          return;
        }
      });
    }

    fs.writeFile('./persist/' + this.config.id, data, (error) => {
      if (error) {
        debugError('Error saving persist file: ' + error);
      } else {
        debug('Persist data saved');
      }
    });
  }

  markAsPublished(key: string): void {
    if (this.dps[key]) {
      this.dps[key].updated = false;
    }
  }

  markAllAsPublished(): void {
    for (const key in this.dps) {
      this.dps[key].updated = false;
    }
  }

  hasUpdates(): boolean {
    return Object.values(this.dps).some((dpsData) => dpsData.updated);
  }

  getUpdatedKeys(): string[] {
    return Object.keys(this.dps).filter((key) => this.dps[key].updated);
  }
}
