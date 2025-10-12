import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PublishMessageCommand } from '../commands/publish-message.command';
import { MqttService } from '../mqtt.service';

@CommandHandler(PublishMessageCommand)
export class PublishMessageHandler
  implements ICommandHandler<PublishMessageCommand>
{
  private readonly logger = new Logger(PublishMessageHandler.name);

  constructor(private readonly mqttService: MqttService) {}

  async execute(command: PublishMessageCommand): Promise<void> {
    this.logger.debug(`Publishing message to topic: ${command.topic}`);
    await this.mqttService.publish(
      command.topic,
      command.message,
      command.options,
    );
  }
}
