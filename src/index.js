/**
 * Bootstrap file for Timbot.
 */

global.TIMBOT_SRC = __dirname;
global.TIMBOT_ROOT = global.TIMBOT_SRC.replace("/src", "");

const Timbot = require('./Core/Timbot');
const _package = require('../package.json');

console.log(`Timbot [Version ${_package.version}]`);
console.log(`https://roydejong.net/timbot`);
console.log('');

Timbot.start();
