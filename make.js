const debug = require('debug');
const wilu = require('./index.js');
const pkg = require('./package.json');

const log = debug('wilu:make');

(async function () {
	try {
		await wilu(pkg);
	} catch(e) {
		log(e);
	}
})();
