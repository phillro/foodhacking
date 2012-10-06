(function(){
  "use strict";
  var api   = require("./api.js"),
      async = require("async");

  var getRestaurant;
  /*
   * GET home page.
   */

  exports.index = function (req, res) {
    if (req.session.user){
      return res.redirect("/home");
    }
    req.models.Example.find({}, function (err, docs) {
      res.render('punchpage');
    })
};

  exports.home = function(req, res, next){
    if (!req.session.user){
      res.redirect("/");
    }
    api.internal.getCards(req, function(err, cards){
      if (err){
        console.log(err);
        return next(500);
      }

      var parallel_arr = [];
      for (var i = 0; i < cards.length; i++){
        var card = cards[i];
        parallel_arr.push(getRestaurant(req, card));
      }

      async.parallel(parallel_arr, function(err, cards){
        var params = {
          cards: cards,
          user: req.session.user
        };
        res.render("home", params);
      });
    });
  };

  exports.card = function(req, res, next){
    api.internal.getCard(req, req.params.card, function(err, card){
      if (err){
        return next(500);
      }
      getRestaurant(req, card)(function(err, card){
        var params = {
          user: req.session.user,
          pageTitle: card.restaurantName,
          card: card
        };
        res.render("punchpage.hbs", params);
      });
    });
  };

  getRestaurant = function(req, card){
    return function(cb){
      api.internal.getRestaurant(req, card.rid, function(err, restaurant){
        card.restaurantName = restaurant.name;
        cb(err, card);
      });
    }
  };
}());
