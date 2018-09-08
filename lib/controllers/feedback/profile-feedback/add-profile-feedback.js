var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../../helpers/users/sanitation');

var profileFeedbackHelper = require('./profile-feedback-helpers');

var pointsConfig = require('../../../../config/points/pointCosts.json');

//adds a new profile-feedback between two users
module.exports.add = async (req, res, next) => {

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

  var pointTotals = await givePointsForProfileFeedback(req.payload._id);//give points for giving feedback

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
  delete returnData._id;
  return(returnData);
}
module.exports.addValidation = [
  check('target').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Target"),
  check('feedback').trim().isString().isLength({ min: 0, max: 1000 }).withMessage("Invalid Feedback"),
];



//gives points to user, returns points object
var givePointsForProfileFeedback = async(userID)=>{

  var user,error;
  await UserModel.findById({
    _id:userID
  }).then((data,err)=>{
    user = data;
    error = err;
  })

  if(error){
    throw({error:error});
  }

  //add the points to the db and return the new totals and the amount given
  user.addPoints(pointsConfig.pointsForGivingProfileFeedback);
  await user.save();

  //need to create a new object as the other is tied to mongoose object
  user = user.toJSON().points;//only select the points
  user.pointsGiven = pointsConfig.pointsForGivingProfileFeedback;
  return user;
}