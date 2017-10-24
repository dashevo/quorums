const message = require('bitcore-message-dash')
const getQuorum = require('./determination').getQuorum
const quorumsUtil = require('./utils')
const _ = require('lodash')

module.exports = {
    validate: function(data, signature, quorumData, qTempPort) {//QDEVTEMP - rm tempPort
        return Validate(data, signature, quorumData, qTempPort)
    }
}

var Validate = function(data, signature, quorumData, qTempPort) {//QDEVTEMP - rm tempPort

    return new Promise(function(resolve, reject) {

        if (message(data.toString()).verify(quorumData.refAddr, signature)) {
            let quorum = getQuorum(quorumData.mnList, quorumData.refHash, data.txId)

            //todo: temp until rpc to get outpoint
            let vin = quorumsUtil.resolveVinFromPort(quorumData.mnList, qTempPort)

            if (vin && _.find(quorum, q => q.vin == vin)) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        }
    });
}