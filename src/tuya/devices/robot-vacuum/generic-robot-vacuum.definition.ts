import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericRobotVacuumDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
