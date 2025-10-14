import { Module, forwardRef } from '@nestjs/common';
import { LanService } from './lan.service';
import { TuyaModule } from '../tuya.module';
import { BridgeModule } from '../bridge/bridge.module';
import { HomeAssistantModule } from '../../homeassistant/homeassistant.module';

@Module({
  imports: [
    forwardRef(() => TuyaModule),
    forwardRef(() => BridgeModule),
    HomeAssistantModule,
  ],
  providers: [LanService],
  exports: [LanService],
})
export class LanModule {}
