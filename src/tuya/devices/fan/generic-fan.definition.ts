import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericFanDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
