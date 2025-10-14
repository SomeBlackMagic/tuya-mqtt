import { BaseDeviceDefinition } from '../base-device-definition';

export class GenericElectricFireplaceDefinition extends BaseDeviceDefinition {
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
