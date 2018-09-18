
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var mongoose = require('mongoose');
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

var sanitation = require('../../../helpers/users/sanitation');
var functionValidator = require('../../../helpers/functionValidation');

var photos = require('../photos/photos');

module.exports.get = async (req, res, next) => {

  var validData = await functionValidator(req);

  var feedback = await profileFeedbackModel.find({
    source: req.payload._id,
    wouldYouDate: "Yes",
    wouldTheyDate: "Yes",
  },
    sanitation.getMatches
  )
  .populate('target', sanitation.getMatchesTarget)
  .limit(parseInt(validData.limit ? validData.limit : 30))
  .sort({ dateCompleted: -1 })
  .then(async (data, err) => {
    if (err) {
      throw ({ error: err });
    }
    return data;
  });

  //always sanitize birthday
  feedback = await Promise.all(feedback.map(async data=>{
    let age = new Date().getFullYear() - data.target.birthday.getFullYear();
    data = data.toJSON();
    data.target.age = age;
    delete data.target.birthday;

    //generate view ready photo urls
    data.target.photos = await photos.generatePhotoURLS(data.target.photos,data.target._id)
    //console.log(photos.generatePhotoURLS(data.target.photos));
    return data;
  }))

  return feedback;
}
module.exports.getValidation = [
  check('limit').optional().isInt({ min: 1, max: 40 }).withMessage("Invalid Limit")
];

