import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericElectricBlanketDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
