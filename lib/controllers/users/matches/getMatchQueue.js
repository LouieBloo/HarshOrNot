
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var mongoose = require('mongoose');
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

var sanitation = require('../../../helpers/users/sanitation');
var functionValidator = require('../../../helpers/functionValidation');

var photos = require('../photos/photos');

var limit = 4;

module.exports.get = async (req, res, next) => {

  var validData = await functionValidator(req);

  var feedback = await profileFeedbackModel.find({
    target: req.payload._id,
    wouldYouDate: "Yes",
    wouldTheyDate: null,
  },
    sanitation.getMatches
  )
  .populate('source', sanitation.getMatchesTarget)
  .limit(parseInt(limit))
  .sort({ dateAdded: -1 })
  .then(async (data, err) => {
    if (err) {
      throw ({ error: err });                    
    }
    return data;
  });

  //always sanitize birthday
  feedback = await Promise.all(feedback.map(async data=>{
    let age = new Date().getFullYear() - data.source.birthday.getFullYear();
    data = data.toJSON();
    data.source.age = age;
    delete data.source.birthday;

    //generate view ready photo urls
    data.source.photos = await photos.generatePhotoURLS(data.source.photos,data.source._id)

    //for consistency in the view layer
    let tempSource = data.source;
    data.source = data.target;
    data.target = tempSource;
    //console.log(photos.generatePhotoURLS(data.source.photos));
    return data;
  }))

  return feedback;
}
module.exports.getValidation = [
];

