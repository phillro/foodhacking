(function(){
  "use strict";
  var foursquare = require("./Foursquare.js"),
      _          = require("underscore"),
      async      = require("async");

  var getUser;

  exports.login = function(req, res, next){
    res.redirect(foursquare.getAuthRedirect());
  };

  exports.foursquareCallback = function(req, res, next){
    var oauth_token, schemas = req.models;
    var waterfall_arr = [
      function(cb){ foursquare.getAccessToken(req.query.code, cb) },
      function(token, cb){ oauth_token = token; foursquare.getUserInfo(token, cb) },
      function(user, cb) { getUser(schemas, oauth_token, user, cb) }
    ];
    async.waterfall(waterfall_arr, function(err, user){
      if (err){
        console.error(err);
        return next(500);
      }

      req.session.user = user;
      res.redirect("/home");
    });
  };

  getUser = function(schemas, token, fsqUser, cb){
    schemas.User.findOne({foursquare_id: fsqUser.user.id}, function(err, user){
      if (_.isNull(user)){
        user = new schemas.User({
          foursquare_token: token,
          foursquare_id: fsqUser.user.id,
          first_name: fsqUser.user.firstName,
          last_name: fsqUser.user.lastName
        });
        user.save(cb);
      } else {
        cb(false, user);
      }
    });
  };
}());
