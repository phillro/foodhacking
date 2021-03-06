(function () {
  "use strict";
  var api = require("./api.js"),
    async = require("async"),
    _ = require('underscore');

  var getRestaurant;
  /*
   * GET home page.
   */

  exports.index = function (req, res) {
    if (req.session.user) {
      return res.redirect("/home");
    }
    req.models.Example.find({}, function (err, docs) {
      res.render('index');
    })
  };

  exports.home = function (req, res, next) {
    
    api.internal.getCards(req, function (err, cards) {
      if (err) {
        console.log(err);
        return next(500);
      }

      var parallel_arr = [];
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        card.clipsRemaining = card.clipsRequired - card.clipCount;
        parallel_arr.push(getRestaurant(req, card));
      }

      async.parallel(parallel_arr, function (err, cards) {
        var params = {
          cards:cards,
          user:req.session.user
        };
        res.render("home", params);
      });
    });
  };

  exports.card = function (req, res, next) {
    api.internal.getCard(req, req.params.card, function (err, card) {
      if (err) {
        return next(500);
      }
      getRestaurant(req, card)(function (err, card) {
        var params = {
          user:req.session.user,
          pageTitle:card.restaurantName,
          card:card,
          punched:false
        };
        for (var i = 0; i < (card.clipsRequired - card.clipCount) - 1; i++) {
          card.clips.push({
            image:"/images/punch.png"
          });
        }
        if (card.clipsRequired !== card.clipCount) {
          card.clips[9] = {
            image:"/images/free.png"
          };
        }
        card.clipsRemaining = card.clipsRequired - card.clipCount;
        req.models.Bounty.findById(card.bountyId, function (err, bounty) {
          params.bounty = bounty;
          res.render("punchpage.hbs", params);
        })

      });
    });
  };

  exports.clipCard = function (req, res) {

    var imageFile = false;
    if (req.files && req.files.photo) {
      imageFile = '/upload/' + req.files.photo.path.replace(/^.*[\\\/]/, '');
    }
    if (!imageFile) {
      out.error = "Image is required for a card clip."
    } else {

      async.waterfall([
        function getCard(cb) {
          req.models.Card.findById(req.params.id, function (err, card) {
            cb(err, card)
          })
        } ,
        function updateCard(card, cb) {
          console.log("updating card");
          var clip = {};
          clip.image = imageFile;
          clip.userId = req.params.userId
          card.clips.push(clip);
          card.clipCount++;
          card.save(function (err, saveResult) {
            cb(err, saveResult)
          });
        },
        function getBounty(card, cb) {
          req.models.Bounty.findById(card.bountyId, function (err, bounty) {
            cb(err, card, bounty)
          })
        },
        function (card, bounty, cb){
          getRestaurant(req, card)(function(err, card){
            cb(err, card, bounty);
          });
        },
        function updateUser(card, bounty, callback) {
          var user = req.session.user;
          if (!_.isNumber(user.points)) {
            user.points = 0;
          }
          user.points = user.points + 5;
          user.save(function (err, userResult) {
            callback(err, userResult, card, bounty)
          })
        }
      ], function (waterfallError, user, card, bounty) {
        if (waterfallError) {
          console.log(waterfallError)

        }else{
          var punched=false;
          if(card.clipCount>=card.clipsRequired){
            res.redirect('/punch/'+card._id+'/success');
          }else{
            console.log("card", card);
            var params = {
              user:req.session.user,
              pageTitle: card.restaurantName,
              card: card,
              bounty:bounty,
              punched: true
            };
            for (var i = 0; i < (parseInt(card.clipsRequired, 10) - parseInt(card.clipCount, 10)) - 1; i++){
              card.clips.push({
                image: "/images/punch.png"
              });
            }
            if (card.clipsRequired !== card.clipCount){
              card.clips[9] = {
                image: "/images/free.png"
              };
            }
            card.clipsRemaining = parseInt(card.clipsRequired, 10) - parseInt(card.clipCount, 10);
            return res.render('punchpage', params);
          }
        }
      })
    }
  }

  exports.clipCardSucess = function (req, res) {
    api.internal.getCard(req, req.params.card, function (err, card) {
      if (card) {
        req.models.Bounty.findById(card.bountyId, function (err, bounty) {
          var clips = [];
          async.forEach(card.clips, function (clip, callback) {
            req.models.User.findById(clip.userId, function (err, user) {
              if (user) {
                clip.user = user
                clips.push(clip);
              }
              callback()
            })
          }, function (forEachError) {
            res.render('punchpagesuccess', {user:req.session.user, card:card, clips:clips, punched:true, bounty:bounty});
          });

        })
      } else {
        res.send(500, {msg:'you suck', error:err});
      }

    })
  }

  exports.createCard = function (req, res, next) {
    api.internal.getBounty(req, req.params.bid, function (err, bounty) {
      var card = new req.models.Card({
        userIds:[req.session.user._id],
        bountyId:req.params.bid,
        clips:[],
        rid:bounty.rid,
        description:bounty.description
      });
      console.log("saving", card);
      card.save(function (err, card) {
        console.log("saved");
        if (err) {
          console.error(err);
          return next(500);
        }

        res.redirect("/punch/" + card.id);
      });
    });
  };

  exports.joinCard = function (req, res, next) {
    if (!req.session.user) {
      req.session.joining = req.params.id;
      return res.redirect("/login");
    }

    api.internal.getCard(req, req.params.id, function (err, card) {
      if (err) {
        return next(500);
      }

      card.userIds.push(req.session.user._id);
      card.save(function () {
        res.redirect("/home");
      });
    });
  };

  exports.share = function(req, res, next){

  };

  getRestaurant = function (req, card) {
    return function (cb) {
      api.internal.getRestaurant(req, card.rid, function (err, restaurant) {
        card.restaurantName = restaurant.name;
        cb(err, card);
      });
    }
  };
}());
