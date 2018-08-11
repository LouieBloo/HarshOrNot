var multer = require('multer'),
  multerS3 = require('multer-s3'),
  fs = require('fs'),
  AWS = require('aws-sdk');


var crypto = require('crypto');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var awsConfig = require('../../../../config/s3.json');
AWS.config.loadFromPath('./config/s3.json');//todo, find a way to use the require above instead of a path
var s3 = new AWS.S3();

var mongoose = require('mongoose');
var userModel = mongoose.model('users');


//When uploading a new photo, this is called first to generate a unique string ID for the photo as well as parameter validation
//Also checks to see how many photos the user already has and fails if they have too many
exports.generateUniquePhotoID = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ error: errors.mapped() });
    return;
  }

  userModel.findOne(
    {
      _id: req.payload._id
    }
    ,
    "photos",
    (err, userObj) => {
      if (userObj.photos == null || userObj.photos.length < 5) {
        req.photos = userObj.photos;
        req.photoKey = crypto.randomBytes(16).toString('hex');
        next();
      }
      else {
        res.json({ error: "User has too many pictures!" });
        return;
      }
    }
  );
}

//Actually uploads the pictures to AWS
//Expects photoKey on req object
//This is middleware
exports.uploadPhotoToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: awsConfig.bucketName,
    key: function (req, file, cb) {
      //console.log(file);
      var fileType = "";
      switch (file.mimetype) {
        case "image/jpeg":
          fileType = ".jpg";
          break;
        case "image/png":
          fileType = ".png";
          break;
        default:
          console.log("INVALID PICTURE TYPE FOR AWS UPLOAD");
          cb("INVALID PICTURE TYPE FOR AWS UPLOAD", null);
          return;
      }

      req.photoKey = req.photoKey + fileType;//add filetype to key
      cb(null, "users/" + req.payload._id + "/photos/" + req.photoKey);//save to s3 with full path name
    }
  }),
  limits:{fileSize:10000000}//10MB
});


exports.insertNewPhotoID = function (req, res, next) {
  return new Promise(function (resolve, reject) {
    if (req.photos == null || req.photos.length < 1) {
      resolve([req.photoKey]);
    } else if (req.photos.length < 5) {
      req.photos.push(req.photoKey);
      resolve(req.photos);
    }
    else {
      reject({ error: "User has too many pictures!" });
    }
  }).then(function (urls) {
    return new Promise(function (resolve, reject) {
      //insert urls into db
      userModel.findOneAndUpdate(
        {
          _id: req.payload._id
        }
        ,
        {
          photos: urls
        },
        {
          select: "photos",
          new: true
        },
        (err, result) => {
          if (result && result.photos) {
            generatePhotoURLS(result.photos, req.payload._id).then((newPhotoArr) => {
              resolve({ photos: result.photos, photoURLS: newPhotoArr });
            })
          }
          else {
            resolve([]);
          }
        },
      );
    })
  })
}


exports.deletePhotoValidation = [
  check('key').trim().isLength({ min: 16 }).withMessage("Must provide key"),
];
exports.deletePhoto = function (req, res, next) {

  var validData;
  return new Promise(function (resolve, reject) {
    //check validation first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      reject({ error: errors.mapped() });
    }
    validData = matchedData(req);

    //make sure this user has a picture by that string 
    userModel.findOne(
      {
        _id: req.payload._id
      }
      ,
      "photos",
      (err, userObj) => {
        if (userObj.photos == null || userObj.photos.length < 1) {
          reject({ error: "user doesnt have any photos to delete!" });
        }
        else if (userObj.photos.includes(validData.key)) {
          resolve(userObj.photos);
        }
        else {
          reject({ error: "This key doesnt belong to that user" });
        }
      }
    );

  }).then(function (photos) {
    return new Promise(function (resolve, reject) {
      var params = { Bucket: awsConfig.bucketName, Key: "users/" + req.payload._id + "/photos/" + validData.key };
      s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log("Error deleting photo!");
          console.log(err);
          reject({ error: "Couldnt delete photo from s3" });
        }
        else {
          photos.remove(validData.key);
          userModel.findOneAndUpdate(
            {
              _id: req.payload._id
            }
            ,
            {
              photos: photos
            },
            {
              select: "photos",
              new: true
            },
            (err, result) => {
              console.log(err, result);
              if (result && result.photos) {
                generatePhotoURLS(result.photos, req.payload._id).then((newPhotoArr) => {
                  resolve({ photos: result.photos, photoURLS: newPhotoArr });
                })
              }
              else {
                console.log("here!!!");
                resolve({});
              }
            },
          );
        }
      });
    })
  })
}




//swaps two photo positions
exports.swapPhotosValidation = [
  check('key1').trim().isLength({ min: 16 }).withMessage("Must provide key"),
  check('key2').trim().isLength({ min: 16 }).withMessage("Must provide key 2")
];
exports.swapPhotos = function (req, res, next) {

  var validData;
  return new Promise(function (resolve, reject) {
    //check validation first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      reject({ error: errors.mapped() });
    }
    validData = matchedData(req);

    userModel.findOne(
      {
        _id: req.payload._id
      }
      ,
      "photos",
      (err, userObj) => {
        if (userObj.photos == null || userObj.photos.length < 2) {
          reject({ error: "user doesnt have any photos to swap!" });
        }
        else if (userObj.photos.includes(validData.key1) && userObj.photos.includes(validData.key2)) {

          var key1Index = userObj.photos.indexOf(validData.key1);
          var key2Index = userObj.photos.indexOf(validData.key2);

          var temp = userObj.photos[key1Index];
          userObj.photos[key1Index] = userObj.photos[key2Index];
          userObj.photos[key2Index] = temp;

          userModel.findOneAndUpdate(
            {
              _id: req.payload._id
            }
            ,
            {
              photos: userObj.photos
            },
            {
              select: "photos",
              new: true
            },
            (err, result) => {
              if (result && result.photos) {
                generatePhotoURLS(result.photos, req.payload._id).then((newPhotoArr) => {
                  resolve({ photos: result.photos, photoURLS: newPhotoArr });
                })
              }
              else {
                resolve([]);
              }
            },
          );
        }
        else {
          reject({ error: "This key doesnt belong to that user" });
        }
      }
    );
  })
}

//returns users photoArray
//this is only really here to help the front end, most of the time functions just call mongoose itself
exports.getMyPhotos = function (req, res, next) {
  return new Promise(function (resolve, reject) {
    userModel.findOne(
      {
        _id: req.payload._id
      }
      ,
      "photos",
      (err, result) => {
        if (result && result.photos) {
          generatePhotoURLS(result.photos, req.payload._id).then((newPhotoArr) => {
            resolve({ photos: result.photos, photoURLS: newPhotoArr });
          })
        }
        else {
          resolve([]);
        }
      }
    );
  })
}

//generates a list of ready to go URLS based on the filename array photoArr
var generatePhotoURLS = async (photoArr, userID) => {
  return new Promise((resolve, reject) => {
    var finalURLArr = [];
    if (photoArr && photoArr.length > 0) {
      let index = 0;
      photoArr.forEach(function (file) {

        finalURLArr.push(awsConfig.basePhotoURL + userID + "/photos/" + file);

        index++;
        if (index >= photoArr.length) {
          resolve(finalURLArr);
        }
      });
    }
    else {
      resolve(finalURLArr);
    }
  })
}
exports.generatePhotoURLS = generatePhotoURLS;

//Retrieves objects from Amazon s3
//check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property to configure params properties
//eg var params = {Bucket: 'bucketname', Key:'keyname'}
exports.getPhoto = function (req, res) {
  var item = req.body;
  var params = { Bucket: awsConfig.bucketName, Key: "luke" };
  s3.getObject(params, function (err, data) {
    if (err) {
      return res.send({ "error": err });
    }
    res.send({ data });
  });
}


// //Create bucket. Note: bucket name must be unique.
// //Requires only bucketName via post 
// //check [http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property](http://) for more info
// exports.createBucket = function (req, res) {
//     var item = req.body;
//     var params = { Bucket: item.bucketName };
//     s3.createBucket(params, function (err, data) {
//         if (err) {
//             return res.send({ "error": err });
//         }
//         res.send({ data });
//     });
// }

// //List all buckets owned by the authenticate sender of the request. Note: bucket name must be unique.
// //check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listBuckets-property for more info
// exports.listBuckets = function (req, res) {
//     s3.listBuckets({}, function (err, data) {
//         if (err) {
//             return res.send({ "error": err });
//         }
//         res.send({ data });
//     });
// }

// //Delete bucket.
// //Require bucketName via delete 
// //check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteBucket-property for more info
// exports.deleteBucket = function (req, res) {
//     var item = req.body;
//     var params = { Bucket: item.bucketName };
//     s3.deleteBucket(params, function (err, data) {
//         if (err) {
//             return res.send({ "error": err });
//         }
//         res.send({ data });
//     });
// }

// //Delete bucket cors configuration. 
// // Requires bucketName via delete
// //check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteBucketCors-property for more info
// exports.deleteBucketCors = function (req, res) {
//     var item = req.body;
//     var params = { Bucket: item.bucketName };
//     s3.deleteBucketCors(params, function (err, data) {
//         if (err) {
//             return res.send({ "error": err });
//         }
//         res.send({ data });
//     });
// }



// //Delete qn object
// //check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property for more info
// exports.deleteObject = function (req, res) {
//     var item = req.body;
//     var params = { Bucket: item.bucketName, Key: item.key };
//     s3.deleteObjects(params, function (err, data) {
//         if (err) {
//             return res.send({ "error": err });
//         }
//         res.send({ data });
//     });
// }

// //cloud image uploader using multer-s3 
// //Pass the bucket name to the bucketName param to upload the file to the bucket 
// exports.uploadFile = function (req, res) {
//     var item = req.body;
//     console.log("herererer");
//     var upload = multer({
//         storage: multerS3({
//             s3: s3,
//             bucket: bucketName,
//             key: function (req, file, cb) {
//                 console.log(file);
//                 cb(null, file.originalname); //use Date.now() for unique file keys
//             }
//         })}).single("tiny");

// }

