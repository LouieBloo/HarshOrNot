var mongoose = require('mongoose');

var userModel = mongoose.model('users');

const sanitation = require('../../../helpers/users/sanitation');

var photos = require('../photos/photos');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');


module.exports = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw { error: errors.mapped() };
  }

  let validData = matchedData(req);

  //we need to get our coordinates so we get the users distance to us
  let ourUserCoordinates = await userModel.findOne({ _id: req.payload._id }, "name location.coordinates");

  finalAggregateQuery = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [ourUserCoordinates.location.coordinates[0], ourUserCoordinates.location.coordinates[1]] },
        maxDistance: 99999999,
        spherical: true,
        distanceField: "distance",
      }
    },
    {
      $match: { _id: mongoose.Types.ObjectId(validData._id) }
    },
    {
      $project: sanitation.publicDatingProfile
    }
  ];

  let user = await userModel.aggregate(finalAggregateQuery);
  if (user.length > 0) {

    let test = await photos.generatePhotoURLS(user[0].photos, validData._id)
    user[0].photos = test;

    user[0].distance = await sanitation.distanceRounding(user[0].distance);

    return user[0];
  } else {
    return { error: "No user found" };
  }
}
module.exports.validation = [
  check('_id').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid User ID")
];