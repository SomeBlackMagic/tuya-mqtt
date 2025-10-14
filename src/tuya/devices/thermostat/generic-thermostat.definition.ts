import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericThermostatDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
