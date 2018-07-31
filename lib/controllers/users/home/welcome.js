var passport = require('passport');
var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

var sanitation = require('../../../helpers/users/sanitation');

exports.welcome = function(req,res,next)
{
  return new Promise(function(resolve,reject){
    UserModel.findOne(
        {_id:req.payload._id
        },
            sanitation.welcome
        ,
        function(err,result){
            resolve(result);
        }
    )  
  });
}

