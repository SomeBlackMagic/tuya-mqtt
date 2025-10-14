import {DeviceDefinitionCallbacks, DeviceMessageRoute} from "../messaging/messaging.types";
import {
  DeviceFirmwareInfo,
  DeviceFunctionalData,
  DeviceMetadata,
  DeviceNetworkInfo,
  DpsSchemaItem
} from "../types/tuya.types";

const debug = require('debug')('tuya-mqtt:device');

// Export types for backward compatibility
export type DeviceTopicDefinition = DeviceMessageRoute;
export type {DeviceDefinitionCallbacks};
export type DeviceDriverCallbacks = DeviceDefinitionCallbacks;

/**
 * Base class for device-specific definitions
 * Contains only device-specific configuration, topics, and communication
 * Works through callbacks to TuyaDevice instead of direct EventEmitter access
 */
export abstract class BaseDeviceDefinition {
  // protected state: Record<string, any> = {};

  protected callbacks: DeviceDefinitionCallbacks;

  // Device information from Tuya (3, 4, 5, 6)
  private functionalData: DeviceFunctionalData;

  protected networkInfo: DeviceNetworkInfo;
  protected firmwareInfo: DeviceFirmwareInfo;
  protected metadata: DeviceMetadata;

  // Device-specific route mappings
  protected deviceRoutes: Record<string, DeviceTopicDefinition> = {};


  constructor(
    callbacks: DeviceDriverCallbacks,
  ) {
    this.callbacks = callbacks;

    this.firmwareInfo = {
      // protocolVersion: config.version,
    };

    // Initialize device information structures
    this.networkInfo = {
      connectionStatus: 'offline',
      // ip: config.ip,
    };

    this.functionalData = {
      dpsSchema: {
        1: {
          id: 1,
          code: 'switch',
          name: 'Power Switch',
          type: 'Boolean',
          mode: 'rw',
        },
        2: {
          id: 2,
          code: 'countdown',
          name: 'Countdown',
          type: 'Integer',
          mode: 'rw',
          unit: 's',
        },
        3: {
          id: 3,
          code: 'mode',
          name: 'Mode',
          type: 'Enum',
          mode: 'rw',
        },
        4: {
          id: 4,
          code: 'battery_percentage',
          name: 'Battery Percentage',
          type: 'Integer',
          mode: 'ro',
          unit: '%',
        },
        9: {
          id: 9,
          code: 'countdown_1',
          name: 'Countdown Timer',
          type: 'Integer',
          mode: 'rw',
          unit: 's',
        },
        20: {
          id: 20,
          code: 'switch_1',
          name: 'Switch 1',
          type: 'Boolean',
          mode: 'rw',
        },
        21: {
          id: 21,
          code: 'switch_2',
          name: 'Switch 2',
          type: 'Boolean',
          mode: 'rw',
        },
        22: {
          id: 22,
          code: 'switch_3',
          name: 'Switch 3',
          type: 'Boolean',
          mode: 'rw',
        },
        38: {
          id: 38,
          code: 'relay_status',
          name: 'Power-on Behavior',
          type: 'Enum',
          mode: 'rw',
          values: {off: 'Off', on: 'On', memory: 'Memory'},
        },
        40: {
          id: 40,
          code: 'child_lock',
          name: 'Child Lock',
          type: 'Boolean',
          mode: 'rw',
        },
      },
      standardFunctions: [],
      customFunctions: [],
    };
  }

  /**
   * Initialize device-specific configuration and discovery
   */
  abstract init(): Promise<void>;

  /**
   * Update device state from DPS data
   */
  updateState(dpsData: Record<string, any>): void {
    debug('Received device state update:', dpsData);
    debug('Current deviceRoutes:', Object.keys(this.deviceRoutes));

    // Merge new DPS values into existing state
    Object.keys(dpsData).forEach((dpsKey) => {
      this.state[dpsKey] = dpsData[dpsKey];
    });

    // debug('Current state after update:', this.state);

    // Publish states only for routes that were updated
    Object.keys(this.deviceRoutes).forEach((route) => {
      const routeDef = this.deviceRoutes[route];
      const dpsKey = String(routeDef.key);
      debug(`Checking route ${route} with DPS key ${routeDef.key} (as string: "${dpsKey}")`);
      debug(`DPS data keys:`, Object.keys(dpsData));

      if (
        dpsData.hasOwnProperty(dpsKey) ||
        dpsData.hasOwnProperty(routeDef.key)
      ) {
        debug(`Publishing state for route ${route}`);
        this.publishState(route);
      }
    });
  }

  /**
   * Publish state for a specific route
   */
  protected publishState(route: string): void {
    const routeDef = this.deviceRoutes[route];
    if (!routeDef) {
      debug(`No route definition found for ${route}`);
      return;
    }

    // Try both numeric and string keys since DPS keys can come as either
    const dpsKey = String(routeDef.key);
    const dpsValue = this.state[dpsKey] ?? this.state[routeDef.key];

    debug(
      `Getting state for route ${route}, DPS key ${routeDef.key}: ${dpsValue}`,
    );
    debug(`Current state keys:`, Object.keys(this.state));

    if (dpsValue === undefined) {
      debug(
        `No value found for DPS key ${routeDef.key} (tried both ${routeDef.key} and "${dpsKey}")`,
      );
      return;
    }

    let publishValue: string;

    if (routeDef.type === 'bool') {
      publishValue = dpsValue ? 'ON' : 'OFF';
    } else if (routeDef.type === 'enum') {
      publishValue = String(dpsValue);
    } else {
      publishValue = String(dpsValue);
    }

    debug(`Publishing state to ${route}: ${publishValue}`);
    this.callbacks.publishMessage(route, publishValue);
  }

  /**
   * Process incoming command
   * Returns true if command was handled, false otherwise
   */
  processCommand(message: string, commandRoute: string): boolean {
    const routeDef = this.deviceRoutes[commandRoute];
    if (!routeDef) {
      return false;
    }

    debug(`Processing command for route ${commandRoute}: ${message}`);

    let dpsValue: any;

    if (routeDef.type === 'bool') {
      dpsValue = message === 'ON' || message === 'true' || message === '1';
    } else if (routeDef.type === 'int') {
      dpsValue = parseInt(message, 10);
    } else if (routeDef.type === 'float') {
      dpsValue = parseFloat(message);
    } else if (routeDef.type === 'enum') {
      dpsValue = message;
    } else {
      dpsValue = message;
    }

    this.sendTuyaCommand(dpsValue, routeDef);
    return true;
  }

  // Backward compatibility alias
  processTopicCommand(message: string, commandTopic: string): boolean {
    return this.processCommand(message, commandTopic);
  }

  /**
   * Send command to a Tuya device via callback
   */
  protected sendTuyaCommand(value: any, topicDef: DeviceTopicDefinition): void {
    this.callbacks.sendCommand(topicDef.key, value);
  }

  /**
   * Publish a message via callback
   */
  protected publishMessage(
    route: string,
    message: string,
    retain: boolean = true,
  ): void {
    this.callbacks.publishMessage(route, message, retain);
  }


  /**
   * Get all device routes
   */
  getDeviceRoutes(): string[] {
    return Object.keys(this.deviceRoutes);
  }

  // Backward compatibility alias
  getDeviceTopics(): string[] {
    return this.getDeviceRoutes();
  }


  // ------------- NEW--------
  protected registerFunctionalDataDpsSchema(id: number, dpsSchema: DpsSchemaItem): void {
    // @ts-ignore
    if (this.functionalData.dpsSchema[id] !== undefined) {
      return;
    }
    // @ts-ignore
    this.functionalData.dpsSchema[id] = dpsSchema;
  }

  protected getFunctionalDataDpsSchema(id: number): DpsSchemaItem | null {
    // @ts-ignore
    return this.functionalData.dpsSchema[id] ?? null;
  }

  protected registerFunctionalDataStandardFunctions(functions: string[]) {
    functions.forEach((functionName) => {
      if (this.functionalData.standardFunctions?.includes(functionName)) {
        this.functionalData.standardFunctions?.push(functionName)
      } else {
        debug(`StandardFunction ${functionName} already exists`)
      }
    })
  }

  protected registerFunctionalDataCustomFunctions(functions: string[]) {
    functions.forEach((functionName) => {
      if (this.functionalData.customFunctions?.includes(functionName)) {
        this.functionalData.customFunctions?.push(functionName)
      } else {
        debug(`CustomFunction ${functionName} already exists`)
      }
    })
  }
}
