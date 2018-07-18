var mongoose = require('mongoose');
var userModel = mongoose.model('users');

var sanitation = require('../../../helpers/users/sanitation');

var mine = function(req,res,next){
    return new Promise(function(resolve,reject){

        //console.log(req.payload._id);
        userModel.findOne({_id:req.payload._id},(err,result)=>{
            if(result){
                resolve(sanitation.aboutMe(result));
            }
            else{
                resolve({error:"Couldn't find that user!"});
            }
        });
    });
}
  
  module.exports = mine;