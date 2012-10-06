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
  image:{type:String},
  createdAt:{type:Date, "default":Date.now}
})

var Card = new Schema({
  userIds: [{type:ObjectId, index: true}],
  clips:[CardClip],
<<<<<<< HEAD
=======
  rid: {type: String},
  description: {type: String},
>>>>>>> 9214b0e6ea046a5ca8e11315df3f27c46bc91b3c
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
