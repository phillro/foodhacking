/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 12:00 PM
 */
(function(){
  "use strict";

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;



  var User = new Schema({
    foursquareId:{type:String},
    foursquare_token: {type: String},
    points:{type:Number, default: 0},
    first_name: {type: String},
    last_name: {type: String},

    createdAt:{type:Date, "default":Date.now},
    updatedAt:{type:Date, "default":Date.now}
  });

  User.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });
  module.exports = User;
}());
