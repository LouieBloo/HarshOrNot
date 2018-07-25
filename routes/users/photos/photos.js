var express = require('express');
var router = express.Router();


var photos = require('../../../lib/controllers/users/photos/photos');

var auth = require('../../../config/auth');


// router.post('/upload',photos.upload.single('tiny'),function(req, res, next) {
//   console.log("POSTING TO ROUTER");
//   //console.log(req);
//   console.log("res\n");
//   console.log(res);
// //   photos.uploadFile(req,res,next).then(response=>{
// //     res.json(response);
// //   }).catch(error =>{
// //     res.json(error)
// //   });

// });

router.post('/upload',function(req, res, next) {
    var to = "ass";
    req.photoKey = "luke";
    next();
  },photos.upload.single('photo'),function(req,res,next){
      console.log("done");
  });

router.post('/get',photos.getObject,function(req,res,next){
    res.send("ok");
})



module.exports = router;
