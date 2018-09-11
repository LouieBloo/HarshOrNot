var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../../helpers/users/sanitation');
var functionValidator = require('../../../helpers/functionValidation');

var profileFeedbackHelper = require('./profile-feedback-helpers');
var dateHelper = require('../../../helpers/dates/dates');

var pointsConfig = require('../../../../config/points/pointCosts.json');

//gets a profile-feedback between two users.
//doesnt check if feedback has been unlocked
module.exports.getSingle = async (req, res, next) => {

  var validData = await functionValidator(req);

  return profileFeedbackHelper.getProfileFeedback(req.payload._id, validData.target).then(feedback => {
    return feedback;
  });//no catch as the error filters up
}
module.exports.getValidation = [
  check('target').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Target"),
];


//gets all the feedback about the user
//the reason we dont do a join on the tables to get the user profiles 
//is because of sharding
module.exports.getFeedbackAboutMe = async (req, res, next) => {
  var validData = await functionValidator(req);


  //grab all X profile feedbacks
  var feedback = await profileFeedbackModel.find({
    target: req.payload._id
  },
    sanitation.profileFeedbackAboutMe
  )
  .populate('source',sanitation.profileFeedbackAboutMeUser)
  .limit(parseInt(validData.limit ? validData.limit : 20))
  .then(async(data, err) => {
    if (err) {
      throw ({ error: err })
    }

    return data;
  })

  //calculate age here since we are not aggregating
  //also remove the feedback if it is not redeemed
  feedback = await Promise.all(feedback.map(data=>{
    let age = new Date().getFullYear() - data.source.birthday.getFullYear();
    data = data.toJSON();
    data.source.age = age;

    if(!data.redeemed){
      delete data.feedback;
    }

    delete data.source.birthday;//always sanitize birthday
    //to have consistency for the view layer, always put the source into the user slot of the return object
    data.user = data.source;
    data.source = data.source._id;
    data.costToRedeem = pointsConfig.redeemCostForProfileFeedback;

    return data;
  }))

  return feedback;
}
module.exports.getFeedbackAboutMeValidation = [
  check('limit').optional().isInt({ min: 1, max: 40 }).withMessage("Invalid Limit"),
];

//gets all the feedback the user has given
//the reason we dont do a join on the tables to get the user profiles 
//is because of sharding
module.exports.getFeedbackIGave = async (req, res, next) => {
  var validData = await functionValidator(req);

  //grab all X profile feedbacks
  var feedback;
  await profileFeedbackModel.find({
    source: req.payload._id
  },
    sanitation.profileFeedbackIGave
  )
  .populate('target',sanitation.profileFeedbackIGaveUser)
  .limit(parseInt(validData.limit ? validData.limit : 20))
  .then(async(data, err) => {
    if (err) {
      throw ({ error: err })
    }

    feedback = data;
  })


  //calculate age here since we are not aggregating
  //also do some work on the data to get it ready to send out
  feedback = await Promise.all(feedback.map(data=>{
    let age = new Date().getFullYear() - data.target.birthday.getFullYear();

    data = data.toJSON();

    data.target.age = age;
    delete data.target.birthday;//always sanitize birthday

    //to have consistency for the view layer, always put the target into the user slot of the return object
    data.user = data.target;
    data.target = data.target._id;

    return data;
  }))

  return feedback;
}
module.exports.getFeedbackIGaveValidation = [
  check('limit').optional().isInt({ min: 1, max: 40 }).withMessage("Invalid Limit"),
];
