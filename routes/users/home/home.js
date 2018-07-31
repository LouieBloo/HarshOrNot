var express = require('express');
var router = express.Router();


var welcome = require('../../../lib/controllers/users/home/welcome');

var auth = require('../../../config/auth');


router.post('/welcome',
    auth,
    function(req,res,next){

        welcome.welcome(req,res,next).then(function(response){
            res.json(response);
        }).catch(function(err){
            res.json(err);
        })
    }
);


module.exports = router;
