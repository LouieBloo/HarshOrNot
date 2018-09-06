var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../../helpers/users/sanitation');

var profileFeedbackHelper = require('./profile-feedback-helpers');
var pointsManager = require('../../../helpers/points/points');

//adds a new profile-feedback between two users
module.exports.add = async (req, res, next) => {

  console.log("add auth back");
  req.payload = {};
  req.payload._id = req.body.payload;
  await new Promise((resolve, reject) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      reject({ error: errors.mapped() });
      return;
    }
    resolve();
  })

  var validData = matchedData(req);

  await profileFeedbackHelper.checkIfProfileFeedback(req.payload._id, validData.target);//if this fails, reject

  var pointTotals = await pointsManager.givePointsForProfileFeedback(req.payload._id);//give points for giving feedback

  var newProfileFeedback = new profileFeedbackModel();
  newProfileFeedback.source = req.payload._id;
  newProfileFeedback.target = validData.target;
  newProfileFeedback.feedback = validData.feedback;
  newProfileFeedback.pointsGiven = pointTotals.pointsGiven;

  var returnData, error;
  await newProfileFeedback.save().then((data, err) => {
    returnData = data;
    error = err;
  });

  if (error) {
    throw({ error: error });
  }

  returnData = returnData.toJSON();//because we want to add to this object, therefore we must make it a regualr json, not mongoose
  returnData.pointTotals = pointTotals;
  return(returnData);
}
module.exports.addValidation = [
  check('target').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Target"),
  check('feedback').trim().isString().isLength({ min: 0, max: 1000 }).withMessage("Invalid Feedback"),
];