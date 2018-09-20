var express = require('express');
var router = express.Router();

var userModel = require('../lib/models/users');

var usersRouter = require('./users/users');
var feedbackRouter = require('./feedback/feedback');
var statisticsRouter = require('./statistics/statistics');

router.get('/', function(req, res, next) {
  res.json("API is live !");
});



router.use('/users', usersRouter);
router.use('/feedback',feedbackRouter);
router.use('/statistics',statisticsRouter);

module.exports = router;
