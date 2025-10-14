import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericPetTreatFeederDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
