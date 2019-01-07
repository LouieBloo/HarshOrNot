var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SupportModel = mongoose.model('support_feedback');
const UserModel = mongoose.model('users');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../helpers/users/sanitation');
var functionValidator = require('../../helpers/functionValidation');

const email = require('../emails/emails');


//logs bug and feedback reports from the users
module.exports.giveFeedback = async(req,res,next)=>{

  let validData = await functionValidator(req);

  let feedback = new SupportModel();
  feedback.source = mongoose.Types.ObjectId(req.payload._id);
  feedback.type = validData.type;
  feedback.feedback = validData.feedback;

  //save the feedback
  await feedback.save().then(async (data,err)=>{
    if(err){
      throw({error:err});
    }
  }).catch(async(err)=>{
    console.log(err);
  });

  let user = await UserModel.findById(req.payload._id);

  await email.sendSupportFeedback(validData.feedback,validData.type,user.name,req.payload._id);

  return({result:true});
}

module.exports.validation = [
  check('type').trim().matches(/^(Bug|Feedback)\b/).withMessage("Invalid feedback type"),
  check('feedback').trim().isString().isLength({ min: 0, max: 1000 }).withMessage("Invalid Feedback"),
];
