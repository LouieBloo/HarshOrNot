exports.aboutMe = "name email birthday gender preference bio bodyType bodyTypePreference range ageRange location";

exports.welcome = "name location.zip points";

exports.allSearch = {
    name: "$name",
    age: { $subtract: [new Date().getFullYear(), { $year: "$birthday" }] },
    gender: "$gender",
    bodyType: "$bodyType",
    photo: { $arrayElemAt: ["$photos", 0] },
    preference: "$preference",
    distance: { $trunc: "$distance" }
}

exports.publicDatingProfile = {
    name: "$name",
    age: { $subtract: [new Date().getFullYear(), { $year: "$birthday" }] },
    bio: "$bio",
    gender: "$gender",
    bodyType: "$bodyType",
    photos: "$photos",
    preference: "$preference",
    distance: { $trunc: "$distance" }
}

//channel snippet
exports.viewChannelInfo = {name:1, gender:1,bodyType:1,birthday:1,preference:1,photos:1};

//About Me feedback
exports.profileFeedbackAboutMe = {dateAdded:1, feedback:1, source:1,redeemed:1};
exports.profileFeedbackAboutMeUser = {gender:1, bodyType:1, birthday:1, preference:1,_id:0};

//I Gave feedback
exports.profileFeedbackIGave = {dateAdded:1, feedback:1, target:1,_id:0};
exports.profileFeedbackIGaveUser = {gender:1, bodyType:1, birthday:1, preference:1,name:1};

//get Matches
exports.getMatches = {dateCompleted:1,target:1,wouldYouDate:1,wouldTheyDate:1,_id:0,};
exports.getMatchesTarget = {gender:1, bodyType:1, birthday:1, preference:1,name:1,photos:1,lastOnline:1};

//rounds the distance supplied to the nearest kilometer. Also makes sure it is always at least 5 km away for safety
exports.distanceRounding = async(distanceInMeters)=>{
    if(isNaN(distanceInMeters)){
        throw({error:"Not a number"});
    }

    distanceInMeters /= 1000.0;
    let distanceInKM = Math.ceil(distanceInMeters);
    if(distanceInKM < 5){
        distanceInKM = 5;
    }

    return distanceInKM;
}

exports.getAge = async(birthday)=>{
    let parsedDate = new Date(birthday);
    return new Date().getFullYear()  - parsedDate.getFullYear();
}