import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericSmartMilkKettleDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
