(function(){
  "use strict";
  var foursquare = require("./Foursquare.js");

  exports.setup = function(req, res, next){
    var params = {
      foursquareLink: foursquare.getAuthRedirect()
    };
    res.render("setup", params);
  };

  exports.foursquareCallback = function(req, res, next){
    foursquare.getAccessToken(req.query.code, function(err, token){
      res.send("Got access " + token);
    });
  };
}());
