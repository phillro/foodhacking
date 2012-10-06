(function(){
  "use strict";
  var foursquare = require("./Foursquare.js"),
      async      = require("async");

  var saveUser;

  exports.login = function(req, res, next){
    res.redirect(foursquare.getAuthRedirect());
  };

  exports.foursquareCallback = function(req, res, next){
    var oauth_token, schemas = req.models;
    async.waterfall([
      function(cb){ foursquare.getAccessToken(req.query.code, cb) },
      function(token, cb){ oauth_token = token; foursquare.getUserInfo(token, cb) },
      function(user, cb) { saveUser(schemas, oauth_token, user, cb) }
    ], function(err, user){
      if (err){
        console.error(err);
        return next(500);
      }

      req.session.user = user;
      res.send("hello " + user.first_name);
    });
  };

  saveUser = function(schemas, token, fsqUser, cb){
    var user = new schemas.User({
      foursquare_token: token,
      foursquare_id: fsqUser.user.id,
      first_name: fsqUser.user.firstName,
      last_name: fsqUser.user.lastName
    });
    user.save(cb);
  };
}());
