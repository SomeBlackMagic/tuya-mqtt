import { Module, forwardRef } from '@nestjs/common';
import { LocalApiService } from './local-api.service';
import { TuyaModule } from '../tuya.module';
import { BridgeModule } from '../bridge/bridge.module';
import { HomeAssistantModule } from '../../homeassistant/homeassistant.module';

@Module({
  imports: [
    forwardRef(() => TuyaModule),
    forwardRef(() => BridgeModule),
    HomeAssistantModule,
  ],
  providers: [LocalApiService],
  exports: [LocalApiService],
})
export class LocalApiModule {}
