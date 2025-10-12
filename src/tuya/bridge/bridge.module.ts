import { Module, forwardRef } from '@nestjs/common';
import { BridgeService } from './bridge.service';
import { BridgeConfigProvider } from './config/bridge-config.provider';
import { TuyaModule } from '../tuya.module';

@Module({
  imports: [forwardRef(() => TuyaModule)],
  providers: [BridgeService, BridgeConfigProvider],
  exports: [BridgeService, BridgeConfigProvider],
})
export class BridgeModule {}
