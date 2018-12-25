var mongoose = require('mongoose');
var UserModel = mongoose.model('users');
var ProfileFeedbackModel = mongoose.model('profile_feedback');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const functionValidator = require('../../../../helpers/functionValidation');

var automatedSearch = async (req, res, next) => {

  //fetch our user
  let user = await UserModel.findById({
    _id: req.payload._id
  }).then(async (data, err) => {
    if (err) {
      throw ({ error: err });
    }
    return data;
  })

  //only discoverable users can use the date feature
  if(user.discoverable.value != true){
    throw({error:"Not Discoverable"});
  }

  //we first need to get all of the people we have already reviewed.
  let excludedPeopleIDs = await ProfileFeedbackModel.distinct(
    "target",
    {
      source: mongoose.Types.ObjectId(req.payload._id)
    }).then(async (data, err) => {
      if (err) {
        throw ({ error: err });
      }
      return data;
    }
    );

  //add ourselves to the banned list so we dont return ourselves
  excludedPeopleIDs.push(mongoose.Types.ObjectId(req.payload._id));

  //get my gender preferences in array form. ie: Both becomes [Male,Female]
  let myGenderPreferenceArray = await getFormattedGender(user.preference);

  //figure out the minimum and maximum date range based off our preferences
  var minAgeDate = new Date();
  minAgeDate.setFullYear(minAgeDate.getFullYear() - user.ageRange.min);
  var maxAgeDate = new Date();
  maxAgeDate.setFullYear(maxAgeDate.getFullYear() - (user.ageRange.max + 1));//+1 because we look at least 1 year ahead

  //only show users that have been active in the last 2 weeks
  let maxLastOnlineDate = new Date();
  maxLastOnlineDate.setDate(maxLastOnlineDate.getDate() - 14);

  //fetch other users based on our users preferences and the other users preferences
  //also filter by the id's got above
  let matchedUsers = await UserModel.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [
            user.location.coordinates[0],
            user.location.coordinates[1]
          ]
        },
        maxDistance: (user.range / 0.00062137),
        spherical: true,
        distanceField: "distance"
      }
    }, {
      $match: {
        //my gender preference
        gender: {
          $in: myGenderPreferenceArray
        },
        //the other persons preference
        preference: {
          $in: [
            user.gender, "Both"
          ]
        },
        //my body type preference
        bodyType: {
          $in: user.bodyTypePreference
        },
        //their body type preference
        bodyTypePreference: {
          $in: [user.bodyType]
        },
        //other persons birthday
        birthday: {
          $gte: maxAgeDate,
          $lte: minAgeDate
        },
        //exclude people we've already given reviews on. Also ourself
        _id: {
          $nin: excludedPeopleIDs
        },
        //only show people that have recently been active
        lastOnline: {
          $gte: maxLastOnlineDate
        },
        //only show people that are discoverable
        "discoverable.value":true
      }
    }, {
      $project: {
        name: 1
      }
    }, {
      $limit: 50
    }, {
      $sort: {
        lastDateReviewed: 1
      }
    }
  ]).then(async (data, err) => {
    if (err) {
      throw ({ error: err });
    }
    return data;
  });

  //matchedUsers dont count as sponsored
  //also, add all our matched users id's into the excludedPeopleIDs to make it easier to filter our sponsored users
  matchedUsers = await Promise.all(matchedUsers.map(async (user) => {
    user.sponsored = false;
    excludedPeopleIDs.push(user._id);
    return user;
  }));

  //get all sponsored users
  let sponsoredUsers = await UserModel.aggregate([{
    $match: {
      //exclude people we've already given reviews on. Also ourself
      _id: {
        $nin: excludedPeopleIDs
      },
      //only show people that have recently been active
      lastOnline: {
        $gte: maxLastOnlineDate
      },
      //only show people that are discoverable
      "discoverable.value":true
    }
  }, {
    $project: {
      name: 1
    }
  }, {
    $limit: 50
  }, {
    $sort: {
      lastDateReviewed: 1
    }
  }
  ]).then(async (data, err) => {
    if (err) {
      throw ({ error: err });
    }
    return data;
  });

  //sponsoredUsers count as sponsored
  sponsoredUsers = await Promise.all(sponsoredUsers.map(async (user) => {
    user.sponsored = true;
    return user;
  }));

  //merge matched and sponsored users
  let finalArrayOfUsers = [];
  let count = 0;
  while (count < 50) {
    //every 5 add in a sponsored user
    if (count != 0 && count % 5 == 0 && sponsoredUsers.length > 0) {
      finalArrayOfUsers.push(sponsoredUsers.shift());
    } else if (matchedUsers.length > 0) {//add in matched users when not time to add sponsored
      finalArrayOfUsers.push(matchedUsers.shift());
    } else if (sponsoredUsers.length > 0) {//so the user always has at least sponsored if there arent enough matched
      finalArrayOfUsers.push(sponsoredUsers.shift());
    }

    count++;
    //little ghetto but it works
    if (count >= 50) {
      return { users: finalArrayOfUsers };
    }
  }
}

//get my gender preferences in array form. ie: Both becomes [Male,Female]
let getFormattedGender = async (inputGender) => {
  switch (inputGender) {
    case "Female":
      return ["Female"];
    case "Male":
      return ["Male"];
    case "Both":
      return ["Male", "Female"];
  }
}

// var validation = [
//     check('offset').trim().isInt().withMessage("Offset required"),
//     check('limit').trim().isInt().withMessage("Limit required")
// ];

module.exports = automatedSearch;
