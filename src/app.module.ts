import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttModule } from './mqtt/mqtt.module';
import { TuyaModule } from './tuya/tuya.module';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [CqrsModule, EventEmitterModule.forRoot(), MqttModule, TuyaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
