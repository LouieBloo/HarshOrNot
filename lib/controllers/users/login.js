var passport = require('passport');
var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const{check,validationResult} = require('express-validator/check');
const{matchedData,sanitize} = require('express-validator/filter');

var login = function(req,res,next)
{
  return new Promise(function(resolve,reject){

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      reject({error:errors.mapped()});
      return;
    }

    //var validData = matchedData(req);

    passport.authenticate('local',function(err,user,info){
      if(err){
        reject({error:err});
      }else if(user){//found a user, password matches!
        resolve({
          token:user.generateJwt(),
          _id:user._id
        });
      }
      else{
        reject({error:"Invalid email or password"});
      }
    })(req,res);
  });
}

var validation = [
  check('email').isEmail().normalizeEmail().trim().withMessage("Invalid email"),
  check('password').trim().withMessage("Password required")
];

module.exports = login;
module.exports.validation = validation;
