/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 11:58 AM
 */




var mongoose = require('mongoose')
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId

var CardClip = new Schema({
  userId:{type:ObjectId},
  createdAt:{type:Date, "default":Date.now}
})

var Card = new Schema({
  userIds: [{type:ObjectId, index: true}],
  clips:[CardClip],
  rid: {type: String},
  description: {type: String},
  completed:{type:Boolean, default:false},
  clipCount:{type:Number, default:0},
  clipsRequired:{type:Number, default:10},
  createdAt:{type:Date, "default":Date.now},
  updatedAt:{type:Date, "default":Date.now}
})

Card.pre('save', function (next) {
  this.updatedAt = new Date;
  next();
});

module.exports = Card
