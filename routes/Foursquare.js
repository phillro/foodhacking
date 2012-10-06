(function(){
  "use strict";
  var conf = require('nconf').argv().env().file({file:'./config.json'});

  var foursquare_config = {
    clientId: conf.get("foursquare:key"),
    clientSecret: conf.get("foursquare:secret"),
    redirectUrl: conf.get("foursquare:redirect_url")
  };
  var Foursquare = require("node-foursquare")(foursquare_config);

  exports.getAuthRedirect = Foursquare.getAuthClientRedirectUrl;

  exports.authCallback = function(req){
    return req.query.code;
  };

  exports.checkin = function(){
  };
}());
