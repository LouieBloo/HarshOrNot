const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserModel = mongoose.model('users');

const { check } = require('express-validator/check');

const functionValidator = require('../../helpers/functionValidation');
const sanitation = require('../../helpers/users/sanitation');
const photos = require('../users/photos/photos');

//Grabs a users information that would be displayed on a channel list item
module.exports.validation = [
  check('_id').trim().isLength({ min: 2, max: 100 }).withMessage("Invalid UserID")
];
module.exports.viewChannelInfo = async (req, res, next) => {

  var validData = await functionValidator(req);

  //find our target
  let user = await UserModel.findById(validData._id, sanitation.viewChannelInfo).then(async (user, err) => {
    if (err || !user) {
      throw ({ error: "Couldn't find user" });
    }
    return user;
  });

  user.toJSON();

  //only need the profile photo
  let userPhoto = await photos.generatePhotoURLS(user.photos, validData._id)
  if (userPhoto && userPhoto.length > 0) {
    userPhoto = userPhoto[0];
  }

  //only show age, not birthday
  let age =await sanitation.getAge(user.birthday);

  return {
    age:age,
    photo:userPhoto,
    name:user.name,
    gender:user.gender
  };

}