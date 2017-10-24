//QDEVTEMP
const _ = require('lodash')

module.exports = {
    resolveVinFromIp: function(mnList) {
        let localip = require("ip").address();
        let match = _.find(mnList, mn => mn.ip == localip);
        return match ? match.vin : null
    },

    resolveVinFromPort: function(mnList, port) {
        let match = _.find(mnList, mn => mn.ip.indexOf(port) > -1);
        return match ? match.vin : null
    }
}
//QDEVTEMP end