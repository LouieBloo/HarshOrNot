const twilio = require('twilio');

var cf = require('config');
var config = cf.get('twilio');

const AccessToken = twilio.jwt.AccessToken;
const IpMessagingGrant = AccessToken.ChatGrant;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserModel = mongoose.model('users');

const { check } = require('express-validator/check');

const functionValidator = require('../../helpers/functionValidation');
const createTwilioUser = require('./createUser');

module.exports.validation = [
  check('device').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Device")
];
module.exports.generateToken = async (req, res, next) => {

  var validData = await functionValidator(req);

  //grab the user from the database to check if they have a twilioID or not
  let user = await UserModel.findById(req.payload._id)
  .then(async (user, err) => {
    if (err) {
      throw ({ error: "Couldn't find user" });
    }
    return user;
  })

  //user doesn't have a twilio id, so create them in twilio
  if (!user.twilioID) {
    let twilioUser = await createTwilioUser(user._id, user.name)
    .catch(async (err) => {
      if (err.code == 50201) {//50201 is user already exists, this is fine so catch it gracefully
        console.log("User already created? how!?")
      } else {
        throw (err);
      }
    })
    if(twilioUser){
      twilioUser.toJSON();
      user.setTwilioID(twilioUser.sid);
      await user.save().then(nothing=>{});
    }
  }


  var identity = req.payload._id;
  var deviceId = validData.device;

  const appName = 'Harsh';

  // Create a unique ID for the client on their current device
  const endpointId = appName + ':' + identity + ':' + deviceId;

  // Create a "grant" which enables a client to use IPM as a given user,
  // on a given device
  const ipmGrant = new IpMessagingGrant({
    serviceSid: config.serviceID,
    endpointId: endpointId,
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    config.accountSID,
    config.sid,
    config.key
  );

  token.addGrant(ipmGrant);
  token.identity = identity;

  return { twilioToken: token.toJwt() };
}