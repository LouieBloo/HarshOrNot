var express = require('express');
var router = express.Router();


var photos = require('../../../lib/controllers/users/photos/photos');
const getProfilePhoto = require('../../../lib/controllers/users/photos/getProfilePhoto')

var auth = require('../../../config/auth');



router.post('/upload',
    auth,
    photos.generateUniquePhotoID,
    photos.uploadPhotoToS3.single('photo'),
    function(req,res,next){

        //once the middleware is done, insert the new photoURL's
        photos.insertNewPhotoID(req,res,next).then(function(response){
            res.json(response);
        }).catch(function(err){
            res.json(err);
        })
    }
);

router.post('/delete',auth,photos.deletePhotoValidation,function(req,res,next){
    photos.deletePhoto(req,res,next).then(response =>{
        res.json(response);
    }).catch(err=>{
        res.json(err);
    })
});

router.post('/swap',auth,photos.swapPhotosValidation,function(req,res,next){
    photos.swapPhotos(req,res,next).then(response =>{
        res.json(response);
    }).catch(err=>{
        res.json(err);
    })
});

router.post('/getMine',auth,function(req,res,next){
    photos.getMyPhotos(req,res,next).then(response =>{
        res.json(response);
    }).catch(err=>{
        res.json(err);
    })
});

router.post('/getProfile',[auth,getProfilePhoto.validation],function(req,res,next){
    getProfilePhoto.getPhoto(req,res,next).then(response =>{
        res.json(response);
    }).catch(err=>{
        res.json(err);
    })
});

module.exports = router;
