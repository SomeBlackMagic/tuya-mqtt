import { DeviceCommand } from '../types/mqtt.types';

export class ProcessDeviceCommandCommand {
  constructor(public readonly deviceCommand: DeviceCommand) {}
}
