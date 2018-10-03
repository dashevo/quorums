const { message } = require('@dashevo/dashcore-lib');
const _ = require('lodash');
const { getQuorum } = require('./determination');

const Validate = (data, signature, quorumData) => // QDEVTEMP - rm tempPort
  new Promise(((resolve) => {
    if (message(JSON.stringify(data)).verify(quorumData.refAddr, signature)) {
      const quorum = getQuorum(quorumData.mnList, quorumData.calcHash, data.txId);

      // todo: temp until rpc to get outpoint
      // let vin = quorumsUtil.resolveVinFromPort(quorumData.mnList, qTempPort);
      if (quorumData.proRegTxHash) {
        if (_.find(quorum, q => q.proRegTxHash === quorumData.proRegTxHash)) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else if (quorumData.vin) {
        if (_.find(quorum, q => q.vin === quorumData.vin)) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    } else {
      resolve(false);
    }
  }));

const validate = (data, signature, quorumData, qTempPort) => // QDEVTEMP - rm tempPort
  Validate(data, signature, quorumData, qTempPort);

module.exports = {
  validate,
};
