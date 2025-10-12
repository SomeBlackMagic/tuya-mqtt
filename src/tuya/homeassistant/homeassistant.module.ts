import { Module } from '@nestjs/common';
import { HomeAssistantService } from './homeassistant.service';

@Module({
  providers: [HomeAssistantService],
  exports: [HomeAssistantService],
})
export class HomeAssistantModule {}
