const _ = require('lodash');
const sha256 = require('sha256');
const BigInteger = require('bigi');
const ip = require('ip');
const config = require('./config');

const resolveVinFromIp = (mnList) => {
  const localip = ip.address();
  const match = _.find(mnList, mn => mn.ip === localip);
  return match ? match.vin : null;
};

const resolveVinFromPort = (mnList, port) => {
  const match = _.find(mnList, mn => mn.ip.indexOf(port) > -1);
  return match ? match.vin : null;
};

const getHash = obj => sha256(typeof obj === 'string' ? obj : JSON.stringify(obj));
const getPOWAveragingNum = () => config.POWAveragingNum;
const getHeartBeatInterval = () => config.heartbeatInterval;
const getRefHeight = lastHeight => lastHeight - config.quorumRefHeight;

const getAverageHash = (array) => {
  let avgHash = BigInteger.ZERO;

  for (const el of array) {
    let hash;

    if (el.hash) {
      hash = el.hash;
      hash = revHex(getTrulyRandomBlockHash(hash));
    } else if (el.hasOwnProperty('vin')) {
      hash = el.vin.substring(0, el.vin.indexOf('-'));
    } else {
      throw 'unexpected input for getAverageHash()';
    }

    const bigint = BigInteger.fromHex(hash);
    avgHash = avgHash.add(bigint);
  }

  avgHash = avgHash.divide(new BigInteger(array.length.toString()));
  return avgHash.toHex();
};


// 1: to discuss - weakness in using blockhash as leading zeros will penalise/reward mns with vin collateral closer to extremes in the search space
// mitigate by stripping leading zeros and pad with equal amount from end of the hash?

// 2: to discuss - weakness in same mn's in same quorums while for the same mnLists

// As per (1) remove zeros and pad with end to get a truly random value within the 256-bit search space
// We can also hash the blockhash for same effect with slightly more - albeit negligible - overhead for clients
let getTrulyRandomBlockHash = (blockHash) => {
  const leadingZeros = _.takeWhile(blockHash.split(''), e => e == '0').length;
  return blockHash.substring(blockHash.length - leadingZeros, blockHash.length) + blockHash.substring(leadingZeros, blockHash.length);
};

let revHex = (s) => {
  let r = '';
  let i = 0;
  for (; i < s.length; i += 2) { r = s.slice(i, i + 2) + r; }
  return r;
};

module.exports = {
  resolveVinFromIp,
  resolveVinFromPort,
  getHash,
  getPOWAveragingNum,
  getHeartBeatInterval,
  getRefHeight,
  getAverageHash,
};
