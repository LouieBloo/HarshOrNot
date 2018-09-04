var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('config');

var profileFeedbackSchema = new Schema({

  source:{type:String,required:true},
  target:{type:String,required:true},
  feedback:{type:String,required:true},
  dateAdded:{type:Date,default:Date.now},
  redeemed:{type:Boolean,default:false},
  dateRedeemed:{type:Date}
});

module.exports = mongoose.model('profile_feedback',profileFeedbackSchema);