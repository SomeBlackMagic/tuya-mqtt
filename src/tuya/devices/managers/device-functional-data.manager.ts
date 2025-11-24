import { DeviceFunctionalData, DpsSchemaItem } from '../../types/tuya.types';

const debug = require('debug')('tuya-mqtt:device-functional-data-manager');

/**
 * Manages device functional data including DPS schema and function lists
 * Handles registration and retrieval of device capabilities
 */
export class DeviceFunctionalDataManager {
  private functionalData: DeviceFunctionalData;

  constructor() {
    this.functionalData = {
      dpsSchema: {},
      standardFunctions: [],
      customFunctions: [],
    };
  }

  /**
   * Register a DPS schema item
   */
  registerDpsSchema(id: number, dpsSchema: DpsSchemaItem): void {
    if (this.functionalData.dpsSchema[id] !== undefined) {
      debug(`DPS schema ${id} already exists, skipping registration`);
      return;
    }

    this.functionalData.dpsSchema[id] = dpsSchema;
    debug(`Registered DPS schema: ${id}`, dpsSchema);
  }

  /**
   * Get DPS schema item by ID
   */
  getDpsSchema(id: number): DpsSchemaItem | null {
    return this.functionalData.dpsSchema[id] ?? null;
  }

  /**
   * Get all DPS schema
   */
  getAllDpsSchema(): Record<number, DpsSchemaItem> {
    return { ...this.functionalData.dpsSchema };
  }

  /**
   * Register standard functions
   */
  registerStandardFunctions(functions: string[]): void {
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
  registerCustomFunctions(functions: string[]): void {
    functions.forEach((functionName) => {
      if (!this.functionalData.customFunctions?.includes(functionName)) {
        this.functionalData.customFunctions?.push(functionName);
        debug(`Registered custom function: ${functionName}`);
      } else {
        debug(`Custom function ${functionName} already exists`);
      }
    });
  }

  /**
   * Get all standard functions
   */
  getStandardFunctions(): string[] {
    return [...(this.functionalData.standardFunctions || [])];
  }

  /**
   * Get all custom functions
   */
  getCustomFunctions(): string[] {
    return [...(this.functionalData.customFunctions || [])];
  }

  /**
   * Get complete functional data
   */
  getFunctionalData(): DeviceFunctionalData {
    return {
      dpsSchema: { ...this.functionalData.dpsSchema },
      standardFunctions: [...(this.functionalData.standardFunctions || [])],
      customFunctions: [...(this.functionalData.customFunctions || [])],
    };
  }
}
