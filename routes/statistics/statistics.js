var express = require('express');
var app = express();

var router = express.Router();

var auth = require('../../config/auth');

var lastOnline = require('../../lib/controllers/statistics/lastOnline');

router.post('/logUserActivity',[auth], function (req, res, next) {
  lastOnline.logUserActivity(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });
});


module.exports = router;
