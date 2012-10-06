(function(){
  "use strict";
  /*
   * GET home page.
   */

  exports.index = function (req, res) {
    if (req.session.user){
      return res.redirect("/home");
    }
    req.models.Example.find({}, function (err, docs) {
      res.render('index');
    });
  };

  exports.home = function(req, res, next){
    res.render("home");
  };
}());
