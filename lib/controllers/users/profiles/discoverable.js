var mongoose = require('mongoose');
var userModel = mongoose.model('users');

let minimumPhotosRequired = 1;

var updateDiscoverability = async (userID) =>{

  let user = await userModel.findById(userID);
  if(!user){
    throw({error:"Couldn't find user"});
  }

  let photosOk = user.photos && user.photos.length >= minimumPhotosRequired ? true : false;
  let locationOk = user.location && user.location.coordinates && user.location.coordinates.length == 2 ? true : false;

  console.log(user.photos);
  console.log(user.photos.length);

  console.log(photosOk,locationOk);
  user.discoverable.photos = photosOk;
  user.discoverable.location = locationOk;
  user.discoverable.value = photosOk && locationOk;

  await user.save();
}


var checkDiscoverability = async (req,res,next) =>{

  let user = await userModel.findById(req.payload._id);
  if(!user){
    throw({error:"Couldn't find user"});
  }

  return user.discoverable;
}

module.exports.update = updateDiscoverability;
module.exports.checkDiscoverability = checkDiscoverability;