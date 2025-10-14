import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericSmartIndoorGardenDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
