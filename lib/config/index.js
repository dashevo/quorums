let config;

try {
	config = require('./config.json');
	console.info('Using config from config.json');
} catch (e) {
	console.warn('No config.json file was provided in lib/config');
	console.warn('Using default config instead');
	config = require('./default.config.json');
}

/**
 * @returns {Config}
 */
function getConfig() {
	return config;
}

/**
 * @type {Config}
 */
module.exports = getConfig();