import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericHeaterDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
