var mongoose = require('mongoose');
var config = require('config');
var dbConfig = config.get('database');

var connectDatabase = function () {
  return new Promise(function (resolve, reject) {

    let connectionString;
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log("Mongo connection string: DEV")
      connectionString = 'mongodb://' + dbConfig.user + ':' + dbConfig.pass + '@' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.name;
    } else {
      console.log("Mongo connection string: PRODUCTION")
      connectionString = dbConfig.fullProductionURL;
    }

    mongoose.connect(connectionString, { useNewUrlParser: true }).then(function () {
      console.log("Mongoose connected successfully <3");
      resolve();
    }).catch(function (error) {
      console.log("error starting mongoose:");
      console.log(error);
      reject();
    })

  });
}

exports.connect = connectDatabase
exports = mongoose;