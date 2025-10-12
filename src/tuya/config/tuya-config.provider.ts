import { Injectable } from '@nestjs/common';
import { TuyaConfig } from '../types/tuya.types';

@Injectable()
export class TuyaConfigProvider {
  getTuyaConfig(): TuyaConfig {
    return {
      baseTopic: 'tuya/',
    };
  }
}
