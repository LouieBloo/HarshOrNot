var express = require('express');
var router = express.Router();

var auth = require('../../../../config/auth');

var preferences = require('../../../../lib/controllers/users/profiles/update/preferences');

router.post('/preferences',[auth,preferences.validation],function(req,res,next){
  preferences(req,res,next).then(response=>{
    res.json(response);
  }).catch(error =>{
    res.json(error)
  });
});

module.exports = router;