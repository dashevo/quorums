const _ = require('lodash');
const config = require('./config');
const utils = require('./utils');
const Prando = require('prando');

module.exports = {

    getQuorum: function(list, blockHash, txid, full = false) {

        //if txid includes "-" then we know it's a MN collateral outpoint (vin)
        if(txid.indexOf("-") > -1) {
            return GetQuorumForDapi(list, blockHash, txid, full);
        } else {
            return GetQuorumForUser(list, blockHash, txid, full);
        }
    },

    getQuorums: function(list, quorumCalculationHash, full = false) {
        return GetAllQuorums(list, quorumCalculationHash, full);
    }
};

var GetAllQuorums = function(mnList, calcHash, full) {

    const numOfQuorums = Math.floor(mnList.length / config.quorumSize);

    //sort ranked mnList by vin before shuffle
    let sortedMnList = mnList.sort((m1, m2) => {
        return (m1.vin > m2.vin ? 1 : m2.vin > m1.vin ? -1 : 0);
    });

    sortedMnList = shuffleDeterministic(sortedMnList,calcHash);
    let quorums = [];

    for (let i = 0; i < numOfQuorums; i++) {
        let q = sortedMnList.filter(mn => mn.num === i);
        let quorum = {};

        if (full) {
            quorum = {hash: utils.getAverageHash(q), nodes: q};
        } else {
            let outpoints = q.map(mn => {return (mn.vin);});
            quorum = {hash: utils.getAverageHash(q), nodes: outpoints};
        }

        quorums.push(quorum);
    }

    return quorums;
};

var GetQuorumForDapi = function(mnList, calcHash, vin, full) {

    //sort ranked mnList by vin before shuffle
    let sortedMnList = mnList.sort((m1, m2) => {
        return (m1.vin > m2.vin ? 1 : m2.vin > m1.vin ? -1 : 0);
    });

    sortedMnList = shuffleDeterministic(sortedMnList,calcHash);

    let mynode = sortedMnList.find((mn) => {
        if (mn.vin === vin) {
            return mn
        }
    });

    let q = sortedMnList.filter(mn => mn.num === mynode.num);
    let quorum = {};

    if (full) {
        quorum = {hash: utils.getAverageHash(q), nodes: q};
    } else {
        let outpoints = q.map(mn => {return (mn.vin);});
        quorum = {hash: utils.getAverageHash(q), nodes: outpoints};
    }

    return quorum;
};

var GetQuorumForUser = function(mnList, calcHash, txid, full) {

    const quorums = GetAllQuorums(mnList, calcHash, full);

    let distance1 = BigInteger.ZERO;
    let qWin = [];

    for (let q of quorums) {

        //distance2 = quorumHash - regTxID
        let distance2 = Math.abs(BigInteger.fromHex(q.hash).subtract(BigInteger.fromHex(txid)));

        if (distance2 > distance1) {
            distance1 = distance2;
        } else {
            qWin = q;
            break
        }

    }

    return qWin;
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
        // get pseudo random num generated from rng between 0 (inclusive) and 1 (exclusive);
        // replaces pseudo random generated with Math.random()
        let num = rng.next();
        const rand = index + Math.floor(num * (lastIndex - index + 1));
        const value = result[rand];
        result[rand] = result[index];
        result[index] = value;
        result[index].num = Math.floor(index/config.quorumSize);
    }

    return result;
};