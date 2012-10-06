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
<<<<<<< HEAD
      res.render('punchpage');
    })
};
=======
      res.render('index');
    });
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
>>>>>>> aa5d4b49df7a909b5ae34c7deb85349ae4c6da64

      async.parallel(parallel_arr, function(err, cards){
        var params = {
          cards: cards
        };
        res.render("home", params);
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
