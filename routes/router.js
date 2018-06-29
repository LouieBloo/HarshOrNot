var express = require('express');
var router = express.Router();

var userModel = require('../lib/models/users');

router.get('/', function(req, res, next) {
  res.json("API is live !");
});

router.get('/addUser/:name', function(req, res, next) {

  userModel.create({
    name:req.params.name,
    body: "large",
    gender: "Male"
  },function(err,small){
    console.log(err);
    console.log(small);

    res.send("ok");
  });
  
  
});

module.exports = router;
