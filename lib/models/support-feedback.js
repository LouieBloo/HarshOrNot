var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userFeedback = new Schema({

  source:{type:Schema.Types.ObjectId,ref:'users',required:true},
  feedback:{type:String,required:true},
  //bug, feedback
  type:{type:String,required:true},
  
  dateCreated:{type:Date,default:Date.now},

});


module.exports = mongoose.model('support_feedback',userFeedback);