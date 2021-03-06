var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const userConfig = require('../../../config/users/users.json');


const functionValidator = require('../../helpers/functionValidation');
const emails = require('../emails/emails');

module.exports = async (req, res, next) => {

  var validData = await functionValidator(req);

  //make sure this email isn't taken
  await checkIfEmailExists(validData.email);

  //need to check if 18 years old
  var minDate = new Date();
  minDate.setUTCFullYear(minDate.getUTCFullYear() - 18);

  if (validData.birthday > minDate) {
    throw({ error: "Too young" });
  }
  //get a unique register token to validate their email address
  let registerToken = await emails.getRegisterToken();

  var newUser = new UserModel();
  newUser.name = validData.name.toLowerCase();
  newUser.email = validData.email;
  newUser.registration.emailToken = registerToken;
  newUser.birthday = new Date(validData.birthday);
  newUser.gender = validData.gender;
  newUser.preference = validData.preference;
  newUser.bodyType = validData.bodyType;
  newUser.setPassword(validData.password);
  newUser.location = { "type": "Point", "coordinates": [-121, 38] };
  newUser.bodyTypePreference = userConfig.bodyTypes;

  //save the user
  await newUser.save().then(async (data,err)=>{
    console.log(data)
    if(err){
      throw({error:err});
    }
  }).catch(async(err)=>{
    console.log(err);
  });

  //send email to confirm email
  await emails.sendRegisterEmail(validData.email,registerToken);

  return {result:"Registered"};
}
module.exports.validation = [
  check('name').trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters long"),
  check('email').trim().isEmail().normalizeEmail().withMessage("Valid email required"),
  check('password').trim().isLength({ min: 8, max: 36 }).withMessage("Password must be 8-36 characters long"),
  check('birthday').trim().toDate().withMessage("Age must be between 18-130"),
  check('gender').trim().matches(/^(Male|Female)\b/).withMessage("Invalid gender"),
  check('preference').trim().matches(/^(Male|Female|Both)\b/).withMessage("Invalid preference"),
  check('bodyType').trim().matches(/^(Thin|Athletic|Average|Plus|Very Plus)\b/).withMessage("Invalid body type")
];

//Verifys the registration email token
module.exports.verifyToken = async(req,res,next)=>{
  var validData = await functionValidator(req);

  let user = await UserModel.findOne({
    "registration.emailToken":validData.token
  }).then(async(data,err)=>{    
    if(err){
      throw{error:err}
    }else if(!data){
      throw({result:"Invalid Token"});
    }

    return data;
  });

  await setEmailVerified(user._id);

  return {result:"Verified"}
}
module.exports.verifyValidation = [
  check('token').trim().isLength({ min: 2, max: 60 }).withMessage("Token required"),
];

//Set email to registered
var setEmailVerified = async(userID)=>{
  await UserModel.findOneAndUpdate({
    _id:mongoose.Types.ObjectId(userID)
  },{
    registration:{
      validEmail:true,
      emailToken:""
    }
  }).then(async(data,err)=>{
    if(err){
      throw({error:err})
    }
  })
}

//checks if given email is already registered with a user
var checkIfEmailExists = async(email)=>{
  await UserModel.findOne({
    email:email
  }).then(async(data,err)=>{
    if(data){
      throw({error:"Email Exists"});
    }
  })
}