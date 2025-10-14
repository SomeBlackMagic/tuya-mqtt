import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericLightDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
