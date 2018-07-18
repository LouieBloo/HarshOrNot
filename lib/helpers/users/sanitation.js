

var aboutMe = function(userData){
    return {
        name:userData.name,
        email:userData.email,
        birthday:userData.birthday,
        gender:userData.gender,
        preference:userData.preference,
        bio:userData.bio,
        location:userData.location
    }
}

module.exports.aboutMe = aboutMe;