var multer  = require('multer'),
    multerS3 = require('multer-s3'),
    fs = require('fs'),
    AWS = require('aws-sdk');

AWS.config.loadFromPath('./config/s3.json');
var s3 = new AWS.S3();

var bucketName = "harsh-or-not";

//Create bucket. Note: bucket name must be unique.
//Requires only bucketName via post 
//check [http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property](http://) for more info
exports.createBucket = function (req, res) {
    var item = req.body;
    var params = { Bucket: item.bucketName };
    s3.createBucket(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
}

//List all buckets owned by the authenticate sender of the request. Note: bucket name must be unique.
//check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listBuckets-property for more info
exports.listBuckets = function (req, res) {
    s3.listBuckets({}, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
}

//Delete bucket.
//Require bucketName via delete 
//check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteBucket-property for more info
exports.deleteBucket = function (req, res) {
    var item = req.body;
    var params = { Bucket: item.bucketName };
    s3.deleteBucket(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
}

//Delete bucket cors configuration. 
// Requires bucketName via delete
//check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteBucketCors-property for more info
exports.deleteBucketCors = function (req, res) {
    var item = req.body;
    var params = { Bucket: item.bucketName };
    s3.deleteBucketCors(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
}

//Retrieves objects from Amazon s3
//check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property to configure params properties
//eg var params = {Bucket: 'bucketname', Key:'keyname'}
exports.getObject = function (req, res) {
    var item = req.body;
    var params = { Bucket: bucketName,Key:"luke" };
    s3.getObject(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
}

//Delete qn object
//check http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property for more info
exports.deleteObject = function (req, res) {
    var item = req.body;
    var params = { Bucket: item.bucketName, Key: item.key };
    s3.deleteObjects(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
}

//cloud image uploader using multer-s3 
//Pass the bucket name to the bucketName param to upload the file to the bucket 
exports.uploadFile = function (req, res) {
    var item = req.body;
    console.log("herererer");
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: bucketName,
            key: function (req, file, cb) {
                console.log(file);
                cb(null, file.originalname); //use Date.now() for unique file keys
            }
        })}).single("tiny");

}

exports.upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        key: function (req, file, cb) {
            console.log(file);
            if(file.mimetype != "image/jpeg" && file.mimetype != "image/png")
            {
                console.log("asdflkjasdlfjalsdf");
                cb("ERRRO",null);
                return;
            }
            cb(null, req.photoKey + '.jpg'); //use Date.now() for unique file keys
        }
    })
});