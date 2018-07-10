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

    var newUser = new UserModel();
    newUser.name = validData.name.toLowerCase();
    newUser.email = validData.email;
    newUser.age = validData.age;
    newUser.gender = validData.gender;
    newUser.preference = validData.preference;
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
  check('name').isLength({min:2,max:60}).trim().withMessage("Name must be 2-60 characters long"),
  check('email').isEmail().normalizeEmail().trim().withMessage("Valid email required"),
  check('password').isLength({min:8,max:36}).trim().withMessage("Password must be 8-36 characters long"),
  check('age').isInt({min:18,max:130}).toInt().withMessage("Age must be between 18-130"),
  check('gender').matches(/^(Male|Female)\b/).trim().withMessage("Invalid gender"),
  check('preference').matches(/^(Male|Female)\b/).trim().withMessage("Invalid preference")
];

module.exports = register;
module.exports.validation = validation;