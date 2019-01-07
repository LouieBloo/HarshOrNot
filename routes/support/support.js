var express = require('express');
var app = express();

var router = express.Router();

var auth = require('../../config/auth');

var userFeedback = require('../../lib/controllers/support/feedback');

router.post('/giveFeedback',[auth,userFeedback.validation], function (req, res, next) {
  userFeedback.giveFeedback(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});


module.exports = router;
