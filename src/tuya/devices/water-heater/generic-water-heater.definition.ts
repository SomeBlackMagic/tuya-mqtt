import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericWaterHeaterDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
