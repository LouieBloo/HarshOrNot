var mongoose = require('mongoose');
var database = require('../database');

require('../../models/users');

var data = require('./seedFakeUsersData');
var UserModel = mongoose.model('users');

var seedUsers = function () {
    database.connect().then(async () => {

        var count = 0;
        //ideally we dont want to have to map everything 1-1, but since we are using a date, we need to create an actual object
        for (var i = 0; i < data.length; i++) {
            console.log("inserting...");
            var generatedUserID = "";//used to add other things in the db like feedback
            var newUser = new UserModel();
            newUser.name = data[i].name;
            newUser.email = data[i].email;
            newUser.birthday = new Date(data[i].birthday);
            newUser.gender = data[i].gender;
            newUser.preference = data[i].preference;
            newUser.bodyType = data[i].bodyType;
            newUser.range = data[i].range;
            newUser.bio = data[i].bio;
            newUser.ageRange = data[i].ageRange;
            newUser.location = { "type": "Point", "coordinates": [data[i].long, data[i].lat], "zip": data[i].zip };
            newUser.setPassword("12345678");

            await newUser.save().then((res, err) => {
                if (err) {
                    console.log("error: " ,err);
                }
                generatedUserID = res._id;
                console.log(generatedUserID);

                count++;
                if (count >= data.length) {

                    console.log("-----=====Done=====-----");
                    process.exit();
                }
            });
        }

    }).catch((err) => {
        console.log("Error seeeding");
        console.log(err);
        process.exit();
        return 0;
    })
}

seedUsers();
