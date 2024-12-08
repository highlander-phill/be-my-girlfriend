// Debug logger
const fs = require('fs');
const path = require('path');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFileSync(path.join(__dirname, 'debug.log'), logMessage);
}

module.exports = { log };
