var cf = require('config');
var config = cf.get('twilio');

var twilio = require('./twilio');


module.exports = async (userID, userName) => {
  if (!userID || !userName) {
    throw ("Need correct credentials!");
  }

  return twilio.service.users
    .create({
      identity: userID.toString(),
      friendlyName: userName.toString()
    })
    .then(async (user) => {
      console.log(user);
      return user;
    })
    .catch(async (err) => {
      console.log("from create user: " ,err);
      throw (err);
    })
}