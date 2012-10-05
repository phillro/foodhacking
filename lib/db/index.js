/**
 * User: philliprosen
 * Date: 10/5/12
 * Time: 5:52 PM
 */


var fs = require('fs'),
  async = require('async'),
  mongo = require('mongodb'),
  extend = require("node.extend"),
  mongoose = require('mongoose');
/**
 * Loads all schemas into models using the supplied mongooseConnection
 * @param mongooseConnection
 */
module.exports = MongooseLayer

var MongooseLayer =   function mongooseLayer(mongooseConnection, options) {
  this.mongooseConnection=mongooseConnection;


  this.options = extend(options,{
    //Overrides schema file paths
    schemaPath : __dirname + 'schema',
    modelCollectionMapping :{}
  });
  this.models = {};
  this.schemas = {};
}

MongooseLayer.prototype.initModels = function(){
  var schemas = fs.readdirSync(this.options.schemaPath);
  for (var i = 0; i < schemas.length; i++) {
    var schema = schemas[i];
    var schema = require(__dirname + '/schemas/' + schemas[i]);
    var modelName = schemas[i].replace('Schema.js', '');
    var schemaName = modelName.replace(/([A-Z]+)/g, "_$1").replace(/^_/, "").toLowerCase();
    this.schemas[schemaName]=schema;
    this.models[modelName]= this.mongooseConnection.model(schemaName.toLowerCase(), schema);
  }
}