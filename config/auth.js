/*
This file holds the auth function for jwt
*/
var jwt = require('express-jwt');
var config = require('config');

module.exports = jwt({
  secret:config.get('jwt').secret,
  userProperty:'payload'
});