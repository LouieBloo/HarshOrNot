var express = require('express');
var app = express();

var router = express.Router();

var automatedSearch = require('../../../lib/controllers/users/search/automated/automated-search');

router.post('/automated',automatedSearch.validation, function(req, res, next) {
  automatedSearch(req,res,next).then(response=>{
    res.json(response);
  }).catch(error =>{
    res.json(error)
  });

});


module.exports = router;
