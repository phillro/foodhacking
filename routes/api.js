/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 11:37 AM
 */
var async = require('async'),
  util = require('util'),
  _    = require("underscore"),
  fs = require('fs');

function ApiResponse(res) {
  this.results = [];
  this.res = res;
  this.error = false;
}

ApiResponse.prototype.send = function () {
  var out = {}
  out.success = this.error ? 'false' : 'true';
  if (this.error) {
    out.error = this.error
    out.responseCode = 400
  } else {
    out.responseCode = 200
  }
  out.results = this.results
  this.res.send(JSON.stringify(out));
}

exports.listCards = function (req, res) {

  var out = new ApiResponse(res)
  var query = req.query.filter || {}
  req.models.Card.find(query, function (err, cards) {
    if (err) {
      out.error = err
    } else {
      for (var i = 0; i < cards.length; i++) {
        out.results.push(cards[i]._doc);
      }
    }
    out.send();
  })
}

exports.internal = {
  getCards:function (req, cb) {
    var user = req.session.user;
    req.models.Card.find({userIds:user._id}, cb);
  },
  getRestaurant:function (req, id, cb) {
    console.log("getting restaurant", req.indexName, id);
    var getCmd = req.elasticSearchClient.get(req.indexName, req.indexTypeName, id);

    getCmd.on('data', function (data) {
      console.log("data");
      cb(false, JSON.parse(data)._source);
    })
      .on('error', function (err) {
        console.log("error");
        cb(err);
      })
    .exec();
  },
  getCard: function(req, cardId, cb){
    req.models.Card.findById(cardId, function (err, card) {
      if (err) {
        return cb(err);
      } else {
        return cb(false, card);
      }
    })
  },
  getBounty: function(req,bountyId, cb){
    req.models.Bounty.findById(bountyId, cb);
  }
};

exports.showCard = function (req, res) {
  var out = new ApiResponse(res)
  req.models.Card.findById(req.params.id, function (err, card) {
    if (err) {
      out.error = err
    } else {
      out.results.push(card);
    }
    out.send();
  })
}


exports.showRestaurant = function (req, res) {
  var out = new ApiResponse(res);

  var getCmd = req.elasticSearchClient.get(req.indexName, req.indexTypeName, req.params.id)
  getCmd.on('data', function (data) {
    out.results.push(JSON.parse(data)._source);
    out.send();
  })
    .on('error', function (err) {
      out.err = err;
      out.send();
    })
    .exec();
}



exports.nearRestaurant = function (req, res) {
  var out = new ApiResponse(res)
  var lonlatstr = req.params.latlon;
  var lat = lonlatstr.split(',')[0];
  var lon = lonlatstr.split(',')[1];
  var limit = req.query.limit || 10;
  var skip = req.query.skip || 0;
  var geo = [parseFloat(lat),parseFloat(lon)];
  req.models.Card.find({userIds: req.session.user._id}, function(err, cards){
    var bountyIds = {};
    for (var i = 0; i < cards.length; i++){
      bountyIds[String(cards[i].bountyId)] = true;
    }
    console.log("bounties", bountyIds);
    req.models.Bounty.find({geo:{$near:geo}}, function (err, bounties) {
      if(err){
        console.log(err);
        out.error=err
      }else{
        for (var i = 0; i < bounties.length; i++) {
          if (_.isUndefined(bountyIds[String(bounties[i]._doc._id)])){
            out.results.push(bounties[i]._doc);
          }
        }
      }
      out.send();
    });
  });
}
/*

 app.get('/card',apiRoutes.listCards);
 app.get('/card/:id',apiRoutes.showCard);
 app.post('/card/:id/clip/:userId',apiRoutes.clipCard);
 */
