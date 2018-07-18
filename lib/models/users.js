var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('config');

var usersSchema = new Schema({
  name: {type:String,required:true},
  email:{type:String,unique:true,required:true},
  bio:String,
  birthday:{type:Date,required:true},
  gender:{type:String,required:true},
  preference:{type:String,required:true},
  dateAdded:{type:Date,default:Date.now},
  location:Schema.Types.Mixed,
  pwHash:String,
  pwSalt:String
});

usersSchema.methods.getMyself = function(id,token){

}

usersSchema.methods.setPassword = function(password){
  this.pwSalt = crypto.randomBytes(16).toString('hex');
  this.pwHash = crypto.pbkdf2Sync(password,this.pwSalt,1000,64,'sha512').toString('hex');
};

usersSchema.methods.validPassword = function(password){
  var hash = crypto.pbkdf2Sync(password,this.pwSalt,1000,64,'sha512').toString('hex');
  return this.pwHash === hash;
};

usersSchema.methods.generateJwt = function(){
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id:this._id,
    email:this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000)
  },
    config.get('jwt').secret
  );
}

module.exports = mongoose.model('users',usersSchema);