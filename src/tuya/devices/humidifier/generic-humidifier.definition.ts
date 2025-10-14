import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericHumidifierDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
