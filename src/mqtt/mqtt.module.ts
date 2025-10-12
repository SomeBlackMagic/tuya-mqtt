import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MqttService } from './mqtt.service';
import { MqttConfigProvider } from './config/mqtt-config.provider';
import {
  ConnectMqttHandler,
  PublishMessageHandler,
  SubscribeTopicHandler,
  ProcessDeviceCommandHandler,
} from './handlers';

const CommandHandlers = [
  ConnectMqttHandler,
  PublishMessageHandler,
  SubscribeTopicHandler,
  ProcessDeviceCommandHandler,
];

@Module({
  imports: [CqrsModule, EventEmitterModule.forRoot()],
  providers: [MqttService, MqttConfigProvider, ...CommandHandlers],
  exports: [MqttService, MqttConfigProvider],
})
export class MqttModule {}
