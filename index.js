module.exports = {
    getQuorum: require('./lib/determination').getQuorum,
    validate: require('./lib/validation').validate,
    getVin: require('./lib/utils').resolveVinFromIp,
    getHash: require('./lib/utils').getHash,
    getMockMnList: require('./lib/mocks').getDynamicMnList,
    quorumSize: require('./lib/config/').quorumSize
}