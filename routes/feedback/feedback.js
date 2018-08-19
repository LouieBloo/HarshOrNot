var express = require('express');
var app = express();

var router = express.Router();

var auth = require('../../config/auth');

var profileFeedback = require('../../lib/controllers/feedback/profile-feedback/profile-feedback');

router.post('/profile-feedback/add',[auth, profileFeedback.addValidation], function (req, res, next) {
  profileFeedback.add(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});

router.post('/profile-feedback/get', [auth,profileFeedback.getValidation], function (req, res, next) {
  profileFeedback.get(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});

module.exports = router;
