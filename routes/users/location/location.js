const express = require('express');
var router = express.Router();

const auth = require('../../../config/auth');

const update = require('../../../lib/controllers/users/location/update-location');

router.post('/setLocation',
  [auth,update.validation],
  function (req, res, next) {
    update.update(req, res, next).then(function (response) {
      res.json(response);
    }).catch(function (err) {
      res.json(err);
    })
  }
);


module.exports = router;
