const _ = require('lodash');
const config = require('./config');
const utils = require('./utils');
const BigInteger = require('bigi');
const Prando = require('prando');

module.exports = {
    getQuorum: function(list, blockHash, txid) {
        //if txid includes "-" then we know it's a MN collateral outpoint (vin)
        if(txid.indexOf("-") > -1) {
            return GetQuorumForDapi(list, blockHash, txid);
        }else{
            return GetQuorumForUser(list, blockHash, txid);
        }
    },
    getQuorums: function(list, quorumCalculationHash) {
        return GetAllQuorums(quorumCalculationHash, list);
    }
};

//XOR 2 64Byte hex strings
var GetBitwiseXOR = function(hex1, hex2) {
    let hex1Arr = hex1.split("");
    let hex2Arr = hex2.split("");

    let result = "";

    for (let i = 0; i < 64; i++) {
        result += (parseInt(hex1Arr[i], 16) ^ parseInt(hex2Arr[i], 16)).toString(16);
    }

    return result;
};

var getDelta = function(hex1, hex2) {
    return Math.abs(BigInteger.fromHex(hex1).subtract(BigInteger.fromHex(hex2)));
};

var GetAllQuorums = function(calcHash, mnList) {

    const numOfQuorums = Math.floor(mnList.length / config.quorumSize);
    console.log('list.length: ' + mnList.length);
    console.log('numOfQuorums: ' + numOfQuorums);
    //mnList.sort();
    /*
    //sort mn's with vin closest to calcHash listed first
    let sortedMnList = mnList.sort((m1, m2) => {
        let colHash1 = m1.vin.substring(0, m1.vin.indexOf('-'));
        let colHash2 = m2.vin.substring(0, m2.vin.indexOf('-'));
        return (getDelta(colHash1, calcHash) > getDelta(colHash2, calcHash)) ? 1 :
            ((getDelta(colHash2, calcHash) > getDelta(colHash1, calcHash)) ? -1 : 0);
    });
    */

    return shuffle(mnList,calcHash);
};

/**
 * Shuffles the elements of an array
 * adapted from array shuffle function of lodash https://github.com/lodash/lodash/blob/master/shuffle.js
 * to make the shuffling deterministic and repeatable based on @param {seed<<String>>}
 */
//adapted array shuffle function from lodash https://github.com/lodash/lodash/blob/master/shuffle.js
var shuffle = function (array, seed) {
    const length = array == null ? 0 : array.length
    if (!length) {
        return []
    }
    let index = -1
    const lastIndex = length - 1
    const result = array;
    const rng = new Prando(seed);
    console.log(rng);
    while (++index < length) {
        // get pseudo random nums generated from rng between 0 (inclusive) and 1 (exclusive); replaces pseudo random generated Math.random()
        let num = rng.next();
        const rand = index + Math.floor(num * (lastIndex - index + 1))
        const value = result[rand]
        result[rand] = result[index]
        result[index] = value
    }
    return result
}

var GetQuorumForDapi = function(mnList, calcHash, vin) {

    //XOR blockhash and user regtx to get random position on search space influenced by lastblockhash and user
    let refHash = GetBitwiseXOR(calcHash, vin);

    //sort mn's with vin closest to refHash listed first
    let sortedMnList = mnList.sort((m1, m2) => {
        return (getDelta(m1.vin, refHash) > getDelta(m2.vin, refHash)) ? 1 :
        ((getDelta(m2.vin, refHash) > getDelta(m1.vin, refHash)) ? -1 : 0);
});

    return sortedMnList.slice(0, config.quorumSize);
};

var GetQuorumForUser = function(mnList, calcHash, txid) {

    //XOR blockhash and user regtx to get random position on search space influenced by lastblockhash and user
    let refHash = GetBitwiseXOR(calcHash, txid);

    //sort mn's with vin closest to refHash listed first
    let sortedMnList = mnList.sort((m1, m2) => {
        return (getDelta(m1.vin, refHash) > getDelta(m2.vin, refHash)) ? 1 :
            ((getDelta(m2.vin, refHash) > getDelta(m1.vin, refHash)) ? -1 : 0);
    });

    return sortedMnList.slice(0, config.quorumSize);
}