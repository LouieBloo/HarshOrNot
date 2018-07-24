var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const{check,validationResult} = require('express-validator/check');
const{matchedData,sanitize} = require('express-validator/filter');

var automatedSearch = function(req,res,next){
    return new Promise(function(resolve,reject){

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            reject({error:errors.mapped()});
            return;
        }
        var validData = matchedData(req);

        // UserModel.find({
        //     loc:{
        //         $near :
        //         {
        //             $geometry:{type:"2d",coordinates: ['-121.5072', '38.6383']},
        //             $maxDistance:1000
        //         }
        //     }
        // },function(err,result){
        //     console.log("done");
        //     console.log(result);
        //     console.log(err);
        // })
        console.log("HERE");
        UserModel.find({
            location:{
                $near :
                {
                    $geometry:{type:"Point",coordinates: ['-121.5072', '38.6383']},
                    $maxDistance:7500* 1000
                }
            }
        },function(err,result){
            console.log("done");
            console.log(result);
            console.log(err);
        })
        // UserModel.aggregate([{
        //     $geoNear: {
        //       near: location,
        //       distanceField: 'distance',
        //       maxDistance: 1000000,
        //       spherical: true
        //     }
        //   }]).then(function(err,response){
        //       console.log("DONE DONING HQWUE");
        //     console.log(err);
        //     console.log(response);
        //   });
        console.log("asdfasdf");
        // UserModel.aggregate(
        //     [
        //         { "$geoNear": {
        //             "near": {
        //                 //"type": "Point",
        //                 "coordinates": ['-121.5072', '38.6383']
        //             },
        //             "distanceField": "distance",
        //             "spherical": true,
        //             "maxDistance": 10000
        //         }}
        //     ],
        //     function(err,results) {
        //         console.log("done");
        //         console.log(results);
        //         console.log(err);
        //     }
        // )

        resolve("op");
    })
}


var validation = [
    check('offset').trim().isInt().withMessage("Offset required"),
    check('limit').trim().isInt().withMessage("Limit required")
];

module.exports = automatedSearch;
module.exports.validation = validation;