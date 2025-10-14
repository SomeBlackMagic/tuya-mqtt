import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericResidentialLockDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
