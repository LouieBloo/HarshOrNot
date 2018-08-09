var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require("../../../../helpers/users/sanitation");

var photoConfig = require('../../../../../config/s3.json');

var validation = [
  check('query.name').optional().trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters long"),
  check('query.gender').optional().trim().matches(/^(Male|Female)\b/).withMessage("Invalid gender"),
  check('query.preference').optional().trim().matches(/^(Male|Female|Both)\b/).withMessage("Invalid preference"),
  check('query.bodyType').optional().isArray().withMessage("Invalid body type"),
  check('query.range').optional().isInt({ min: 1, max: 150 }).withMessage("Range must be 1-150"),
  check('query.ageRange.min').optional().isInt({ min: 18, max: 100 }).withMessage("Age min must be 18-100"),
  check('query.ageRange.max').optional().isInt({ min: 18, max: 100 }).withMessage("Age max must be 18-100"),
  check('query.useRange').optional().isBoolean().withMessage("Use Range must be a boolean"),
  check('query').withMessage("Need query")
];
module.exports.validation = validation;
module.exports.search = function (req, res, next) {
  return new Promise(function (resolve, reject) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      reject({ error: errors.mapped() });
      return;
    }
    var validData = matchedData(req);

    var searchFilter = {};//after the search, only these fields will be returned. Some fields have logic attached
    var finalAggregateQuery = [];

    //fetch our coordinates to use in search, then continue from that callback
    UserModel.find({ _id: req.payload._id }, "name location.coordinates", function (err, result) {

      if (!err && result && result[0]) {
        //if user is searching by location, add the geoNear aggregate
        if (validData.query.useRange) {
          finalAggregateQuery.push({
            $geoNear: {
              near: { type: "Point", coordinates: [result[0].location.coordinates[0], result[0].location.coordinates[1]] },
              maxDistance: (validData.query.range / 0.00062137),//miles to m
              spherical: true,
              distanceField: "distance",
            }
          });
        }

        //append to the search filter
        if (validData.query.gender) { searchFilter.gender = validData.query.gender; }
        if (validData.query.preference) { searchFilter.preference = validData.query.preference; }
        if (validData.query.bodyType && validData.query.bodyType.length > 0) { searchFilter.bodyType = { $in: validData.query.bodyType }; }

        //do min and max age calcs
        var minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - validData.query.ageRange.min);
        var maxAgeDate = new Date();
        maxAgeDate.setFullYear(maxAgeDate.getFullYear() - (validData.query.ageRange.max + 1));//+1 because we look at least 1 year ahead
        searchFilter.birthday = { $gte: maxAgeDate, $lte: minAgeDate };//append to search filter

        //push the final parameters in the query array
        finalAggregateQuery.push({
          $match: searchFilter
        },
          {
            $project: sanitation.allSearch
          });

        //console.log(finalAggregateQuery);

        //actually perform the search
        UserModel.aggregate(
          finalAggregateQuery
          ,
          function (err, result) {
            if (err) {
              console.log(err);
            }
            //add url to photo if it exists
            //I tried to do this in the sanitation $project, but we need the _id. I guess this is a 
            //known bug but you cant cast the _id into a string on an aggregate request
            if (result && result.length > 0) {
              var index = 0;//so we know when all have processed
              result.forEach(element => {
                if (element.photo && element.photo.length > 0) {
                  element.photo = photoConfig.basePhotoURL + element._id + "/photos/" + element.photo;
                }
                index++;
                if (index >= result.length) {
                  resolve(result);
                }
              })
            } else {
              resolve(result);
            }
          }
        )
      }
      else {
        reject({ error: "Something went wrong finding user!" });
      }
    })
  })
}

