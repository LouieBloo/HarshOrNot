var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../../helpers/users/sanitation');

var profileFeedbackHelper = require('./profile-feedback-helpers');

//gets a profile-feedback between two users. 
module.exports.getSingle = async (req, res, next) => {
  await new Promise((resolve, reject) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      reject({ error: errors.mapped() });
      return;
    }
    resolve();
  })

  var validData = matchedData(req);

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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw { error: errors.mapped() };
  }

  let validData = matchedData(req);


  var finalResult;

  //grab all X profile feedbacks
  var feedback;
  await profileFeedbackModel.find({
    target: req.payload._id
  },
    sanitation.profileFeedbackAboutMe
  )
  .limit(parseInt(validData.limit ? validData.limit : 20))
  .then((data, err) => {
    if (err) {
      throw ({ error: err })
    }

    feedback = data;
  })

  //create monogoose object ids out of the result
  var promises = feedback.map(async item => {
    return mongoose.Types.ObjectId(item.source);
  })

  //this will contain an array of source id's from the feedback
  var sourceIds = await Promise.all(promises);

  //grab the sources user profiles
  await userModel.aggregate([
    {
      $match: { _id: { $in: sourceIds } }
    },
    {
      $project: sanitation.profileFeedbackAboutMeUser
    }
  ]
  ).then((data, err) => {
    if (err) {
      throw ({ error: err });
    }

    finalResult = data;
  })

  //now we need to combine the actual feedback with the profiles, then return
  return Promise.all(finalResult.map(async item => {
    var found = feedback.find(feedElem => {
      return feedElem.source == item._id;
    })

    //todo, make this use regular sanitation strategies
    item.feedback = { dateAdded: found.dateAdded, feedback: found.feedback };
    delete item._id;
    return item;
  }))
}
module.exports.getFeedbackAboutMeValidation = [
  check('limit').optional().isInt({ min: 1, max: 40 }).withMessage("Invalid Limit"),
];

//gets all the feedback the user has given
//the reason we dont do a join on the tables to get the user profiles 
//is because of sharding
module.exports.getFeedbackIGave = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw { error: errors.mapped() };
  }

  let validData = matchedData(req);

  var finalResult;

  //grab all X profile feedbacks
  var feedback;
  await profileFeedbackModel.find({
    source: req.payload._id
  },
    sanitation.profileFeedbackIGave
  )
    .limit(parseInt(validData.limit ? validData.limit : 20))
    .then((data, err) => {
      if (err) {
        throw ({ error: err })
      }

      feedback = data;
    })

  console.log(req.payload._id);
  //create monogoose object ids out of the result
  //this will contain an array of source id's from the feedback
  var sourceIds = await Promise.all(feedback.map(async item => {
    return mongoose.Types.ObjectId(item.target);
  }));

  //grab the sources user profiles
  await userModel.aggregate([
    {
      $match: { _id: { $in: sourceIds } }
    },
    {
      $project: sanitation.profileFeedbackIGaveUser
    }
  ]
  ).then((data, err) => {
    if (err) {
      throw ({ error: err });
    }

    finalResult = data;
  })

  //now we need to combine the actual feedback with the profiles, then return
  return Promise.all(finalResult.map(async item => {
    var found = feedback.find(feedElem => {
      return feedElem.target == item._id;
    })

    //todo, make this use regular sanitation strategies
    item.feedback = { dateAdded: found.dateAdded, feedback: found.feedback };
    return item;
  }))
}
module.exports.getFeedbackIGaveValidation = [
  check('limit').optional().isInt({ min: 1, max: 40 }).withMessage("Invalid Limit"),
];
