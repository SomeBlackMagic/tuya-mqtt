import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericCurtainDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
