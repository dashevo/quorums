const message = require('bitcore-message-dash');
const getQuorum = require('./determination').getQuorum;
const quorumsUtil = require('./utils');
const _ = require('lodash');

module.exports = {
  validate(data, signature, quorumData, qTempPort) { // QDEVTEMP - rm tempPort
    return Validate(data, signature, quorumData, qTempPort);
  },
};

var Validate = function (data, signature, quorumData, qTempPort) { // QDEVTEMP - rm tempPort
  return new Promise(((resolve, reject) => {
    if (message(JSON.stringify(data)).verify(quorumData.refAddr, signature)) {
      const quorum = getQuorum(quorumData.mnList, quorumData.calcHash, data.txId);

      // todo: temp until rpc to get outpoint
      // let vin = quorumsUtil.resolveVinFromPort(quorumData.mnList, qTempPort);

      if (_.find(quorum, q => q.vin == quorumData.vin)) {
        resolve(true);
      } else {
        resolve(false);
      }
    } else {
      resolve(false);
    }
  }));
};
