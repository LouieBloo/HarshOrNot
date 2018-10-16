const twilio = require('twilio');

var cf = require('config');
var config = cf.get('twilio');

const AccessToken = twilio.jwt.AccessToken;
const IpMessagingGrant = AccessToken.ChatGrant;

const { check } = require('express-validator/check');

const functionValidator = require('../../helpers/functionValidation');

module.exports.validation = [
  check('device').trim().isLength({min:2,max:60}).withMessage("Invalid Device")
];
module.exports.generateToken = async (req,res,next) =>{

  var validData = await functionValidator(req);

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

  return {twilioToken:token.toJwt()};
}