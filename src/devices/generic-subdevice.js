const TuyaDevice = require('./tuya-device')
const debug = require('debug')('tuya-mqtt:device')
const debugError = require('debug')('tuya-mqtt:error')
const debugCommand = require('debug')('tuya-mqtt:command')
const utils = require('../lib/utils')
const fs = require('fs')

class GenericSubDevice extends TuyaDevice {
    //Devices connected via Tuya hub. No direct connection is made. Data will be passed from parent based on cid value.
    //Passive devices like door sensor which are sleeping most of the time.
    constructor(parent, deviceInfo) {
        super(deviceInfo);
        this.cid = deviceInfo.configDevice.cid
        this.parent = parent;
        this.connected = false;
        this.isPassive = deviceInfo.configDevice.passive ? deviceInfo.configDevice.passive : false
    }

    onConnected() {
        this.connected = true;
        this.heartbeatsMissed = 0;
        debug('Connected to device ' + this.toString())
        this.monitorHeartbeat()
        this.publishMqtt(this.baseTopic + 'status', 'online')
        this.init()
    }

    onDisconnected() {
        if(this.connected) {
            this.connected = false;
            debug('Disconnected from device ' + this.toString())
            this.publishMqtt(this.baseTopic + 'status', 'offline')
        }
    }

    monitorHeartbeat() {
        if (this.isPassive == true) {
            return;
        } else {
            debug('Starting heartbeat monitoring')
            this.heartbeatTimer = setInterval(async () => {
                if (this.connected) {
                    this.parent.get({cid: this.cid});
                    if (this.heartbeatsMissed > 3) {
                        debugError('Subdevice id ' + this.toString() + ' not responding to refresh commands... Reporting as disconnected.')
                        this.onDisconnected() //Just inform about disconnect. We can't actively reconnect
                    } else if (this.heartbeatsMissed > 0) {
                        const errMessage = this.heartbeatsMissed > 1 ? " times" : " time"
                        debugError('Subdevice id ' + this.toString() +' has not responded to refresh command ' + this.heartbeatsMissed + errMessage)                
                    }
                    this.heartbeatsMissed++
                }
            }, 10000)
        }
    }

    onData(data) {
        debug('Received data from parent device ' + this.parent.options.id + ' ->', JSON.stringify(data.dps));
        this.heartbeatsMissed = 0
        this.updateState(data)
    }

    init() {
        debug('Generic ' + (this.isPassive ? 'passive ' : '') + 'subdevice init() for ' + this.toString())
        this.deviceData.mdl = 'Generic Subdevice'

        // Check if custom template in device config
        if (this.config.hasOwnProperty('template')) {
            // Map generic DPS topics to device specific topic names
            debug('Applying template to ' + this.toString())
            this.deviceTopics = this.config.template
        } else {
            if(!this.config.persist) {
                if (!this.isPassive) {
                    // No need to get schema. getStates will fetch all the dps
                    //debug('Getting schema for ' + this.toString())
                    //this.get()
                } else {
                    debug('Passive device. Skipping initial update for ' + this.toString())
                }
            } else {
                debug('Persisted device, skipping initial update for ' + this.toString())
            }
        }

        // Restore saved state
        this.restoreState()

        // Get initial states and start publishing topics
        if(!this.isPassive) {
            this.getStates()
        }
    }

    get(options={}) {
        debug('RequestData for ' + this.toString())
        options.cid = this.cid
        debug(JSON.stringify(options))
        this.parent.get(options)
    }

    set(command={}) {
        if (this.isPassive == true) {
            debug("Device is passive and does not accept commands. " + this.toString())
            return
        }
        command.cid = this.cid
        debug('Set device ' + this.toString() + ' -> ' + JSON.stringify(command))
        this.parent.set(command)
    }

    processCommand(message) {
        let command = message.toLowerCase()
        debugCommand('Received command: ', command)
        switch(command) {
            case 'get-states':
                this.getStates()
                break
            default:
                debugCommand('Invalid command')
        }
    }
}

module.exports = GenericSubDevice