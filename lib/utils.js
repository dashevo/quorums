const _ = require('lodash')
const sha256 = require('sha256')

module.exports = {
    resolveVinFromIp: function(mnList) {
        let localip = require("ip").address();
        let match = _.find(mnList, mn => mn.ip == localip);
        return match ? match.vin : null
    },

    resolveVinFromPort: function(mnList, port) {
        let match = _.find(mnList, mn => mn.ip.indexOf(port) > -1);
        return match ? match.vin : null
    },

    getHash: function(obj) {
        return sha256(typeof obj === 'string' ? obj : JSON.stringify(obj))
    }
}
