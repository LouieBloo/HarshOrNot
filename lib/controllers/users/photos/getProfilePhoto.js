const mongoose = require('mongoose');
const userModel = mongoose.model('users');


const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const functionValidator = require('../../../helpers/functionValidation');

const photo = require('./photos');

module.exports.validation = [
  check('target').isString().isLength({ min: 0, max: 100 }).withMessage("Invalid Target")
];
module.exports.getPhoto = async(req,res,next)=>{
  var validData = await functionValidator(req);

  let photos = await userModel.findById({
    _id: validData.target
  },
  "photos"
  ).then(async(photos,err)=>{
    if(err){
      throw({error:err});
    }
    return photos.photos;
  });

  photos = await photo.generatePhotoURLS(photos,validData.target);
  return {photoURLS:photos};
}