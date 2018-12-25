const express = require('express');
const app = express();

var router = express.Router();

const register = require('../../lib/controllers/users/register');
const login = require('../../lib/controllers/users/login');

const profilesRouter = require('./profiles/profiles');
const searchRouter = require('./search/search');
const photosRouter = require('./photos/photos');
const homeRouter = require('./home/home');
const matchesRouter = require('./matches/matches');
const chatRouter = require('./chat/chat');
const locationRouter = require('./location/location');

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

router.post('/verify-email',register.verifyValidation,function (req, res, next) {
  register.verifyToken(req, res, next).then(response => {
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
router.use('/chat', chatRouter);
router.use('/location',locationRouter);

module.exports = router;
