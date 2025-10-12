/**
 * Home Assistant MQTT Discovery Device Information Interface
 * Based on Home Assistant MQTT Discovery specification
 */
export interface DeviceData {
    /** Device identifiers - array of unique identifiers for the device */
    ids?: string | string[];

    /** Device name - human readable name for the device */
    name?: string;

    /** Model - model name of the device (mdl in MQTT) */
    mdl?: string;

    /** Manufacturer - manufacturer of the device (mf in MQTT) */
    mf?: string;

    /** Software version - version of the software running on the device (sw in MQTT) */
    sw?: string;

    /** Hardware version - version of the hardware of the device (hw in MQTT) */
    hw?: string;

    /** Serial number - serial number of the device (sn in MQTT) */
    sn?: string;

    /** Configuration URL - URL for configuration interface (cu in MQTT) */
    cu?: string;

    /** Suggested area - suggested area where the device is located (sa in MQTT) */
    sa?: string;

    /** Via device - identifier of a device that routes messages between this device and Home Assistant (via_device in MQTT) */
    via_device?: string;

    /** Connections - list of connection types and identifiers (cns in MQTT) */
    cns?: Array<[string, string]>;
}

/**
 * Helper type for MQTT Discovery payload device field
 */
export type MqttDeviceData = DeviceData;
