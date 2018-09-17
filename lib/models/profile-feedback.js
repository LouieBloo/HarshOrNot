var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('config');

var profileFeedbackSchema = new Schema({

  source:{type:Schema.Types.ObjectId,ref:'users',required:true},
  target:{type:Schema.Types.ObjectId,ref:'users',required:true},

  feedback:{type:String,required:true},
  wouldYouDate:{type:String,required:true},

  wouldTheyDate:{type:String},
  dateCompleted:{type:Date},

  dateAdded:{type:Date,default:Date.now},
  pointsGiven:{type:Number,required:true},

  redeemed:{type:Boolean,default:false},
  redeemedCost:{type:Number},
  dateRedeemed:{type:Date}
});

profileFeedbackSchema.methods.redeem = function(redeemCost){
  this.redeemed = true;
  this.redeemedCost = redeemCost;
  this.dateRedeemed = new Date();
}

module.exports = mongoose.model('profile_feedback',profileFeedbackSchema);