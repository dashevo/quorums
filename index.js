module.exports = {
    getQuorum: require('./lib/determination').getQuorum,
    getQuorums: require('./lib/determination').getQuorums,
    validate: require('./lib/validation').validate,
    getVin: require('./lib/utils').resolveVinFromIp,
    getHash: require('./lib/utils').getHash,
    getAverageHash: require('./lib/utils').getAverageHash,
    getRefHeight: require('./lib/utils').getRefHeight,
    getMockMnList: require('./lib/mocks').getDynamicMnList,
    config: require('./lib/config/')
}