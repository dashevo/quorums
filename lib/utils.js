const _ = require('lodash')

module.exports = {
    resolveVinFromIp: function(mnList) {
        let localip = require("ip").address;
        let match = _.find(mnList, mn => mn.ip = localip);
        return match ? match.vin : null
    }
}
