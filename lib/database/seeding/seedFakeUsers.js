const express = require('express');
const app = express();
const request = require('supertest');
const fs = require('fs');
var crypto = require('crypto');

var mongoose = require('mongoose');
var database = require('../database');

require('../../models/users');
require('../../models/profile-feedback');

var seed = require('seed-random');
var userRawData = require('./data/userTestData');
var profileFeedbackRawData = require('./data/profileFeedbackTestData');

var UserModel = mongoose.model('users');
var ProfileFeedbackModel = mongoose.model('profile_feedback');

var photos = require('../../controllers/users/photos/photos');

var photoSeedDirectory = "./img/seed";

const userConfig = require('../../../config/users/users.json');


//This is where we define our basic express app needs so we can upload photos
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.post('/upload/:id',
	//photos.generateUniquePhotoID,
	function (req, res, next) {
		req.payload = {};
		req.payload._id = req.params.id;
		req.photoKey = crypto.randomBytes(16).toString('hex');
		next();
	},
	photos.uploadPhotoToS3.single('photo'),
	function (req, res, next) {
		//once the middleware is done, insert the new photoURL's
		photos.insertNewPhotoID(req, res, next).then(function (response) {
			res.json(response);
		}).catch(function (err) {
			res.json(err);
		})
	}
);

var uploadPhoto = function (_id, fileName) {
	//'./img/seed/girls/4af04a78abecb849032a7ac607163d3f.jpg'
	console.log(_id + "   " + fileName);
	request(app)
		.post("/upload/" + _id)
		.set('Accept', 'multipart/form-data')
		.attach('photo', fileName)
		.end(function (err, res) {
			if (err) throw err;
			if (res) {
			}
		});
}

var seedUsers = function () {

	database.connect().then(async () => {

		await mongoose.connection.db.dropCollection("users").then(stuff => { }).catch(err => { });
		await mongoose.connection.db.dropCollection("profile_feedbacks").then(stuff => { }).catch(err => { });//note using feedbacks instead of feedback

		//grab all seed img filenames
		var girlFileNames = await readPhotoFiles("/girls");
		var guyFileNames = await readPhotoFiles("/guys");

		//add the users to the database
		//ideally we dont want to have to map everything 1-1, but since we are using a date, we need to create an actual object
		await Promise.all(userRawData.map(async user => {
			console.log("inserting user...");
			var newUser = new UserModel();
			newUser.name = user.name;
			newUser.email = user.email;
			newUser.birthday = new Date(user.birthday);
			newUser.gender = user.gender;
			newUser.preference = user.preference;
			newUser.bodyType = user.bodyType;
			newUser.bodyTypePreference = userConfig.bodyTypes;
			newUser.range = user.range;
			newUser.bio = user.bio;
			newUser.ageRange = user.ageRange;
			newUser.lastOnline = user.lastOnline;
			newUser.location = { "type": "Point", "coordinates": [user.long, user.lat], "zip": user.zip };
			newUser.points = user.points;
			newUser.setPassword("123");
			

			await newUser.save().then((res, err) => {
				if (err) {
					console.log("error adding user: ", err);
				}
				user._id = res._id;//set the _id of the raw data object to use later

				//choose random photo and upload. Dont wait for upload
				let fileName = user.gender == "Male" ? photoSeedDirectory + "/guys/" + guyFileNames[Math.round(Math.random() * (guyFileNames.length-1))] : photoSeedDirectory + "/girls/" + girlFileNames[Math.round(Math.random() * (girlFileNames.length-1))];
				uploadPhoto(res._id,fileName);
			});
			return user;
		}))



		//use a seeded random number generator so we get the same output every time
		var rand = seed(userRawData[0].name);//use the name of the first person so everytime we run the generation, we get the same result per user set
		//add in profile feedbacks
		var profileFeedbacks = [];
		console.log("inserting profile feedbacks...");
		await Promise.all(userRawData.map(async (source, index) => {
			var threshold = rand();//determines how many profile feedbacks this user will give
			await Promise.all(userRawData.map(async target => {
				var roll = rand();
				//console.log(source._id + " : " + target._id);

				if (source != target && roll >= threshold) {//sometimes we want to add profile feedback, sometimes not

					var feedback = new ProfileFeedbackModel();
					var feedbackTemplate = profileFeedbackRawData[parseInt(rand() * profileFeedbackRawData.length)];
					feedback.feedback = feedbackTemplate.feedback;
					feedback.source = source._id;
					feedback.target = target._id;
					feedback.dataAdded = new Date(feedbackTemplate.dataAdded);
					feedback.pointsGiven = feedbackTemplate.pointsGiven;
					feedback.wouldYouDate = feedbackTemplate.wouldYouDate;

					await feedback.save().then((res, err) => {
						if (err) {
							console.log("error adding profile feedback: ", err);
						}
					});

					profileFeedbacks.push(feedback);
				}
			}))
		}))

		//after we have inserted all of our profile feedbacks, create relationships when two people give feedbacks about the other
		var today = new Date();
		await Promise.all(profileFeedbacks.map(async feedback => {
			await ProfileFeedbackModel.findOneAndUpdate({
				source: mongoose.Types.ObjectId(feedback.target),
				target: mongoose.Types.ObjectId(feedback.source)
			}, {
					wouldTheyDate: feedback.wouldYouDate,
					dateCompleted: today
				}, {
					new: true
				}).then(async (data, err) => {
				}).catch(err => {
					console.log("Error joining feedback: ", err);
				});
		}))

		console.log("\n\n-----=====Done=====-----");
		console.log("\n\n** WARNING ** - Photos might still be uploading. Only close when you are satisfied they are");
		//process.exit();
		//return 0;
	}).catch((err) => {
		console.log("Error seeeding: ", err);
		process.exit();
		return 1;
	})
}()

var readPhotoFiles = async (folder) => {
	return new Promise((resolve, reject) => {
		fs.readdir(photoSeedDirectory + folder, (err, files) => {
			if (err) {
				reject({error:"Error loading photos from: " + folder})
				return;
			}
			resolve(files);
		})
	})
}