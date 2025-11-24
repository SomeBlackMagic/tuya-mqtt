import { DeviceDefinitionCallbacks, DeviceMessageRoute } from '../messaging/messaging.types';
import {
  DeviceFirmwareInfo,
  DeviceFunctionalData,
  DeviceMetadata,
  DeviceNetworkInfo,
  DpsSchemaItem,
} from '../types/tuya.types';
import {
  DeviceStateManager,
  DeviceRouteManager,
  DeviceCommandProcessor,
  DpsValue,
  DpsState,
} from './managers';

const debug = require('debug')('tuya-mqtt:device');

// Export types for backward compatibility
export type DeviceTopicDefinition = DeviceMessageRoute;
export type { DeviceDefinitionCallbacks };
export type DeviceDriverCallbacks = DeviceDefinitionCallbacks;

/**
 * Base class for device-specific definitions
 * Contains only device-specific configuration, topics, and communication
 * Works through callbacks to TuyaDevice instead of direct EventEmitter access
 */
export abstract class BaseDeviceDefinition {
  protected callbacks: DeviceDefinitionCallbacks;

  // Device information from Tuya
  protected networkInfo: DeviceNetworkInfo;
  protected firmwareInfo: DeviceFirmwareInfo;
  protected metadata: DeviceMetadata;
  private functionalData: DeviceFunctionalData;

  // Managers for separated concerns
  protected stateManager: DeviceStateManager;
  protected routeManager: DeviceRouteManager;
  protected commandProcessor: DeviceCommandProcessor;


  constructor(callbacks: DeviceDriverCallbacks) {
    this.callbacks = callbacks;

    this.firmwareInfo = {};

    this.networkInfo = {
      connectionStatus: 'offline',
    };

    this.functionalData = {
      dpsSchema: {},
      standardFunctions: [],
      customFunctions: [],
    };

    // Initialize managers
    this.stateManager = new DeviceStateManager();

    this.routeManager = new DeviceRouteManager(
      this.stateManager,
      (route: string, message: string, retain?: boolean) => {
        this.callbacks.publishMessage(route, message, retain);
      },
    );

    this.commandProcessor = new DeviceCommandProcessor(
      this.routeManager,
      (dpsKey: string | number, value: DpsValue) => {
        this.callbacks.sendCommand(dpsKey, value);
      },
    );
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

    const updatedKeys = this.stateManager.updateState(dpsData);
    this.routeManager.publishUpdatedStates(updatedKeys);
  }

  /**
   * Publish state for a specific route
   */
  protected publishState(route: string): void {
    this.routeManager.publishState(route);
  }

  /**
   * Process incoming command
   * Returns true if command was handled, false otherwise
   */
  processCommand(message: string, commandRoute: string): boolean {
    return this.commandProcessor.processCommand(message, commandRoute);
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
    return this.routeManager.getAllRouteNames();
  }

  // Backward compatibility alias
  getDeviceTopics(): string[] {
    return this.getDeviceRoutes();
  }

  /**
   * Register a device route
   */
  protected registerRoute(routeName: string, route: DeviceMessageRoute): void {
    this.routeManager.registerRoute(routeName, route);
  }

  /**
   * Register multiple routes at once
   */
  protected registerRoutes(routes: Record<string, DeviceMessageRoute>): void {
    this.routeManager.registerRoutes(routes);
  }

  // ------------- Functional Data Management Methods -------------

  /**
   * Register DPS schema item
   */
  protected registerFunctionalDataDpsSchema(id: number, dpsSchema: DpsSchemaItem): void {
    if (this.functionalData.dpsSchema?.[id] !== undefined) {
      debug(`DPS schema ${id} already exists, skipping registration`);
      return;
    }

    if (!this.functionalData.dpsSchema) {
      this.functionalData.dpsSchema = {};
    }

    this.functionalData.dpsSchema[id] = dpsSchema;
    debug(`Registered DPS schema: ${id}`, dpsSchema);
  }

  /**
   * Get DPS schema item
   */
  protected getFunctionalDataDpsSchema(id: number): DpsSchemaItem | null {
    return this.functionalData.dpsSchema?.[id] ?? null;
  }

  /**
   * Register standard functions
   */
  protected registerFunctionalDataStandardFunctions(functions: string[]): void {
    functions.forEach((functionName) => {
      if (!this.functionalData.standardFunctions?.includes(functionName)) {
        this.functionalData.standardFunctions?.push(functionName);
        debug(`Registered standard function: ${functionName}`);
      } else {
        debug(`Standard function ${functionName} already exists`);
      }
    });
  }

  /**
   * Register custom functions
   */
  protected registerFunctionalDataCustomFunctions(functions: string[]): void {
    functions.forEach((functionName) => {
      if (!this.functionalData.customFunctions?.includes(functionName)) {
        this.functionalData.customFunctions?.push(functionName);
        debug(`Registered custom function: ${functionName}`);
      } else {
        debug(`Custom function ${functionName} already exists`);
      }
    });
  }

  // ------------- Backward Compatibility Getters -------------

  /**
   * Access to internal state (for backward compatibility)
   * @deprecated Use stateManager directly in subclasses
   */
  protected get state(): DpsState {
    return this.stateManager.getAllState();
  }

  /**
   * Access to device routes (for backward compatibility)
   * @deprecated Use routeManager directly in subclasses
   */
  protected get deviceRoutes(): Record<string, DeviceMessageRoute> {
    return this.routeManager.getAllRoutes();
  }

  /**
   * Set device routes (for backward compatibility)
   * @deprecated Use registerRoute/registerRoutes instead
   */
  protected set deviceRoutes(routes: Record<string, DeviceMessageRoute>) {
    this.routeManager.registerRoutes(routes);
  }
}
