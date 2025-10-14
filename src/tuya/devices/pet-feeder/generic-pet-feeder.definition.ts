import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericPetFeederDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
