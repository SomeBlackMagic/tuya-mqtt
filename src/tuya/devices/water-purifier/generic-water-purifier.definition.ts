import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericWaterPurifierDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
