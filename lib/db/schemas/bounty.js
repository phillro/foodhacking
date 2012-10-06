/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 11:48 AM
 */



(function(){
  "use strict";

var mongoose = require('mongoose')
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

var Bounty = new Schema({
  restaurantId:{type:ObjectId, index:true},
  active:{type:Boolean, default: true},
  description:{type:String},
  createdAt:{type:Date, "default":Date.now},
  updatedAt:{type:Date, "default":Date.now}
})

Bounty.pre('save', function (next) {
  this.updatedAt = new Date;
  next();
});

module.exports = Bounty;

}());