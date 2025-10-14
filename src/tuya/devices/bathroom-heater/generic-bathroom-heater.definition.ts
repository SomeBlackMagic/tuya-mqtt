import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericBathroomHeaterDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
