import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericAirPurifierDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
