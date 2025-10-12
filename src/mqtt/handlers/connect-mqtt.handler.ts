import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConnectMqttCommand } from '../commands/connect-mqtt.command';
import { MqttService } from '../mqtt.service';

@CommandHandler(ConnectMqttCommand)
export class ConnectMqttHandler implements ICommandHandler<ConnectMqttCommand> {
  private readonly logger = new Logger(ConnectMqttHandler.name);

  constructor(private readonly mqttService: MqttService) {}

  async execute(command: ConnectMqttCommand): Promise<void> {
    this.logger.log('Executing MQTT connection command');
    await this.mqttService.connect(command.config);
  }
}
