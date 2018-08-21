exports.aboutMe = "name email birthday gender preference bio bodyType range ageRange location";

exports.welcome = "name location.zip";

exports.allSearch = {
    name:"$name",
    age:{$subtract:[new Date().getFullYear(),{$year:"$birthday"}]},
    gender:"$gender",
    bodyType:"$bodyType",
    photo:{$arrayElemAt:["$photos",0]},
    preference:"$preference",
    distance:{$trunc:"$distance"}
}

exports.publicDatingProfile = {
    name:"$name",
    age:{$subtract:[new Date().getFullYear(),{$year:"$birthday"}]},
    bio:"$bio",
    gender:"$gender",
    bodyType:"$bodyType",
    photos:"$photos",
    preference:"$preference",
    distance:{$trunc:"$distance"}
}

exports.profileFeedback = "dateAdded feedback source";
exports.profileFeedbackUser ={
    age:{$subtract:[new Date().getFullYear(),{$year:"$birthday"}]},
    gender:"$gender",
    bodyType:"$bodyType",
    preference:"$preference"
}