var express = require('express');
var router = express.Router();

var getToken = require('../../../lib/controllers/chat/createToken');

var auth = require('../../../config/auth');

router.post('/getToken',
  [auth,getToken.validation],
  function (req, res, next) {
    getToken.generateToken(req, res, next).then(function (response) {
      res.json(response);
    }).catch(function (err) {
      res.json(err);
    })
  }
);

module.exports = router;