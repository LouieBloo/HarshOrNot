var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const{check,validationResult} = require('express-validator/check');
const{matchedData,sanitize} = require('express-validator/filter');

var register = function(req,res,next){
  return new Promise(function(resolve,reject){

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      reject({error:errors.mapped()});
      return;
    }

    var validData = matchedData(req);

    //need to check if 18 years old
    var minDate = new Date();
    minDate.setUTCFullYear(minDate.getUTCFullYear()-18);

    if(validData.birthday > minDate){
      reject({error:"Too young"});
      return;
    }

    var newUser = new UserModel();
    newUser.name = validData.name.toLowerCase();
    newUser.email = validData.email;
    newUser.birthday = new Date(validData.birthday);
    newUser.gender = validData.gender;
    newUser.preference = validData.preference;
    newUser.bodyType = validData.bodyType;
    newUser.setPassword(validData.password);

    newUser.save(function(err){
      if(err){
        reject({
          error:err
        });
      }
      else{
        resolve({
          token:newUser.generateJwt()
        });
      }
    });
  });
}

var validation = [
  check('name').trim().isLength({min:2,max:60}).withMessage("Name must be 2-60 characters long"),
  check('email').trim().isEmail().normalizeEmail().withMessage("Valid email required"),
  check('password').trim().isLength({min:8,max:36}).withMessage("Password must be 8-36 characters long"),
  check('birthday').trim().toDate().withMessage("Age must be between 18-130"),
  check('gender').trim().matches(/^(Male|Female)\b/).withMessage("Invalid gender"),
  check('preference').trim().matches(/^(Male|Female)\b/).withMessage("Invalid preference"),
  check('bodyType').trim().matches(/^(Thin|Althletic|Average|Plus|Very Plus)\b/).withMessage("Invalid body type")
];

module.exports = register;
module.exports.validation = validation;