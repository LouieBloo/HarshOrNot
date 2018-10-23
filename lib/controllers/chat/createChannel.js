var cf = require('config');
var config = cf.get('twilio');

var twilio = require('./twilio');
var createTwilioUser = require('./createUser');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

//Creates a channel between 2 users. Will create twilio users for them
module.exports = async (user1, user2) => {
  if (!user1 || !user2) {
    throw ("Need users!");
  }
  //check to make sure these users can have a channel between them. aka they matched
  await profileFeedbackModel.findOne({
    source: mongoose.Types.ObjectId(user1),
    target: mongoose.Types.ObjectId(user2),
    wouldYouDate: "Yes",
    wouldTheyDate: "Yes"
  })
    .then(async (data, err) => {
      if (err || !data) {
        throw ("Couldn't find any match!");
      }
      return;
    });

  //grab both users information
  user1 = await UserModel.findById(user1)
    .then(async (user, err) => {
      if (err) {
        throw ({ error: "Couldn't find user" });
      }
      return user;
    })

  user2 = await UserModel.findById(user2)
    .then(async (user, err) => {
      if (err) {
        throw ({ error: "Couldn't find user" });
      }
      return user;
    })

  //create twilio users if they dont already exist
  user1.toJSON();
  user2.toJSON();

  await createTwilioUser(user1._id, user1.name)
    .catch(async (err) => {
      if (err.code == 50201) {//50201 is user already exists, this is fine so catch it gracefully
      } else {
        throw (err);
      }
    })

  await createTwilioUser(user2._id, user2.name)
    .catch(async (err) => {
      if (err.code == 50201) {
      } else {
        throw (err);
      }
    })

  //create the new channel
  //todo, make uniquename better
  let newChannel = await twilio.service.channels
  .create({
    type: "private",
    friendlyName: user1._id + ":" + user2._id,
    uniqueName: user1._id + ":" + user2._id,
  })
  .then(async (channel) => {
    //return channel.sid;
    return channel;
  })
  .catch(async (err) => {
    console.log("Error creating channel: ", err);
    throw (err);
  });

  //add both users to channel
  await twilio.service.channels(newChannel.sid)
  .members
  .create(
    {
      //account_sid: user1.sid,
      identity: user1._id.toString()
    }
  )
  .then();

  await twilio.service.channels(newChannel.sid)
  .members
  .create(
    {
      //account_sid: user2.sid,
      identity: user2._id.toString()
    }
  )
  .then();

  // //add god
  // await twilio.service.channels(newChannel.sid)
  // .members
  // .create(
  //   {
  //     identity: config.godUserID
  //   }
  // )
  // .then(member => console.log(member.sid))

  return;
}