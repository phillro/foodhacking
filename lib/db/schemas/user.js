/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 12:00 PM
 */


var mongoose = require('mongoose')
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId




var User = new Schema({
  foursquareId:{type:String},
  points:{type:Number},
  createdAt:{type:Date, "default":Date.now},
  updatedAt:{type:Date, "default":Date.now}
})

User.pre('save', function (next) {
  this.updatedAt = new Date;
  next();
});

module.exports = User