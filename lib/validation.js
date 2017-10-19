const message = require('bitcore-message-dash')
const getQuorum = require('./determination').getQuorum
const quorumsUtil = require('./utils')

module.exports = {
    validate: function(data, signature, quorumData) {
        return Validate(data, signature, quorumData)
    }
}

var Validate = function(data, signature, quorumData) {

    return new Promise(function(resolve, reject) {

        if (message(data.toString()).verify(quorumData.refAddr, signature)) {
            let quorum = getQuorum(quorumData.mnList, quorumData.refHash, data.txId)

            //todo: temp until rpc to get outpoint
            let vin = quorumsUtil.resolveVinFromIp(quorumData.mnList)

            if (vin && vin == quorum.vin) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        }
    });
}