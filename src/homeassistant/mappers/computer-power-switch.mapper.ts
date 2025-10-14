import { HomeAssistantService } from '../homeassistant.service';
import { HomeAssistantDeviceInfo } from '../homeassistant.types';

/**
 * Entity configuration for Computer Power Switch device
 */
export interface ComputerPowerSwitchEntity {
  entityId: string;
  name: string;
  description?: string;
  icon: string;
  type: 'switch' | 'select' | 'button';
  options?: string[]; // For select entities
}

/**
 * Computer Power Switch Home Assistant Mapper
 * Maps Tuya device entities to Home Assistant discovery
 */
export class ComputerPowerSwitchMapper {
  private static readonly ENTITIES: ComputerPowerSwitchEntity[] = [
    {
      entityId: 'computer_power',
      name: 'Computer Power',
      description: 'Computer power control switch',
      icon: 'mdi:desktop-tower',
      type: 'switch',
    },
    {
      entityId: 'usb_power',
      name: 'USB Power',
      description: 'USB port power control',
      icon: 'mdi:usb-port',
      type: 'switch',
    },
    {
      entityId: 'child_lock',
      name: 'Child Lock',
      description: 'Prevents accidental power changes',
      icon: 'mdi:lock',
      type: 'switch',
    },
    {
      entityId: 'power_on_behavior',
      name: 'Power-on Behavior',
      description: 'Computer behavior after power loss',
      icon: 'mdi:power-settings',
      type: 'select',
      options: ['off', 'on', 'memory'],
    },
    {
      entityId: 'reset_soft',
      name: 'Soft Reset',
      description: 'Perform soft computer reset',
      icon: 'mdi:restart',
      type: 'button',
    },
    {
      entityId: 'reset_force',
      name: 'Force Reset',
      description: 'Perform forced computer reset',
      icon: 'mdi:power-cycle',
      type: 'button',
    },
    {
      entityId: 'rf_remote',
      name: 'RF Remote',
      description: 'RF remote control enable/disable',
      icon: 'mdi:remote',
      type: 'select',
      options: ['on', 'off'],
    },
  ];

  /**
   * Initialize Home Assistant discovery for all entities
   */
  static initDiscovery(
    homeAssistantService: HomeAssistantService,
    deviceId: string,
    deviceName: string,
    baseTopic: string,
    deviceInfo: HomeAssistantDeviceInfo,
  ): void {
    this.ENTITIES.forEach((entity) => {
      const fullName = `${deviceName} ${entity.name}`;

      switch (entity.type) {
        case 'switch':
          homeAssistantService.publishSwitchDiscovery(
            deviceId,
            entity.entityId,
            fullName,
            baseTopic,
            deviceInfo,
            entity.icon,
          );
          break;

        case 'select':
          if (entity.options) {
            homeAssistantService.publishSelectDiscovery(
              deviceId,
              entity.entityId,
              fullName,
              baseTopic,
              deviceInfo,
              entity.options,
              entity.icon,
            );
          }
          break;

        case 'button':
          homeAssistantService.publishButtonDiscovery(
            deviceId,
            entity.entityId,
            fullName,
            baseTopic,
            deviceInfo,
            entity.icon,
          );
          break;
      }
    });
  }

  /**
   * Get icon for specific entity
   */
  static getIcon(entityId: string): string {
    const entity = this.ENTITIES.find((e) => e.entityId === entityId);
    return entity?.icon || 'mdi:toggle-switch';
  }

  /**
   * Get all entity IDs
   */
  static getEntityIds(): string[] {
    return this.ENTITIES.map((e) => e.entityId);
  }
}
