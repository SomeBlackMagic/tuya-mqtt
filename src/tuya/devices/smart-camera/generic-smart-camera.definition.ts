import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericSmartCameraDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
