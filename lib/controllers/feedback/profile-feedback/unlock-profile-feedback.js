var mongoose = require('mongoose');
var UserModel = mongoose.model('users');
var ProfileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var pointsConfig = require('../../../../config/points/pointCosts.json');

//gives points to user, returns points object
exports.unlockProfileFeedback = async(req,res,next)=>{
  await new Promise((resolve, reject) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      reject({ error: errors.mapped() });
      return;
    }
    resolve();
  })
  var validData = matchedData(req);

  //grab target profile feedback and go through a few validation checks
  var feedback = await ProfileFeedbackModel.findById({
    _id:validData.feedbackID
  }).then((data,err)=>{
    if(err){
      throw({error:err});
    }
    else if(data.target != req.payload._id){
      throw({error:"Not target of feedback"});
    }
    else if(data.redeemed){
      throw({error:"Already redeemed"});
    }

    return data;
  })


  //grab the user, also check to see if they have enough points to redeem
  var user = await UserModel.findById({
    _id:req.payload._id
  }).then((data,err)=>{
    
    if(err){
      throw({error:err});
    }
    else if(data.points.current < pointsConfig.redeemCostForProfileFeedback){
      throw({error:"Not enough points"});
    }

    return data;
  })

  //remove the points
  user.subtractPoints(pointsConfig.redeemCostForProfileFeedback);
  await user.save();

  //set feedback to redeemed
  feedback.redeem(pointsConfig.redeemCostForProfileFeedback);
  await feedback.save();

  //need to create a new object as the other is tied to mongoose object
  feedback = feedback.toJSON();
  user = user.toJSON().points;//only select the points
  user.pointsSubtracted = pointsConfig.redeemCostForProfileFeedback;
  feedback.user = user;

  delete feedback._id;
  delete feedback.source;

  return feedback;
}
module.exports.validation = [
  check('feedbackID').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Feedback ID"),
];