var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../helpers/users/sanitation');
var functionValidator = require('../../helpers/functionValidation');

exports.logUserActivity = async(req,res,next)=>{
  await UserModel.findOneAndUpdate({
    _id:req.payload._id
  },{
    lastOnline:new Date()
  }).then(async (data,err)=>{
    if(err){
      throw{error:err};
    }
  });

  return "activity logged";
}

// module.exports.logUserActivityValidation = [
//   check('target').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Target"),
//   check('feedback').trim().isString().isLength({ min: 0, max: 1000 }).withMessage("Invalid Feedback"),
//   check('wouldYouDate').trim().matches(/^(Yes|NoBut|No)\b/).withMessage("Invalid Would Date")
// ];
