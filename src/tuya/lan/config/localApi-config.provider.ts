import { Injectable } from '@nestjs/common';
import {LanModuleConfig} from "../interfaces/lan.interface";


@Injectable()
export class TuyaConfigProvider {
  getLanConfig(): LanModuleConfig {
    return {
      devicesFile: 'devices.json',
    };
  }
}
