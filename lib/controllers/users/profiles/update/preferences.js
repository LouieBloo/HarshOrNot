var mongoose = require('mongoose');
var userModel = mongoose.model('users');
var zipcodes = require('zipcodes');

const{check,validationResult} = require('express-validator/check');
const{matchedData,sanitize} = require('express-validator/filter');

var sanitation = require('../../../../helpers/users/sanitation');
const functionValidator = require('../../../../helpers/functionValidation');

var preferences = async(req,res,next)=>{
    
    var validData = await functionValidator(req);

    var locationLookup = zipcodes.lookup(validData.location.zip);
    if(locationLookup == null){
        throw({error:"Invalid zipcode"});
    }
    //console.log(validData);

    let finalBodyTypePreference = await bodyTypeFilter(validData.bodyTypePreference);

    return userModel.findOneAndUpdate(
        {
            _id:req.payload._id
        },
        {
            bio:validData.bio,
            preference:validData.preference,
            bodyTypePreference:finalBodyTypePreference,
            range:validData.range,
            ageRange:validData.ageRange,
            location:{
                type:"Point",
                zip:locationLookup.zip,
                coordinates:[locationLookup.longitude,locationLookup.latitude]
            }
        },{
            select:sanitation.aboutMe,
            new:true
        }
    ).then(async(result,err)=>{
        console.log("done");
        if(result){
            return(result);
        }
        else{
            console.log(err);
            throw({error:"Couldn't find that user!"});
        }
    }).catch(async(err)=>{
        console.log(err," bb")
    });

}

var validation = [
    check('bio').trim().isLength({min:0,max:1000}).withMessage("Bio must be less than 1000 characters"),
    check('preference').trim().matches(/^(Male|Female|Both)\b/).withMessage("Invalid preference"),
    check('bodyTypePreference').optional().isArray().withMessage("Invalid body type preference"),
    check('location.zip').trim().isLength({min:5,max:5}).isNumeric().withMessage("Zip must be 5 digits long"),
    check('range').isInt({min:1,max:150}).withMessage("Range must be 1-150"),
    check('ageRange.min').isInt({min:18,max:100}).withMessage("Age min must be 18-100"),
    check('ageRange.max').isInt({min:18,max:100}).withMessage("Age max must be 18-100")
];

//always set the users preference to all body types, then remove the ones that aren't in the array passed in
//this will set users that have no preference to having all body types
var bodyTypeFilter = async(bodyTypes)=>{
    let finalBodyTypePreference = ["Thin","Athletic","Average","Plus","Very Plus"];
    if(bodyTypes && bodyTypes.length > 0){
        if(!bodyTypes.includes("Thin")){
            finalBodyTypePreference.splice(finalBodyTypePreference.indexOf("Thin"),1);
        }
        if(!bodyTypes.includes("Athletic")){
            finalBodyTypePreference.splice(finalBodyTypePreference.indexOf("Athletic"),1);
        }
        if(!bodyTypes.includes("Average")){
            finalBodyTypePreference.splice(finalBodyTypePreference.indexOf("Average"),1);
        }
        if(!bodyTypes.includes("Plus")){
            finalBodyTypePreference.splice(finalBodyTypePreference.indexOf("Plus"),1);
        }
        if(!bodyTypes.includes("Very Plus")){
            finalBodyTypePreference.splice(finalBodyTypePreference.indexOf("Very Plus"),1);
        }
    }
    return finalBodyTypePreference;
}

module.exports = preferences;
module.exports.validation = validation;