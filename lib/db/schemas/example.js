/**
 * User: philliprosen
 * Date: 10/5/12
 * Time: 5:59 PM
 */


var mongoose = require('mongoose')
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

var Example = new Schema({
  name:{type:String},
  createdAt:{type:Date, "default":Date.now},
  updatedAt:{type:Date, "default":Date.now}
})

Example.pre('save', function (next) {
  this.updatedAt = new Date;
  next();
});

module.exports = Example