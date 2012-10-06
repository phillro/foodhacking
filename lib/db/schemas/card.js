/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 11:58 AM
 */




var mongoose = require('mongoose')
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

var Card = new Schema({
  memberIds:{type:ObjectId},
  createdAt:{type:Date, "default":Date.now},
  updatedAt:{type:Date, "default":Date.now}
})

Card.pre('save', function (next) {
  this.updatedAt = new Date;
  next();
});

module.exports = Card