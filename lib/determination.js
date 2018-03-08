const Prando = require('prando');
const BigInteger = require('bigi');
const config = require('./config');
const utils = require('./utils');

/**
 * Shuffles the elements of an array deterministically -
 * adapted from array shuffle function of lodash https://github.com/lodash/lodash/blob/master/shuffle.js
 * to make the shuffling deterministic and repeatable based on a seed which in our case is the
 * QuorumCalculationHash
 */
const shuffleDeterministic = (array, seed) => {
  const length = array == null ? 0 : array.length;

  if (!length) {
    return [];
  }

  let index = -1;
  const lastIndex = length - 1;
  const result = array;
  const rng = new Prando(seed);

  while (index < length) {
    // get pseudo random num generated from rng between 0 (inclusive) and 1 (exclusive);
    // replaces pseudo random generated with Math.random()
    index += 1;
    const num = rng.next();
    const rand = index + Math.floor(num * ((lastIndex - (index + 1))));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
    // adding index number of quorum to result to make later filtering easier
    result[index].num = Math.floor(index / config.quorumSize);
  }

  return result;
};

const getAllQuorums = (mnList, calcHash, full) => {
  const numOfQuorums = Math.floor(mnList.length / config.quorumSize);

  // sort ranked mnList by vin before shuffle
  const sortedMnList = mnList.sort((m1, m2) => {
    if (m1.vin > m2.vin) {
      return 1;
    } else if (m2.vin > m1.vin) {
      return -1;
    }
    return 0;
  });

  const shuffledMnList = shuffleDeterministic(sortedMnList, calcHash);
  const quorums = [];

  for (let i = 0; i < numOfQuorums; i += 1) {
    const q = shuffledMnList.filter(mn => mn.num === i);
    let quorum = {};

    if (full) {
      quorum = { hash: utils.getAverageHash(q), nodes: q };
    } else {
      const outpoints = q.map(mn => (mn.vin));
      quorum = { hash: utils.getAverageHash(q), nodes: outpoints };
    }

    quorums.push(quorum);
  }

  return quorums;
};

const getQuorumForDapi = (mnList, calcHash, vin, full) => {
  // sort ranked mnList by vin before shuffle
  const sortedMnList = mnList.sort((m1, m2) => {
    if (m1.vin > m2.vin) {
      return 1;
    } else if (m2.vin > m1.vin) {
      return -1;
    }
    return 0;
  });

  const shuffledMnList = shuffleDeterministic(sortedMnList, calcHash);

  const mynode = shuffledMnList.find((mn) => {
    if (mn.vin === vin) {
      return mn;
    }
    return null;
  });

  const q = shuffledMnList.filter(mn => mn.num === mynode.num);
  let quorum = {};

  if (full) {
    quorum = { hash: utils.getAverageHash(q), nodes: q };
  } else {
    const outpoints = q.map(mn => (mn.vin));
    quorum = { hash: utils.getAverageHash(q), nodes: outpoints };
  }

  return quorum;
};

const getQuorumForUser = (mnList, calcHash, txid, full) => {
  const quorums = getAllQuorums(mnList, calcHash, full);

  let distance1 = BigInteger.ZERO;
  let qWin = [];

  for (const q of quorums) {
    // distance2 = distance between the candidate quorum's hash and the regTxID
    // the quorum with the closest distance wins
    const distance2 = Math.abs(BigInteger.fromHex(q.hash).subtract(BigInteger.fromHex(txid)));

    if (distance2 > distance1) {
      distance1 = distance2;
    } else {
      qWin = q;
    }
  }
  return qWin;
};

// if txid includes "-" then we know it's a MN collateral outpoint (vin) -
// TODO: maybe better separate entry points?
const getQuorum =
  (list, blockHash, txid, full = false) =>
    (txid.includes('-') ?
      getQuorumForDapi(list, blockHash, txid, full) :
      getQuorumForUser(list, blockHash, txid, full));

const getQuorums =
  (list, quorumCalculationHash, full = false) =>
    getAllQuorums(list, quorumCalculationHash, full);

module.exports = {
  shuffleDeterministic,
  getAllQuorums,
  getQuorumForDapi,
  getQuorumForUser,
  getQuorum,
  getQuorums,
};
