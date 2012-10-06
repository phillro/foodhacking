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
  getCards: function(req, cb){
    req.models.Card.find({}, cb);
  },
  getRestaurant: function(req, id, cb){
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

exports.clipCard = function (req, res) {
  var out = new ApiResponse(res)

  var imageFile = false;
  if (req.files && req.files.file) {
    imageFile = req.files.file.replace(req.imageUploadPath)
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
        clip.image=imageFile;
        clip.userId=req.params.userId
        card.clips.push(clip);
        card.clipCount++;
        card.save(cb);
      },
      function checkCardCount(card, cb) {
        if (card.clipCount == card.clipsRequired) {
          //Do something cause the bounty requirement is met
        } else {
          cb(undefined, card, card.clipsRequired - card.clipCount + ' clips left to go!')
        }
      },
      function updateUser(card, cb){
        var user = req.session.user;
        if (!_.isNUmber(user.points)){
          user.points = 0;
        }
        user.points += 5;
        user.save(cb)
      }
    ], function (waterfallError, user, msg) {
      if (waterfallError) {
        out.err = waterfallError
      } else {
        out.msg = msg
      }
      out.send();
    })
  }

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
  var maxDistance = 10;
  var query = {"bool":{"must":[
    {"term":{"categories":"restaurants"}}
  ]}};
  query = {"match_all":{}}
  var qryObj = {
    "query":{
      "filtered":{
        "query":query,
        "filter":{
          "geo_distance":{
            "geo":{
              "lat":parseFloat(lat),
              "lon":parseFloat(lon)
            },
            "distance":"100"
          }
        }

      }
    },
    "from":skip,
    "size":limit
  }

  var getCmd = req.elasticSearchClient.search(req.indexName, req.indexTypeName, req.params.id, qryObj)
  getCmd.on('data', function (data) {
    var response = JSON.parse(data);
    if (response.error) {
      out.error = response.error
    } else {
      if (response.hits && response.hits.hits) {
        for (var i = 0; i < response.hits.hits.length; i++) {
          var hit = response.hits.hits[i];
          out.results.push(hit._source);
        }
      }
    }

    out.send();
  })
    .on('error', function (err) {
      out.error = err;
      out.send();
    })
    .exec();
}

/*

 app.get('/card',apiRoutes.listCards);
 app.get('/card/:id',apiRoutes.showCard);
 app.post('/card/:id/clip/:userId',apiRoutes.clipCard);
 */
