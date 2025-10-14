import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericPetFountainDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
