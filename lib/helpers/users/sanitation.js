

var aboutMe = function(userData){
    return {
        name:userData.name,
        email:userData.email,
        birthday:userData.birthday,
        gender:userData.gender,
        preference:userData.preference,
        bio:userData.bio,
        bodyType:userData.bodyType,
        range:userData.range,
        ageRange:userData.ageRange,
        location:userData.location
    }
}

module.exports.aboutMe = aboutMe;