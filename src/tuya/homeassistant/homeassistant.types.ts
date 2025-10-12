/**
 * Home Assistant MQTT Discovery Types
 * Based on: https://www.home-assistant.io/integrations/mqtt/
 */

/**
 * Common availability configuration
 */
export interface AvailabilityConfig {
  availability_topic?: string;
  availability_mode?: 'all' | 'any' | 'latest';
  payload_available?: string;
  payload_not_available?: string;
}

/**
 * Origin information
 */
export interface OriginInfo {
  name: string;
  sw_version?: string;
  support_url?: string;
}

/**
 * Home Assistant device info
 */
export interface HomeAssistantDeviceInfo {
  identifiers: string[] | string;
  name: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  sw_version?: string;
  hw_version?: string;
  configuration_url?: string;
  suggested_area?: string;
  via_device?: string;
  connections?: Array<[string, string]>;
}

/**
 * Base discovery configuration common to all entities
 */
export interface BaseDiscoveryConfig {
  name?: string;
  unique_id?: string;
  object_id?: string;
  icon?: string;
  entity_category?: 'config' | 'diagnostic';
  enabled_by_default?: boolean;
  encoding?: string;
  qos?: 0 | 1 | 2;
  device?: HomeAssistantDeviceInfo;
  origin?: OriginInfo;
  availability?: AvailabilityConfig[] | AvailabilityConfig;
  availability_topic?: string;
  availability_mode?: 'all' | 'any' | 'latest';
  payload_available?: string;
  payload_not_available?: string;
}

/**
 * MQTT Sensor configuration
 * https://www.home-assistant.io/integrations/sensor.mqtt/
 */
export interface SensorConfig extends BaseDiscoveryConfig {
  state_topic: string;
  device_class?:
    | 'apparent_power'
    | 'aqi'
    | 'atmospheric_pressure'
    | 'battery'
    | 'carbon_dioxide'
    | 'carbon_monoxide'
    | 'current'
    | 'data_rate'
    | 'data_size'
    | 'date'
    | 'distance'
    | 'duration'
    | 'energy'
    | 'frequency'
    | 'gas'
    | 'humidity'
    | 'illuminance'
    | 'irradiance'
    | 'moisture'
    | 'monetary'
    | 'nitrogen_dioxide'
    | 'nitrogen_monoxide'
    | 'nitrous_oxide'
    | 'ozone'
    | 'pm1'
    | 'pm25'
    | 'pm10'
    | 'power'
    | 'power_factor'
    | 'precipitation'
    | 'precipitation_intensity'
    | 'pressure'
    | 'reactive_power'
    | 'signal_strength'
    | 'sound_pressure'
    | 'speed'
    | 'sulphur_dioxide'
    | 'temperature'
    | 'timestamp'
    | 'volatile_organic_compounds'
    | 'voltage'
    | 'volume'
    | 'water'
    | 'weight'
    | 'wind_speed';
  state_class?: 'measurement' | 'total' | 'total_increasing';
  unit_of_measurement?: string;
  suggested_display_precision?: number;
  value_template?: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
  force_update?: boolean;
  expire_after?: number;
  last_reset_value_template?: string;
}

/**
 * MQTT Binary Sensor configuration
 * https://www.home-assistant.io/integrations/binary_sensor.mqtt/
 */
export interface BinarySensorConfig extends BaseDiscoveryConfig {
  state_topic: string;
  device_class?:
    | 'battery'
    | 'battery_charging'
    | 'carbon_monoxide'
    | 'cold'
    | 'connectivity'
    | 'door'
    | 'garage_door'
    | 'gas'
    | 'heat'
    | 'light'
    | 'lock'
    | 'moisture'
    | 'motion'
    | 'moving'
    | 'occupancy'
    | 'opening'
    | 'plug'
    | 'power'
    | 'presence'
    | 'problem'
    | 'running'
    | 'safety'
    | 'smoke'
    | 'sound'
    | 'tamper'
    | 'update'
    | 'vibration'
    | 'window';
  payload_on?: string;
  payload_off?: string;
  value_template?: string;
  off_delay?: number;
  json_attributes_topic?: string;
  json_attributes_template?: string;
  force_update?: boolean;
  expire_after?: number;
}

/**
 * MQTT Switch configuration
 * https://www.home-assistant.io/integrations/switch.mqtt/
 */
export interface SwitchConfig extends BaseDiscoveryConfig {
  command_topic: string;
  state_topic?: string;
  device_class?: 'outlet' | 'switch';
  payload_on?: string;
  payload_off?: string;
  state_on?: string;
  state_off?: string;
  optimistic?: boolean;
  retain?: boolean;
  value_template?: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Light configuration (JSON schema)
 * https://www.home-assistant.io/integrations/light.mqtt/
 */
export interface LightConfig extends BaseDiscoveryConfig {
  schema?: 'default' | 'json' | 'template';
  command_topic: string;
  state_topic?: string;
  brightness?: boolean;
  brightness_scale?: number;
  brightness_command_topic?: string;
  brightness_state_topic?: string;
  brightness_value_template?: string;
  color_mode?: boolean;
  color_temp_command_topic?: string;
  color_temp_state_topic?: string;
  color_temp_value_template?: string;
  effect?: boolean;
  effect_command_topic?: string;
  effect_list?: string[];
  effect_state_topic?: string;
  effect_value_template?: string;
  hs_command_topic?: string;
  hs_state_topic?: string;
  hs_value_template?: string;
  max_mireds?: number;
  min_mireds?: number;
  optimistic?: boolean;
  payload_on?: string;
  payload_off?: string;
  rgb_command_topic?: string;
  rgb_state_topic?: string;
  rgb_value_template?: string;
  rgbw_command_topic?: string;
  rgbw_state_topic?: string;
  rgbw_value_template?: string;
  rgbww_command_topic?: string;
  rgbww_state_topic?: string;
  rgbww_value_template?: string;
  state_value_template?: string;
  xy_command_topic?: string;
  xy_state_topic?: string;
  xy_value_template?: string;
  retain?: boolean;
  supported_color_modes?: Array<
    | 'brightness'
    | 'color_temp'
    | 'hs'
    | 'rgb'
    | 'rgbw'
    | 'rgbww'
    | 'white'
    | 'xy'
  >;
  white_command_topic?: string;
  white_scale?: number;
  on_command_type?: 'first' | 'last' | 'brightness';
}

/**
 * MQTT Climate configuration
 * https://www.home-assistant.io/integrations/climate.mqtt/
 */
export interface ClimateConfig extends BaseDiscoveryConfig {
  mode_command_topic: string;
  mode_command_template?: string;
  mode_state_topic?: string;
  mode_state_template?: string;
  modes?: Array<
    'auto' | 'off' | 'cool' | 'heat' | 'dry' | 'fan_only' | 'heat_cool'
  >;
  action_template?: string;
  action_topic?: string;
  current_temperature_template?: string;
  current_temperature_topic?: string;
  current_humidity_template?: string;
  current_humidity_topic?: string;
  fan_mode_command_template?: string;
  fan_mode_command_topic?: string;
  fan_mode_state_template?: string;
  fan_mode_state_topic?: string;
  fan_modes?: string[];
  initial?: number;
  max_humidity?: number;
  max_temp?: number;
  min_humidity?: number;
  min_temp?: number;
  optimistic?: boolean;
  payload_on?: string;
  payload_off?: string;
  power_command_topic?: string;
  power_command_template?: string;
  precision?: number;
  preset_mode_command_template?: string;
  preset_mode_command_topic?: string;
  preset_mode_state_topic?: string;
  preset_mode_value_template?: string;
  preset_modes?: string[];
  retain?: boolean;
  swing_mode_command_template?: string;
  swing_mode_command_topic?: string;
  swing_mode_state_template?: string;
  swing_mode_state_topic?: string;
  swing_modes?: string[];
  target_humidity_command_template?: string;
  target_humidity_command_topic?: string;
  target_humidity_state_template?: string;
  target_humidity_state_topic?: string;
  temperature_command_template?: string;
  temperature_command_topic?: string;
  temperature_high_command_template?: string;
  temperature_high_command_topic?: string;
  temperature_high_state_template?: string;
  temperature_high_state_topic?: string;
  temperature_low_command_template?: string;
  temperature_low_command_topic?: string;
  temperature_low_state_template?: string;
  temperature_low_state_topic?: string;
  temperature_state_template?: string;
  temperature_state_topic?: string;
  temperature_unit?: 'C' | 'F';
  temp_step?: number;
  value_template?: string;
}

/**
 * MQTT Fan configuration
 * https://www.home-assistant.io/integrations/fan.mqtt/
 */
export interface FanConfig extends BaseDiscoveryConfig {
  command_topic: string;
  command_template?: string;
  state_topic?: string;
  state_value_template?: string;
  direction_command_template?: string;
  direction_command_topic?: string;
  direction_state_topic?: string;
  direction_value_template?: string;
  optimistic?: boolean;
  oscillation_command_template?: string;
  oscillation_command_topic?: string;
  oscillation_state_topic?: string;
  oscillation_value_template?: string;
  payload_available?: string;
  payload_not_available?: string;
  payload_off?: string;
  payload_on?: string;
  payload_oscillation_off?: string;
  payload_oscillation_on?: string;
  payload_reset_percentage?: string;
  payload_reset_preset_mode?: string;
  percentage_command_template?: string;
  percentage_command_topic?: string;
  percentage_state_topic?: string;
  percentage_value_template?: string;
  preset_mode_command_template?: string;
  preset_mode_command_topic?: string;
  preset_mode_state_topic?: string;
  preset_mode_value_template?: string;
  preset_modes?: string[];
  retain?: boolean;
  speed_range_max?: number;
  speed_range_min?: number;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Cover configuration
 * https://www.home-assistant.io/integrations/cover.mqtt/
 */
export interface CoverConfig extends BaseDiscoveryConfig {
  command_topic: string;
  device_class?:
    | 'awning'
    | 'blind'
    | 'curtain'
    | 'damper'
    | 'door'
    | 'garage'
    | 'gate'
    | 'shade'
    | 'shutter'
    | 'window';
  optimistic?: boolean;
  payload_close?: string;
  payload_open?: string;
  payload_stop?: string;
  position_closed?: number;
  position_open?: number;
  position_template?: string;
  position_topic?: string;
  retain?: boolean;
  set_position_template?: string;
  set_position_topic?: string;
  state_closed?: string;
  state_closing?: string;
  state_open?: string;
  state_opening?: string;
  state_stopped?: string;
  state_topic?: string;
  tilt_closed_value?: number;
  tilt_command_template?: string;
  tilt_command_topic?: string;
  tilt_max?: number;
  tilt_min?: number;
  tilt_opened_value?: number;
  tilt_optimistic?: boolean;
  tilt_status_template?: string;
  tilt_status_topic?: string;
  value_template?: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Lock configuration
 * https://www.home-assistant.io/integrations/lock.mqtt/
 */
export interface LockConfig extends BaseDiscoveryConfig {
  command_topic: string;
  code_format?: string;
  optimistic?: boolean;
  payload_lock?: string;
  payload_unlock?: string;
  payload_open?: string;
  retain?: boolean;
  state_jammed?: string;
  state_locked?: string;
  state_locking?: string;
  state_topic?: string;
  state_unlocked?: string;
  state_unlocking?: string;
  value_template?: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Vacuum configuration
 * https://www.home-assistant.io/integrations/vacuum.mqtt/
 */
export interface VacuumConfig extends BaseDiscoveryConfig {
  command_topic?: string;
  battery_level_template?: string;
  battery_level_topic?: string;
  charging_template?: string;
  charging_topic?: string;
  cleaning_template?: string;
  cleaning_topic?: string;
  docked_template?: string;
  docked_topic?: string;
  error_template?: string;
  error_topic?: string;
  fan_speed_list?: string[];
  fan_speed_template?: string;
  fan_speed_topic?: string;
  payload_clean_spot?: string;
  payload_locate?: string;
  payload_pause?: string;
  payload_return_to_base?: string;
  payload_start?: string;
  payload_stop?: string;
  retain?: boolean;
  send_command_topic?: string;
  set_fan_speed_topic?: string;
  state_topic?: string;
  supported_features?: string[];
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Camera configuration
 * https://www.home-assistant.io/integrations/camera.mqtt/
 */
export interface CameraConfig extends BaseDiscoveryConfig {
  topic: string;
  image_encoding?: 'b64';
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Button configuration
 * https://www.home-assistant.io/integrations/button.mqtt/
 */
export interface ButtonConfig extends BaseDiscoveryConfig {
  command_topic: string;
  command_template?: string;
  device_class?: 'identify' | 'restart' | 'update';
  payload_press?: string;
  retain?: boolean;
}

/**
 * MQTT Number configuration
 * https://www.home-assistant.io/integrations/number.mqtt/
 */
export interface NumberConfig extends BaseDiscoveryConfig {
  command_topic: string;
  command_template?: string;
  device_class?:
    | 'apparent_power'
    | 'aqi'
    | 'atmospheric_pressure'
    | 'battery'
    | 'carbon_dioxide'
    | 'carbon_monoxide'
    | 'current'
    | 'data_rate'
    | 'data_size'
    | 'distance'
    | 'duration'
    | 'energy'
    | 'frequency'
    | 'gas'
    | 'humidity'
    | 'illuminance'
    | 'irradiance'
    | 'moisture'
    | 'monetary'
    | 'nitrogen_dioxide'
    | 'nitrogen_monoxide'
    | 'nitrous_oxide'
    | 'ozone'
    | 'pm1'
    | 'pm25'
    | 'pm10'
    | 'power'
    | 'power_factor'
    | 'precipitation'
    | 'precipitation_intensity'
    | 'pressure'
    | 'reactive_power'
    | 'signal_strength'
    | 'sound_pressure'
    | 'speed'
    | 'sulphur_dioxide'
    | 'temperature'
    | 'volatile_organic_compounds'
    | 'voltage'
    | 'volume'
    | 'water'
    | 'weight'
    | 'wind_speed';
  max?: number;
  min?: number;
  mode?: 'auto' | 'box' | 'slider';
  optimistic?: boolean;
  payload_reset?: string;
  retain?: boolean;
  state_topic?: string;
  step?: number;
  unit_of_measurement?: string;
  value_template?: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Select configuration
 * https://www.home-assistant.io/integrations/select.mqtt/
 */
export interface SelectConfig extends BaseDiscoveryConfig {
  command_topic: string;
  command_template?: string;
  optimistic?: boolean;
  options: string[];
  retain?: boolean;
  state_topic?: string;
  value_template?: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Text configuration
 * https://www.home-assistant.io/integrations/text.mqtt/
 */
export interface TextConfig extends BaseDiscoveryConfig {
  command_topic: string;
  command_template?: string;
  max?: number;
  min?: number;
  mode?: 'text' | 'password';
  optimistic?: boolean;
  pattern?: string;
  retain?: boolean;
  state_topic?: string;
  value_template?: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Scene configuration
 * https://www.home-assistant.io/integrations/scene.mqtt/
 */
export interface SceneConfig extends BaseDiscoveryConfig {
  command_topic: string;
  payload_on?: string;
  retain?: boolean;
}

/**
 * MQTT Siren configuration
 * https://www.home-assistant.io/integrations/siren.mqtt/
 */
export interface SirenConfig extends BaseDiscoveryConfig {
  command_topic: string;
  command_template?: string;
  available_tones?: string[];
  optimistic?: boolean;
  payload_off?: string;
  payload_on?: string;
  retain?: boolean;
  state_topic?: string;
  state_value_template?: string;
  support_duration?: boolean;
  support_volume_set?: boolean;
  json_attributes_topic?: string;
  json_attributes_template?: string;
}

/**
 * MQTT Tag Scanner configuration
 * https://www.home-assistant.io/integrations/tag.mqtt/
 */
export interface TagConfig extends BaseDiscoveryConfig {
  topic: string;
  value_template?: string;
}

/**
 * MQTT Device Tracker configuration
 * https://www.home-assistant.io/integrations/device_tracker.mqtt/
 */
export interface DeviceTrackerConfig extends BaseDiscoveryConfig {
  state_topic: string;
  json_attributes_topic?: string;
  json_attributes_template?: string;
  payload_home?: string;
  payload_not_home?: string;
  source_type?: 'bluetooth' | 'bluetooth_le' | 'gps' | 'router';
  value_template?: string;
}

/**
 * Union type of all possible entity configurations
 */
export type HomeAssistantEntityConfig =
  | SensorConfig
  | BinarySensorConfig
  | SwitchConfig
  | LightConfig
  | ClimateConfig
  | FanConfig
  | CoverConfig
  | LockConfig
  | VacuumConfig
  | CameraConfig
  | ButtonConfig
  | NumberConfig
  | SelectConfig
  | TextConfig
  | SceneConfig
  | SirenConfig
  | TagConfig
  | DeviceTrackerConfig;
