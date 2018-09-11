var mongoose = require('mongoose');
var database = require('../database');

require('../../models/users');
require('../../models/profile-feedback');

var seed = require('seed-random');
var userRawData = require('./userTestData');
var profileFeedbackRawData = require('./profileFeedbackTestData');

var UserModel = mongoose.model('users');
var ProfileFeedbackModel = mongoose.model('profile_feedback');

var seedUsers = function () {
	database.connect().then(async () => {
		await mongoose.connection.db.dropCollection("users").then(stuff=>{}).catch(err=>{});
		await mongoose.connection.db.dropCollection("profile_feedbacks").then(stuff=>{}).catch(err=>{});//note using feedbacks instead of feedback

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
			newUser.range = user.range;
			newUser.bio = user.bio;
			newUser.ageRange = user.ageRange;
			newUser.location = { "type": "Point", "coordinates": [user.long, user.lat], "zip": user.zip };
			newUser.points = user.points;
			newUser.setPassword("123");

			await newUser.save().then((res, err) => {
				if (err) {
					console.log("error adding user: ", err);
				}
				user._id = res._id;//set the _id of the raw data object to use later
			});
			return user;
		}))

		//use a seeded random number generator so we get the same output every time
		var rand = seed(userRawData[0].name);//use the name of the first person so everytime we run the generation, we get the same result per user set
		//add in profile feedbacks
		await Promise.all(userRawData.map(async (source, index) => {
			var threshold = rand();//determines how many profile feedbacks this user will give
			await Promise.all(userRawData.map(async target => {
				var roll = rand();
				if (source != target && roll >= threshold) {//sometimes we want to add profile feedback, sometimes not
					console.log("inserting profile feedback...");
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
				}
			}))
		}))

		console.log("\n\n-----=====Done=====-----");
		process.exit();
		return 0;
	}).catch((err) => {
		console.log("Error seeeding: ", err);
		process.exit();
		return 1;
	})
}()