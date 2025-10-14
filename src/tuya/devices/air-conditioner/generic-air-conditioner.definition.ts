import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericAirConditionerDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
