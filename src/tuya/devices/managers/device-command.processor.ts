import { DeviceMessageRoute } from '../../messaging/messaging.types';
import { DeviceRouteManager } from './device-route.manager';
import { DpsValue } from './device-state.manager';

const debug = require('debug')('tuya-mqtt:device-command-processor');

export type CommandSender = (dpsKey: string | number, value: DpsValue) => void;

/**
 * Processes incoming commands and converts them to Tuya DPS values
 * Handles command validation and type conversion
 */
export class DeviceCommandProcessor {
  constructor(
    private routeManager: DeviceRouteManager,
    private commandSender: CommandSender,
  ) {}

  /**
   * Process an incoming command for a specific route
   * Returns true if command was handled, false otherwise
   */
  processCommand(message: string, commandRoute: string): boolean {
    const routeDef = this.routeManager.getRoute(commandRoute);
    if (!routeDef) {
      debug(`No route found for command: ${commandRoute}`);
      return false;
    }

    debug(`Processing command for route ${commandRoute}: ${message}`);

    const dpsValue = this.convertMessageToDpsValue(message, routeDef.type);

    this.sendCommand(dpsValue, routeDef);
    return true;
  }

  /**
   * Convert incoming message to DPS value based on type
   */
  private convertMessageToDpsValue(message: string, type?: string): DpsValue {
    if (type === 'bool') {
      return message === 'ON' || message === 'true' || message === '1';
    } else if (type === 'int') {
      return parseInt(message, 10);
    } else if (type === 'float') {
      return parseFloat(message);
    } else if (type === 'enum') {
      return message;
    } else {
      return message;
    }
  }

  /**
   * Send command to Tuya device
   */
  private sendCommand(value: DpsValue, routeDef: DeviceMessageRoute): void {
    debug(`Sending command to DPS ${routeDef.key}: ${value}`);
    this.commandSender(routeDef.key, value);
  }
}
