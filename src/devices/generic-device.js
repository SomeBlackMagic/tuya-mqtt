const TuyaDevice = require('./tuya-device')
const debug = require('debug')('tuya-mqtt:device')
const utils = require('../lib/utils')

class GenericDevice extends TuyaDevice {
    init() {
        debug('Generic device init() for ' + this.toString())

        this.deviceData.mdl = 'Generic Device'

        // Check if custom template in device config
        if (this.config.hasOwnProperty('template')) {
            // Map generic DPS topics to device specific topic names
            debug('Applying template to ' + this.toString())
            this.deviceTopics = this.config.template
        } else {
            if(!this.config.persist) {
                // No need to get schema, getStates will fetch all the dps
                //debug('Getting schema for ' + this.toString())
                //this.get()
            }
        }

        // Restore saved state
        this.restoreState()

        // Get initial states and start publishing topics
        this.getStates()
    }
}

module.exports = GenericDevice