var express = require('express');
var router = express.Router();

var getMatches = require('../../../lib/controllers/users/matches/getMatches');
var getDenials = require('../../../lib/controllers/users/matches/getDenials');
var getMatchQueue = require('../../../lib/controllers/users/matches/getMatchQueue');

var auth = require('../../../config/auth');


router.post('/getMatches',
  [auth,getMatches.getValidation],
  function (req, res, next) {

    getMatches.get(req, res, next).then(function (response) {
      res.json(response);
    }).catch(function (err) {
      res.json(err);
    })
  }
);

router.post('/getDenials',
  [auth,getDenials.getValidation],
  function (req, res, next) {

    getDenials.get(req, res, next).then(function (response) {
      res.json(response);
    }).catch(function (err) {
      res.json(err);
    })
  }
);


router.post('/getMatchQueue',
  [auth,getMatchQueue.getValidation],
  function (req, res, next) {

    getMatchQueue.get(req, res, next).then(function (response) {
      res.json(response);
    }).catch(function (err) {
      res.json(err);
    })
  }
);

module.exports = router;
