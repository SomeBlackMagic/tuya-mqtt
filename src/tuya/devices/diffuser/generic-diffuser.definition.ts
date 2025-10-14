import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericDiffuserDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
