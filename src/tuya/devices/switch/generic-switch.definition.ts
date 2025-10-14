import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericSwitchDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
