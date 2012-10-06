(function(){
  "use strict";
  var conf = require('nconf').argv().env().file({file:'./config.json'});

  var foursquare_config = {
    secrets: {
      clientId: conf.get("foursquare:key"),
      clientSecret: conf.get("foursquare:secret"),
      redirectUrl: conf.get("foursquare:redirect_url")
    }
  };
  console.log("config", foursquare_config);
  var Foursquare = require("node-foursquare")(foursquare_config);

  exports.getAuthRedirect = Foursquare.getAuthClientRedirectUrl;

  exports.getAccessToken = function(code, cb){
    Foursquare.getAccessToken({
      code: code
    }, cb);
  };

  exports.getUserInfo = function(token, cb){
    Foursquare.Users.getUser("self", token, cb);
  };

  exports.checkin = function(){
  };
}());
