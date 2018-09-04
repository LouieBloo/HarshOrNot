exports.aboutMe = "name email birthday gender preference bio bodyType range ageRange location";

exports.welcome = "name location.zip";

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

//About Me feedback
exports.profileFeedbackAboutMe = "dateAdded feedback source";
exports.profileFeedbackAboutMeUser = {
    age: { $subtract: [new Date().getFullYear(), { $year: "$birthday" }] },
    gender: "$gender",
    bodyType: "$bodyType",
    preference: "$preference"
}

//I Gave feedback
exports.profileFeedbackIGave = "dateAdded feedback target";
exports.profileFeedbackIGaveUser = {
    age: { $subtract: [new Date().getFullYear(), { $year: "$birthday" }] },
    gender: "$gender",
    bodyType: "$bodyType",
    preference: "$preference",
    name: "$name",
}