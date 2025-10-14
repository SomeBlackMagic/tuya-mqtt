import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericPetBallThrowerDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
