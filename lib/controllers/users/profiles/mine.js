var mongoose = require('mongoose');
var userModel = mongoose.model('users');

var mine = function(req,res,next){
    return new Promise(function(resolve,reject){

        //console.log(req.payload._id);
        userModel.findOne({_id:req.payload._id},(err,result)=>{
            if(result){
                resolve({
                    name:result.name,
                    email:result.email,
                    age:result.age,
                    gender:result.gender,
                    preference:result.preference,
                    bio:result.bio
                });
            }
            else{
                resolve({error:"Couldn't find that user!"});
            }
        });
    });
}
  
  module.exports = mine;