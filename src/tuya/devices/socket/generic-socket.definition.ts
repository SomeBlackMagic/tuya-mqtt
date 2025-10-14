import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericSocketDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
