var express = require('express');
var router = express.Router();

var view = require('../../../lib/controllers/users/profiles/view');

var auth = require('../../../config/auth');

router.get('/view',auth,function(req, res, next) {
  
  view(req,res,next).then(response=>{
    res.json(response);
  }).catch(error =>{
    res.json(error)
  });

});


module.exports = router;
