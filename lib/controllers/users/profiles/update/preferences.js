var mongoose = require('mongoose');
var userModel = mongoose.model('users');
var zipcodes = require('zipcodes');

const{check,validationResult} = require('express-validator/check');
const{matchedData,sanitize} = require('express-validator/filter');

var sanitation = require('../../../../helpers/users/sanitation');

var preferences = function(req,res,next){
    return new Promise(function(resolve,reject){

        const errors = validationResult(req);
        if(!errors.isEmpty()){
          reject({error:errors.mapped()});
          return;
        }
    
        var validData = matchedData(req);

        var locationLookup = zipcodes.lookup(validData.location.zip);
        if(locationLookup == null){
            reject({error:"Invalid zipcode"});
            return;
        }

        console.log(locationLookup);

        userModel.findOneAndUpdate(
            {_id:req.payload._id},
            {
                bio:validData.bio,
                preference:validData.preference,
                location:locationLookup
            },
            {
                new:true//so we get the updated document
            },
            (err,result)=>{
                if(result){
                    console.log("updated....");
                    console.log(result);
                    resolve(sanitation.aboutMe(result));
                }
                else{
                    resolve({error:"Couldn't find that user!"});
                }
            }
        );
    });
}

var validation = [
    check('bio').trim().isLength({min:0,max:1000}).withMessage("Bio must be less than 1000 characters"),
    check('preference').trim().matches(/^(Male|Female)\b/).withMessage("Invalid preference"),
    check('location.zip').trim().isLength({min:5,max:5}).isNumeric().withMessage("Zip must be 5 digits long")
];

module.exports = preferences;
module.exports.validation = validation;