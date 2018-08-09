var passport = require('passport');
var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

exports.validation = [
  check('email').isEmail().normalizeEmail().trim().withMessage("Invalid email"),
  check('password').trim().withMessage("Password required")
];
exports.login = function login(req, res, next) {
  return new Promise(function (resolve, reject) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      reject({ error: errors.mapped() });
      return;
    }

    passport.authenticate('local', function (err, user, info) {
      if (err) {
        reject({ error: err });
      } else if (user) {//found a user, password matches!
        resolve({
          token: user.generateJwt(),
          _id: user._id
        });
      }
      else {
        reject({ error: "Invalid email or password" });
      }
    })(req, res);
  });
}