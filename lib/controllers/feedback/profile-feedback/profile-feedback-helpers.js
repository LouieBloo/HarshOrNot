var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userModel = mongoose.model('users');
var profileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var sanitation = require('../../../helpers/users/sanitation');


//checks if there is profile-feedback between two people. Rejects if there is
exports.checkIfProfileFeedback = async (source, target) => {
  return new Promise((resolve, reject) => {
    return this.getProfileFeedback(source, target).then(() => {//if there is a profile, reject
      reject({ error: "Feedback already exists!" })
    }).catch(() => {
      resolve();
    });
  })
}

//gets a profile-feedback, rejects if there isnt one
exports.getProfileFeedback = async (source, target) => {
  return profileFeedbackModel.find({
    source: source,
    target: target
  }).then((data, err) => {
    return new Promise((resolve, reject) => {
      if (err) {
        reject({ error: err });
        return;
      }
      if (data && data.length > 0) {
        resolve(data[0]);
        return;
      }
      else {
        reject({ error: "No profile feedback found" });
      }
    })
  })
}