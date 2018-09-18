var express = require('express');
var app = express();

var router = express.Router();

var register = require('../../lib/controllers/users/register');
var login = require('../../lib/controllers/users/login');

var profilesRouter = require('./profiles/profiles');
var searchRouter = require('./search/search');
var photosRouter = require('./photos/photos');
var homeRouter = require('./home/home');
var matchesRouter = require('./matches/matches');

router.post('/register', register.validation, function (req, res, next) {

  register(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });

});

router.post('/login', login.validation, function (req, res, next) {

  login.login(req, res, next).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error)
  });

});


router.use('/profiles', profilesRouter);
router.use('/search', searchRouter);
router.use('/photos', photosRouter);
router.use('/home', homeRouter);
router.use('/matches', matchesRouter);

module.exports = router;
