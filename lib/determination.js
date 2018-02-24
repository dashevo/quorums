const _ = require('lodash');
const config = require('./config');
const utils = require('./utils');
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
        return GetAllQuorums(list, quorumCalculationHash);
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

var GetAllQuorums = function(mnList, calcHash) {

    const numOfQuorums = Math.floor(mnList.length / config.quorumSize);
    console.log('list.length: ' + mnList.length);
    console.log('numOfQuorums: ' + numOfQuorums);

    //sort ranked mnList by vin before shuffle
    let sortedMnList = mnList.sort((m1, m2) => {
        return (m1.vin > m2.vin ? 1 : m2.vin > m1.vin ? -1 : 0);
    });

    return shuffleDeterministic(sortedMnList,calcHash);
};

/**
 * Shuffles the elements of an array deterministically
 * adapted from array shuffle function of lodash https://github.com/lodash/lodash/blob/master/shuffle.js
 * to make the shuffling deterministic and repeatable based on @param {seed<<String>>}
 */
var shuffleDeterministic = function (array, seed) {
    const length = array == null ? 0 : array.length;
    if (!length) {
        return [];
    }
    let index = -1
    const lastIndex = length - 1;
    const result = array;
    const rng = new Prando(seed);
    while (++index < length) {
        // get pseudo random num generated from rng between 0 (inclusive) and 1 (exclusive); replaces pseudo random generated Math.random()
        let num = rng.next();
        const rand = index + Math.floor(num * (lastIndex - index + 1));
        const value = result[rand];
        result[rand] = result[index];
        result[index] = value;
    }
    return result;
};

var GetQuorumForDapi = function(mnList, calcHash, vin) {

    //sort ranked mnList by vin before shuffle
    let sortedMnList = mnList.sort((m1, m2) => {
        return (m1.vin > m2.vin ? 1 : m2.vin > m1.vin ? -1 : 0);
    });

    return shuffleDeterministic(sortedMnList,calcHash).slice(0, config.quorumSize);
};

var GetQuorumForUser = function(mnList, calcHash, txid) {

    //sort ranked mnList by vin before shuffle
    let sortedMnList = mnList.sort((m1, m2) => {
        return (m1.vin > m2.vin ? 1 : m2.vin > m1.vin ? -1 : 0);
    });

    return shuffleDeterministic(sortedMnList,calcHash).slice(0, config.quorumSize);
};