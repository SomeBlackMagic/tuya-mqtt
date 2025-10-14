import {Logger} from '@nestjs/common';
import {TuyaDpsValue, TuyaEvent} from '../types';
import {IDeviceStateHandler} from '../interfaces/device-handler.interface';

const debug = require('debug')('tuya-mqtt:state');
const debugError = require('debug')('tuya-mqtt:error');

export class DeviceStateHandler implements IDeviceStateHandler {
  private readonly logger = new Logger('DeviceState');
  private dps: Record<string, DpsStateData> = {};

  private onStateUpdatedCallback?: (updatedKeys: string[]) => void;
  private isInitialStateSet = false;

  constructor(
    private readonly id: string
  ) {

  }

  setStateUpdatedCallback(callback: (updatedKeys: string[]) => void): void {
    this.onStateUpdatedCallback = callback;
  }

  setInitialState(data: any): void {
    debug('setInitialState() for device ' + this.id);
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

  updateState(data: TuyaEvent): void {
    const updatedKeys: string[] = [];
    debug('updateState() for device ' + this.id);

    if (typeof data.dps !== 'undefined') {
      // Call setInitialState on first dps data
      if (!this.isInitialStateSet) {
        this.setInitialState(data);
      }

      debug('data.dps exists:', JSON.stringify(data.dps));
      for (const key in data.dps) {
        if (!this.dps[key]) {
          debug(`Creating new DPS entry for key ${key}`);
          this.dps[key] = {} as DpsStateData;
        }

        if (this.dps[key].val !== data.dps[key]) {
          const oldVal = this.dps[key].val;
          const newVal = data.dps[key];
          this.dps[key] = {
            val: newVal,
            updated: true,
          };
          this.logger.log(
            `📤 State change: device=${this.id}, dps.${key}: ${oldVal} → ${newVal}`,
          );
          updatedKeys.push(key);
        } else {
          debug(`Value unchanged for key ${key}: ${data.dps[key]}`);
        }
      }

      debug('Updated keys:', updatedKeys);

      if (updatedKeys.length > 0) {
        this.saveState();
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

  getAllDps(): Record<string, DpsStateData> {
    return this.dps;
  }

  restoreState(): void {
    // if (this.config.persist) {
    //   debug('Restoring saved state for device ' + this.config.id);
    //   try {
    //     const dpsData = fs.readFileSync('./persist/' + this.config.id, 'utf8');
    //     this.dps = JSON.parse(dpsData);
    //     debug('Restored state for device ' + this.config.id);
    //     debug(dpsData);
    //
    //     for (const key of Object.keys(this.dps)) {
    //       this.dps[key].updated = true;
    //     }
    //   } catch (e) {
    //     debugError('Error restoring persist data:');
    //     debugError(e);
    //   }
    // }
  }

  saveState(): void {
    // if (this.config.persist) {
    //
    //   debug('Saving persist data for device ' + this.config.id);
    //   const data = JSON.stringify(this.dps);
    //
    //   if (!fs.existsSync('./persist')) {
    //     fs.mkdir('./persist', (error) => {
    //       if (error) {
    //         debugError('Error creating persist directory:' + error);
    //         return;
    //       }
    //     });
    //   }
    //
    //   fs.writeFile('./persist/' + this.config.id, data, (error) => {
    //     if (error) {
    //       debugError('Error saving persist file: ' + error);
    //     } else {
    //       debug('Persist data saved');
    //     }
    //   });
    // }
  }
}

export interface DpsStateData {
  val: TuyaDpsValue;
  updated: boolean;
}
