const _ = require('lodash');
const sha256 = require('sha256');
const config = require('./config');
const BigInteger = require('bigi');

module.exports = {
    resolveVinFromIp: function(mnList) {
        let localip = require("ip").address();
        let match = _.find(mnList, mn => mn.ip == localip);
        return match ? match.vin : null;
    },

    resolveVinFromPort: function(mnList, port) {
        let match = _.find(mnList, mn => mn.ip.indexOf(port) > -1);
        return match ? match.vin : null;
    },

    getHash: function(obj) {
        return sha256(typeof obj === 'string' ? obj : JSON.stringify(obj));
    },

    getRefHeight: function(lastHeight) {
        return lastHeight - config.quorumRefHeight;
    },

    getAverageHash: function(headers) {
        let avgHash = BigInteger.ZERO;
        for (let header of headers) {
            let reversed = revHex(getTrulyRandomBlockHash(header.hash));
            let bigint = BigInteger.fromHex(reversed);
            avgHash = avgHash.add(bigint);
        }
        avgHash = avgHash.divide(new BigInteger(headers.length.toString()));
        return avgHash.toHex();
    }

};

let getTrulyRandomBlockHash = function(blockHash) {
    let leadingZeros = _.takeWhile(blockHash.split(""), e => e == '0').length;
    return blockHash.substring(blockHash.length - leadingZeros, blockHash.length) + blockHash.substring(leadingZeros, blockHash.length);
};

let revHex = function (s) {
    let r = '';
    let i = 0;
    for (; i < s.length; i += 2)
        r = s.slice(i, i + 2) + r;
    return r;
};
