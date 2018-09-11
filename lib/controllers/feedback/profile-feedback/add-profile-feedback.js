var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../../helpers/users/sanitation');
var functionValidator = require('../../../helpers/functionValidation');

var profileFeedbackHelper = require('./profile-feedback-helpers');

var pointsConfig = require('../../../../config/points/pointCosts.json');

//adds a new profile-feedback between two users
module.exports.add = async (req, res, next) => {

  var validData = await functionValidator(req);
  
  await profileFeedbackHelper.checkIfProfileFeedback(req.payload._id, validData.target);//if this fails, reject

  var pointTotals = await givePointsForProfileFeedback(req.payload._id);//give points for giving feedback

  var newProfileFeedback = new profileFeedbackModel();
  newProfileFeedback.source = req.payload._id;
  newProfileFeedback.target = validData.target;
  newProfileFeedback.feedback = validData.feedback;
  newProfileFeedback.pointsGiven = pointTotals.pointsGiven;
  newProfileFeedback.wouldYouDate = validData.wouldYouDate;

  var returnData = await newProfileFeedback.save().then((data, err) => {
    if (err) {
      throw ({ error: err });
    }
    return data;
  });


  returnData = returnData.toJSON();//because we want to add to this object, therefore we must make it a regualr json, not mongoose
  returnData.pointTotals = pointTotals;
  delete returnData._id;
  return (returnData);
}
module.exports.addValidation = [
  check('target').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Target"),
  check('feedback').trim().isString().isLength({ min: 0, max: 1000 }).withMessage("Invalid Feedback"),
  check('wouldYouDate').trim().matches(/^(Yes|NoBut|No)\b/).withMessage("Invalid Would Date")
];



//gives points to user, returns points object
var givePointsForProfileFeedback = async (userID) => {

  var user = await UserModel.findById({
    _id: userID
  }).then((data, err) => {
    if (err) {
      throw ({ error: err });
    }
    return data;
  })

  //add the points to the db and return the new totals and the amount given
  user.addPoints(pointsConfig.pointsForGivingProfileFeedback);
  await user.save();

  //need to create a new object as the other is tied to mongoose object
  user = user.toJSON().points;//only select the points
  user.pointsGiven = pointsConfig.pointsForGivingProfileFeedback;
  return user;
}