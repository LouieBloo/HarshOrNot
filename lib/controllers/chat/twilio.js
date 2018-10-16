var cf = require('config');
var config = cf.get('twilio');

module.exports.client = require('twilio')(config.accountSID, config.auth);
module.exports.service = this.client.chat.services(config.serviceID);