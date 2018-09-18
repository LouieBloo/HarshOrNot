var express = require('express');
var router = express.Router();

var getMatches = require('../../../lib/controllers/users/matches/getMatches');

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


module.exports = router;
