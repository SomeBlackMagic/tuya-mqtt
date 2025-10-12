import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ProcessDeviceCommandCommand } from '../commands/process-device-command.command';
import { MqttService } from '../mqtt.service';

@CommandHandler(ProcessDeviceCommandCommand)
export class ProcessDeviceCommandHandler
  implements ICommandHandler<ProcessDeviceCommandCommand>
{
  private readonly logger = new Logger(ProcessDeviceCommandHandler.name);

  constructor(private readonly mqttService: MqttService) {}

  async execute(command: ProcessDeviceCommandCommand): Promise<void> {
    this.logger.debug(
      `Processing device command for device: ${command.deviceCommand.deviceId}`,
    );
    await this.mqttService.processDeviceCommand(command.deviceCommand);
  }
}
