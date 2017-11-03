module.exports = {
    getQuorum: require('./lib/determination').getQuorum,
    validate: require('./lib/validation').validate,
    getVin: require('./lib/utils').resolveVinFromIp,
    getMockMnList: require('./lib/mocks').getDynamicMnList,
    getHash: require('./lib/utils').getHash
}