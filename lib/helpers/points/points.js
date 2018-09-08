var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

var pointsConfig = require('../../../config/points/pointCosts.json');

//gives points to user, returns points object
exports.givePointsForProfileFeedback = async(userID)=>{

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

exports.canUnlockProfileView = async(userID)=>{
  await UserModel.find({
    _id:userID
  }).then((err,data)=>{
    console.log("er: ",err);
    console.log("data: ",data);
  })
}