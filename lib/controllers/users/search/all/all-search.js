var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const{check,validationResult} = require('express-validator/check');
const{matchedData,sanitize} = require('express-validator/filter');

var sanitation = require("../../../../helpers/users/sanitation");

var validation = [
    check('query.name').optional().trim().isLength({min:2,max:60}).withMessage("Name must be 2-60 characters long"),
    // check('birthday').trim().toDate().withMessage("Age must be between 18-130"),
    check('query.gender').optional().trim().matches(/^(Male|Female)\b/).withMessage("Invalid gender"),
    check('query.preference').optional().trim().matches(/^(Male|Female)\b/).withMessage("Invalid preference"),
    //check('bodyType').trim().matches(/^(Thin|Althletic|Average|Plus|Very Plus)\b/).withMessage("Invalid body type")
    check('query.range').optional().isInt({min:1,max:150}).withMessage("Range must be 1-150"),
    check('query.ageRange.min').optional().isInt({min:18,max:100}).withMessage("Age min must be 18-100"),
    check('query.ageRange.max').optional().isInt({min:18,max:100}).withMessage("Age max must be 18-100"),
    check('query.useRange').optional().isBoolean().withMessage("Use Range must be a boolean"),
    check('query').withMessage("Need query")
];
module.exports.validation = validation;
module.exports.search  = function(req,res,next){
    return new Promise(function(resolve,reject){

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            reject({error:errors.mapped()});
            return;
        }
        var validData = matchedData(req);

        var searchFilter = {};
        var finalAggregateQuery = [];

        //fetch our coordinates to use in search
        UserModel.find({_id:req.payload._id},"name location.coordinates",function(err,result){

            if(result && result[0]){
                if(validData.query.useRange){
                    finalAggregateQuery.push({
                        $geoNear:{
                            near:{type:"Point",coordinates: [result[0].location.coordinates[0], result[0].location.coordinates[1]]},
                            maxDistance: (validData.query.range/0.00062137),//miles to m
                            spherical:true,
                            distanceField: "distance",
                        }
                    });
                }
                if(validData.query.gender){searchFilter.gender = validData.query.gender};
                if(validData.query.preference){searchFilter.preference = validData.query.preference};
                    
        
                //push the final parameters in the query array
                finalAggregateQuery.push({
                    $match:searchFilter
                },
                {
                    $project:sanitation.allSearch
                });
        
                UserModel.aggregate(
                    finalAggregateQuery
                    ,
                    function(err,result){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
        
                        resolve(result);
                    }
                )
            }
            else{
                reject({error:"Something went wrong finding user!"});
            }

            
        })

        
    
    })
}

