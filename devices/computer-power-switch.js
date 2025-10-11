const TuyaDevice = require('./tuya-device')
const debug = require('debug')('tuya-mqtt:device')
const debugDiscovery = require('debug')('tuya-mqtt:discovery')
const utils = require('../lib/utils')

class ComputerPowerSwitch extends TuyaDevice {
    async init() {
        // Initialize state storage
        this.state = {}

        // Set device specific variables with default DPS values based on specification
        this.config.dpsPowerSwitch = this.config.dpsPowerSwitch ? this.config.dpsPowerSwitch : 1
        this.config.dpsUsbSwitch = this.config.dpsUsbSwitch ? this.config.dpsUsbSwitch : 7
        this.config.dpsPowerOnBehavior = this.config.dpsPowerOnBehavior ? this.config.dpsPowerOnBehavior : 38
        this.config.dpsChildLock = this.config.dpsChildLock ? this.config.dpsChildLock : 40
        this.config.dpsResetMode = this.config.dpsResetMode ? this.config.dpsResetMode : 101
        this.config.dpsRFRemote = this.config.dpsRFRemote ? this.config.dpsRFRemote : 102

        this.deviceData.mdl = 'Computer Power Switch'
        this.deviceData.mf = 'Tuya/eWeLink'

        // Map generic DPS topics to device specific topic names
        this.deviceTopics = {
            computer_power: {
                key: this.config.dpsPowerSwitch,
                type: 'bool'
            },
            usb_power: {
                key: this.config.dpsUsbSwitch,
                type: 'bool'
            },
            power_on_behavior: {
                key: this.config.dpsPowerOnBehavior,
                type: 'enum',
                values: ['off', 'on', 'memory']
            },
            child_lock: {
                key: this.config.dpsChildLock,
                type: 'bool'
            },
            reset_mode: {
                key: this.config.dpsResetMode,
                type: 'enum',
                values: ['Reset', 'forceReset', '0']
            },
            rf_remote: {
                key: this.config.dpsRFRemote,
                type: 'enum',
                values: ['on', 'off']
            }
        }

        // Send home assistant discovery data and give it a second before sending state updates
        this.initDiscovery()
        await utils.sleep(1)

        // Get initial states and start publishing topics
        this.getStates()
    }

    initDiscovery() {
        const baseName = (this.config.name) ? this.config.name : this.config.id

        // Computer power switch discovery
        this.publishSwitchDiscovery('computer_power', `${baseName} Computer Power`, 
            'Computer power control switch')
        
        // USB power switch discovery
        this.publishSwitchDiscovery('usb_power', `${baseName} USB Power`, 
            'USB port power control')
        
        // Child lock discovery
        this.publishSwitchDiscovery('child_lock', `${baseName} Child Lock`, 
            'Prevents accidental power changes')
        
        // Power-on behavior discovery (select entity)
        this.publishSelectDiscovery('power_on_behavior', `${baseName} Power-on Behavior`, 
            'Computer behavior after power loss', ['off', 'on', 'memory'])
        
        // Reset mode discovery (button entities for different reset types)
        this.publishButtonDiscovery('reset_soft', `${baseName} Soft Reset`, 
            'Perform soft computer reset')
        this.publishButtonDiscovery('reset_force', `${baseName} Force Reset`, 
            'Perform forced computer reset')
        
        // RF Remote discovery (select entity)
        this.publishSelectDiscovery('rf_remote', `${baseName} RF Remote`, 
            'RF remote control enable/disable', ['on', 'off'])
    }

    publishSwitchDiscovery(entityId, name, description) {
        const configTopic = `homeassistant/switch/${this.config.id}_${entityId}/config`
        
        const discoveryData = {
            name: name,
            state_topic: `${this.baseTopic}${entityId}`,
            command_topic: `${this.baseTopic}${entityId}/command`,
            availability_topic: this.baseTopic + 'status',
            payload_on: 'ON',
            payload_off: 'OFF',
            payload_available: 'online',
            payload_not_available: 'offline',
            unique_id: `${this.config.id}_${entityId}`,
            device: this.deviceData,
            icon: this.getIcon(entityId)
        }

        debugDiscovery(`Home Assistant config topic: ${configTopic}`)
        debugDiscovery(discoveryData)
        this.publishMqtt(configTopic, JSON.stringify(discoveryData))
    }

    publishSelectDiscovery(entityId, name, description, options) {
        const configTopic = `homeassistant/select/${this.config.id}_${entityId}/config`
        
        const discoveryData = {
            name: name,
            state_topic: `${this.baseTopic}${entityId}`,
            command_topic: `${this.baseTopic}${entityId}/command`,
            availability_topic: this.baseTopic + 'status',
            options: options,
            payload_available: 'online',
            payload_not_available: 'offline',
            unique_id: `${this.config.id}_${entityId}`,
            device: this.deviceData,
            icon: this.getIcon(entityId)
        }

        debugDiscovery(`Home Assistant config topic: ${configTopic}`)
        debugDiscovery(discoveryData)
        this.publishMqtt(configTopic, JSON.stringify(discoveryData))
    }

    publishButtonDiscovery(entityId, name, description) {
        const configTopic = `homeassistant/button/${this.config.id}_${entityId}/config`
        
        const discoveryData = {
            name: name,
            command_topic: `${this.baseTopic}${entityId}/command`,
            availability_topic: this.baseTopic + 'status',
            payload_press: 'PRESS',
            payload_available: 'online',
            payload_not_available: 'offline',
            unique_id: `${this.config.id}_${entityId}`,
            device: this.deviceData,
            icon: this.getIcon(entityId)
        }

        debugDiscovery(`Home Assistant config topic: ${configTopic}`)
        debugDiscovery(discoveryData)
        this.publishMqtt(configTopic, JSON.stringify(discoveryData))
    }

    getIcon(entityId) {
        const icons = {
            'computer_power': 'mdi:desktop-tower',
            'usb_power': 'mdi:usb-port',
            'child_lock': 'mdi:lock',
            'power_on_behavior': 'mdi:power-settings',
            'reset_soft': 'mdi:restart',
            'reset_force': 'mdi:power-cycle',
            'rf_remote': 'mdi:remote'
        }
        return icons[entityId] || 'mdi:toggle-switch'
    }

    // Override updateState to publish states for all entities
    updateState(data) {
        // Call parent to update internal state
        super.updateState(data)

        // Check if data is available
        if (!data || typeof data !== 'object') {
            debug('No valid data received, skipping state publish')
            return
        }

        // Extract DPS data from the message
        const dpsData = data.dps || data

        debug('Received device state update:', data)

        // Merge new DPS values into existing state (accumulative update)
        Object.keys(dpsData).forEach(dpsKey => {
            this.state[dpsKey] = dpsData[dpsKey]
        })

        // Publish states only for topics that were actually updated
        Object.keys(this.deviceTopics).forEach(topic => {
            const topicDef = this.deviceTopics[topic]
            // Only publish if this DPS was in the update
            if (dpsData.hasOwnProperty(topicDef.key)) {
                this.publishState(topic)
            }
        })
    }

    // Override publishState to format values correctly
    publishState(topic) {
        const topicDef = this.deviceTopics[topic]
        if (!topicDef) return

        const dpsValue = this.state[topicDef.key]
        if (dpsValue === undefined) {
            // Don't log this as it's normal - not all DPS are sent in every update
            return
        }

        let publishValue

        if (topicDef.type === 'bool') {
            publishValue = dpsValue ? 'true' : 'false'
        } else if (topicDef.type === 'enum') {
            publishValue = String(dpsValue)
        } else {
            publishValue = String(dpsValue)
        }

        const stateTopic = `${this.baseTopic}${topic}`
        debug(`Publishing state to ${stateTopic}: ${publishValue}`)
        this.publishMqtt(stateTopic, publishValue)
    }

    // Override processTopicCommand to handle reset buttons
    processTopicCommand(message, commandTopic) {
        if (commandTopic === 'reset_soft' && message === 'PRESS') {
            this.sendTuyaCommand('Reset', this.deviceTopics.reset_mode)
            return true
        } else if (commandTopic === 'reset_force' && message === 'PRESS') {
            this.sendTuyaCommand('forceReset', this.deviceTopics.reset_mode)
            return true
        }
        
        // Call parent method for other commands
        return super.processTopicCommand(message, commandTopic)
    }
}

module.exports = ComputerPowerSwitch
