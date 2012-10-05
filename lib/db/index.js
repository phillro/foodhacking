/**
 * User: philliprosen
 * Date: 10/5/12
 * Time: 5:52 PM
 */


var fs = require('fs'),
  async = require('async'),
  mongo = require('mongodb'),
  extend = require("extend"),
  mongoose = require('mongoose');
/**
 * Loads all schemas into models using the supplied mongooseConnection
 * @param mongooseConnection
 */


function MongooseLayer (mongooseConnection, options) {
  this.mongooseConnection=mongooseConnection;
  this.options = extend(options,{
    //Overrides schema file paths
    schemaPath : __dirname + '/schemas/',
    modelCollectionMapping :{}
  });
  this.models = {};
  this.schemas = {};
}

MongooseLayer.prototype.initModels = function(){
  var schemas = fs.readdirSync(this.options.schemaPath);
  for (var i = 0; i < schemas.length; i++) {
    var schema = require(this.options.schemaPath+schemas[i]);
    var modelName = schemas[i].replace('Schema.js', '').replace('.js','').charAt(0).toUpperCase() + schemas[i].replace('Schema.js', '').replace('.js','').slice(1);;
    var schemaName = modelName.replace(/([A-Z]+)/g, "_$1").replace(/^_/, "").toLowerCase();
    this.models[modelName]=this.mongooseConnection.model(schemaName.toLowerCase(), schema);
  }
}

module.exports.MongooseLayer = MongooseLayer