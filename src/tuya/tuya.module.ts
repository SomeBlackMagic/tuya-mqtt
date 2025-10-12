import { Module, forwardRef } from '@nestjs/common';
import { TuyaService } from './tuya.service';
import { BridgeModule } from './bridge/bridge.module';
import { LocalApiModule } from './localApi/local-api.module';
import { TuyaConfigProvider } from './config/tuya-config.provider';

@Module({
  imports: [forwardRef(() => BridgeModule), LocalApiModule],
  providers: [TuyaService, TuyaConfigProvider],
  exports: [TuyaService, TuyaConfigProvider],
})
export class TuyaModule {}
