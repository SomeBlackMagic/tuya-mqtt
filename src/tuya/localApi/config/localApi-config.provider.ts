import { Injectable } from '@nestjs/common';
import {LocalApiConfig} from "../interfaces/localApi.interface";


@Injectable()
export class TuyaConfigProvider {
  getLocalApiConfig(): LocalApiConfig {
    return {
      devicesFile: 'devices.json',
    };
  }
}
