const debug = require('debug')('tuya-mqtt:device-state-manager');

/**
 * DPS value can be boolean, number, string, or object
 */
export type DpsValue = boolean | number | string | Record<string, unknown>;

/**
 * DPS state is a map of DPS keys to their values
 */
export type DpsState = Record<string | number, DpsValue>;

/**
 * Manages device state storage and updates
 * Handles DPS (Data Point System) state management
 */
export class DeviceStateManager {
  private state: DpsState = {};

  /**
   * Update state with new DPS data
   * Returns the keys that were updated
   */
  updateState(dpsData: DpsState): string[] {
    debug('Updating state with DPS data:', dpsData);

    const updatedKeys: string[] = [];

    Object.keys(dpsData).forEach((dpsKey) => {
      this.state[dpsKey] = dpsData[dpsKey];
      updatedKeys.push(dpsKey);
    });

    debug('State updated. Changed keys:', updatedKeys);
    return updatedKeys;
  }

  /**
   * Get state value by DPS key (supports both string and numeric keys)
   */
  getState(dpsKey: string | number): DpsValue | undefined {
    const stringKey = String(dpsKey);
    return this.state[stringKey] ?? this.state[dpsKey];
  }

  /**
   * Get all state
   */
  getAllState(): DpsState {
    return { ...this.state };
  }

  /**
   * Set a specific state value
   */
  setState(dpsKey: string | number, value: DpsValue): void {
    const stringKey = String(dpsKey);
    this.state[stringKey] = value;
  }

  /**
   * Check if state has a specific key
   */
  hasState(dpsKey: string | number): boolean {
    const stringKey = String(dpsKey);
    return this.state.hasOwnProperty(stringKey) || this.state.hasOwnProperty(dpsKey);
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.state = {};
  }
}
