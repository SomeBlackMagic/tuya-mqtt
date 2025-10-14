import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericTowelRackDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
