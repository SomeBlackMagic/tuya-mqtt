import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericPowerStripDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
