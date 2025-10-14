import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericCatToiletDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
