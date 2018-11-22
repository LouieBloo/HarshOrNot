var express = require('express');
var app = express();

var router = express.Router();


var auth = require('../../../config/auth');

var automatedSearch = require('../../../lib/controllers/users/search/automated/automated-search');
var allSearch = require('../../../lib/controllers/users/search/all/all-search');

router.post('/automated',[auth], function(req, res, next) {
  automatedSearch(req,res,next).then(response=>{
    res.json(response);
  }).catch(error =>{
    res.json(error)
  });

});


router.post('/all',auth,allSearch.validation, function(req, res, next) {
  allSearch.search(req,res,next).then(response=>{
    res.json(response);
  }).catch(error =>{
    res.json(error)
  });
});



module.exports = router;
