var mongoose = require('mongoose');
var userModel = mongoose.model('users');

const{check,validationResult} = require('express-validator/check');
const{matchedData,sanitize} = require('express-validator/filter');

var preferences = function(req,res,next){
    return new Promise(function(resolve,reject){

        const errors = validationResult(req);
        if(!errors.isEmpty()){
          reject({error:errors.mapped()});
          return;
        }
    
        var validData = matchedData(req);

        console.log(validData);
        console.log(req.body);

        userModel.findOneAndUpdate(
            {_id:req.payload._id},
            {bio:validData.bio,preference:validData.preference},
            (err,result)=>{
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
            }
        );
    });
}

var validation = [
    check('bio').isLength({min:0,max:1000}).trim().withMessage("Bio must be less than 1000 characters"),
    check('preference').matches(/^(Male|Female)\b/).trim().withMessage("Invalid preference")
];

module.exports = preferences;
module.exports.validation = validation;