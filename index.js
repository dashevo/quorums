const determination = require('./lib/determination');
const validation = require('./lib/validation');
const utils = require('./lib/utils');
const mocks = require('./lib/mocks');
const config = require('./lib/config');

module.exports = {
	getQuorum: determination.getQuorum,
	getQuorums: determination.getQuorums,
	validate: validation.validate,
	resolveVinFromIp: utils.resolveVinFromIp,
	getHash: utils.getHash,
	getAverageHash: utils.getAverageHash,
	getRefHeight: utils.getRefHeight,
	getHeartBeatInterval: utils.getHeartBeatInterval,
	getDynamicMnList: mocks.getDynamicMnList,
	getPOWAveragingNum: utils.getPOWAveragingNum,
	getConfig: config.getConfig
}