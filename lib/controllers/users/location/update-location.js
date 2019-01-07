var mongoose = require('mongoose');
var userModel = mongoose.model('users');
var zipcodes = require('zipcodes');

const { check, validationResult } = require('express-validator/check');

const functionValidator = require('../../../helpers/functionValidation');
const discoverability = require('../profiles/discoverable');


// Updates the users location. This is also done when updating user profile preferences
var validation = [
  check('latitude').trim().isFloat({ min: -90.0, max: 90.0 }).withMessage("Invalid Latitude"),
  check('longitude').trim().isFloat({ min: -180.0, max: 180.0 }).withMessage("Invalid Longitude")
];
var updateLocation = async (req, res, next) => {

  var validData = await functionValidator(req);

  var locationLookup = zipcodes.lookupByCoords(validData.latitude, validData.longitude);
  if (locationLookup == null) {
    throw ({ error: "Invalid coordinates" });
  }

  await userModel.findOneAndUpdate(
    {
      _id: req.payload._id
    },
    {
      location: {
        type: "Point",
        zip: locationLookup.zip,
        coordinates: [validData.longitude, validData.latitude]
      }
    }
  ).then(async (result, err) => {
    if(err){
      throw ({ error: "Couldn't find that user!" });
    }
  })

  //Since we changed their location, update the users discoverability
  await discoverability.update(req.payload._id);

  return ({ result: true });
}

module.exports.update = updateLocation;
module.exports.validation = validation;