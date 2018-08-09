var express = require('express');
var router = express.Router();

var updateRouter = require('./update/update');

var view = require('../../../lib/controllers/users/profiles/view');
var mine = require('../../../lib/controllers/users/profiles/mine');

var auth = require('../../../config/auth');

router.post('/view',[auth,view.validation],function(req, res, next) {
  
  view(req,res,next).then(response=>{
    res.json(response);
  }).catch(error =>{
    res.json(error)
  });
});

router.post('/mine',auth,function(req,res,next){
  mine(req,res,next).then(response=>{
    res.json(response);
  }).catch(error =>{
    res.json(error)
  });
});

router.use('/update',updateRouter);

module.exports = router;
