import { Injectable } from '@nestjs/common';
import { TuyaModuleConfig } from '../types/tuya.types';

@Injectable()
export class TuyaConfigProvider {
  getTuyaConfig(): TuyaModuleConfig {
    return {
      baseTopic: 'tuya/',
    };
  }
}
