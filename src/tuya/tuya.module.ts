import { Module, forwardRef } from '@nestjs/common';
import { TuyaService } from './tuya.service';
import { BridgeModule } from './bridge/bridge.module';

import { TuyaConfigProvider } from './config/tuya-config.provider';
import { HomeAssistantModule } from '../homeassistant/homeassistant.module';
import {LanModule} from "./lan/lan.module";

@Module({
  imports: [
    forwardRef(() => BridgeModule),
    LanModule,
    HomeAssistantModule,
  ],
  providers: [TuyaService, TuyaConfigProvider],
  exports: [TuyaService, TuyaConfigProvider],
})
export class TuyaModule {}
