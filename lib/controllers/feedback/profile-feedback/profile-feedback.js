var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../../helpers/users/sanitation');

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

  await checkIfProfileFeedback(req.payload._id, validData.target);

  var newProfileFeedback = new profileFeedbackModel();
  newProfileFeedback.source = req.payload._id;
  newProfileFeedback.target = validData.target;
  newProfileFeedback.feedback = validData.feedback;

  var data, err;
  await newProfileFeedback.save().then((data, err) => {
    this.data = data;
    this.err = err;
  });

  return new Promise((resolve, reject) => {
    if (err) {
      reject({ error: err });
      return;
    }
    resolve(this.data);
  })
}
module.exports.addValidation = [
  check('target').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Target"),
  check('feedback').trim().isString().isLength({ min: 0, max: 1000 }).withMessage("Invalid Feedback"),
];



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

  return getProfileFeedback(req.payload._id, validData.target).then(feedback => {
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


//checks if there is profile-feedback between two people. Rejects if there is
var checkIfProfileFeedback = async (source, target) => {
  return new Promise((resolve, reject) => {
    return getProfileFeedback(source, target).then(() => {//if there is a profile, reject
      reject({ error: "Feedback already exists!" })
    }).catch(() => {
      resolve();
    });
  })
}

//gets a profile-feedback, rejects if there isnt one
var getProfileFeedback = async (source, target) => {
  return profileFeedbackModel.find({
    source: source,
    target: target
  }).then((data, err) => {
    return new Promise((resolve, reject) => {
      if (err) {
        reject({ error: err });
        return;
      }
      if (data && data.length > 0) {
        resolve(data[0]);
        return;
      }
      else {
        reject({ error: "No profile feedback found" });
      }
    })
  })
}