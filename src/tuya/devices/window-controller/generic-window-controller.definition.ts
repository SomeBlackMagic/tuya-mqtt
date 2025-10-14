import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericWindowControllerDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
