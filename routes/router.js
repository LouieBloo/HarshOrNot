var express = require('express');
var router = express.Router();

var userModel = require('../lib/models/users');

var usersRouter = require('./users/users');
var feedbackRouter = require('./feedback/feedback');

router.get('/', function(req, res, next) {
  res.json("API is live !");
});



router.use('/users', usersRouter);
router.use('/feedback',feedbackRouter);

module.exports = router;
