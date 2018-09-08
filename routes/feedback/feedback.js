var express = require('express');
var app = express();

var router = express.Router();

var auth = require('../../config/auth');

var addProfileFeedback = require('../../lib/controllers/feedback/profile-feedback/add-profile-feedback');
var getProfileFeedback = require('../../lib/controllers/feedback/profile-feedback/get-profile-feedback');
var unlockProfileFeedback = require('../../lib/controllers/feedback/profile-feedback/unlock-profile-feedback');

router.post('/profile-feedback/add',[auth,addProfileFeedback.addValidation], function (req, res, next) {
  addProfileFeedback.add(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});

router.post('/profile-feedback/getSingle', [auth,getProfileFeedback.getValidation], function (req, res, next) {
  getProfileFeedback.getSingle(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});

router.post('/profile-feedback/getFeedbackAboutMe', [auth,getProfileFeedback.getFeedbackAboutMeValidation], function (req, res, next) {
  getProfileFeedback.getFeedbackAboutMe(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});

router.post('/profile-feedback/getFeedbackIGave', [auth,getProfileFeedback.getFeedbackIGaveValidation], function (req, res, next) {
  getProfileFeedback.getFeedbackIGave(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});

router.post('/profile-feedback/unlockFeedback', [auth,unlockProfileFeedback.validation], function (req, res, next) {
  unlockProfileFeedback.unlockProfileFeedback(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});


module.exports = router;
