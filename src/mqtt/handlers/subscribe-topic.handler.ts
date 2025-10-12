import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SubscribeTopicCommand } from '../commands/subscribe-topic.command';
import { MqttService } from '../mqtt.service';

@CommandHandler(SubscribeTopicCommand)
export class SubscribeTopicHandler
  implements ICommandHandler<SubscribeTopicCommand>
{
  private readonly logger = new Logger(SubscribeTopicHandler.name);

  constructor(private readonly mqttService: MqttService) {}

  async execute(command: SubscribeTopicCommand): Promise<void> {
    this.logger.debug(
      `Subscribing to topic(s): ${Array.isArray(command.topic) ? command.topic.join(', ') : command.topic}`,
    );
    await this.mqttService.subscribe(command.topic);
  }
}
