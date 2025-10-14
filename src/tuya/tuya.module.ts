import { Module, forwardRef } from '@nestjs/common';
import { TuyaService } from './tuya.service';
import { BridgeModule } from './bridge/bridge.module';
import { LocalApiModule } from './localApi/local-api.module';
import { TuyaConfigProvider } from './config/tuya-config.provider';
import { HomeAssistantModule } from '../homeassistant/homeassistant.module';

@Module({
  imports: [
    forwardRef(() => BridgeModule),
    LocalApiModule,
    HomeAssistantModule,
  ],
  providers: [TuyaService, TuyaConfigProvider],
  exports: [TuyaService, TuyaConfigProvider],
})
export class TuyaModule {}
