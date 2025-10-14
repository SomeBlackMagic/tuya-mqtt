import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericIrrigatorDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
