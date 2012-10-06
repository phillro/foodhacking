/**
 * Module dependencies.
 */

var express = require('express')
  , connect = require('connect')
  , Redis = require('redis')
  , express = require('express')
  , everyauth = require('everyauth')
  , mongoose = require('mongoose')
  , routes = require('./routes')
  , mongoose = require('mongoose')
  , ElasticSearchClient = require('elasticsearchclient');

var app = module.exports = express.createServer();

var nconf = require('nconf').argv().env().file({file:'./config.json'});



var mongoDbConnectionString = buildDbString(nconf.get("mongo:user"),
  nconf.get("mongo:password"),
  nconf.get("mongo:host"),
  nconf.get("mongo:port"),
  nconf.get("mongo:dbName"));

var mongooseDbConnection = mongoose.createConnection(mongoDbConnectionString);
var  MongooseLayer= require('./lib/db/index.js').MongooseLayer;
var mongooseLayer = new MongooseLayer(mongooseDbConnection);
mongooseLayer.initModels();


var RedisStore = require('connect-redis')(express);
var redisClient = new Redis.createClient(nconf.get('redis:port'),nconf.get('redis:host'));
var sessionStore = new RedisStore(nconf.get('redis'));
var session = express.session({ secret:'foodhack', store:sessionStore })

var elasticSearchCilent = new ElasticSearchClient(nconf.get('elasticsearch'));


// Configuration
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(session);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

// Routes

app.all('*', function (req, res, next) {
  req.redisClient = redisClient;
  req.models = mongooseLayer.models;
  req.elasticSearchClient = elasticSearchCilent;
  next()
})

new require('./routes/routes.js')(app);



app.listen(4000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

function buildDbString(user, pass, host, port, dbName) {
  var connectionString = 'mongodb://' + user
    + ':' + pass
    + '@' + host
    + ':' + port
    + '/' + dbName;
  return connectionString

}
