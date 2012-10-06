/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 11:37 AM
 */
require('async')

function ApiResponse(res) {
  this.results = [];
  this.res = res;
}

ApiResponse.prototype.send = function () {
  var out = {}
  out.success = this.error ? false : true;
  if (this.error) {
    out.errror = this.error
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
  async.waterfall([
    function getCard(cb) {
      req.models.Card.findById(req.params.id, function (err, card) {
        cb(err, card)
      })
    } ,
    function updateCard(card, cb) {
      var clip = {};
      card.clipCount++;
      card.save(cb);
    },
    function checkCardCount(card, cb) {
      if (card.clipCount == card.clipsRequired) {
        //Do something cause the bounty requirement is met
      } else {
        cb(undefined, card, card.clipsRequired - card.clipCount + ' clips left to go!')
      }
    }
  ], function (waterfallError, card, msg) {
    if (waterfallError) {
      out.err = waterfallError
    } else {
      out.msg = msg
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
  var lat = req.params.lat;
  var lon = req.params.lon;
  var limit = req.query.limit || 10;
  var skip = req.query.skip || 0;
  var maxDistance = 100;
  var qryObj = {
    "query":{
      "custom_score":{
        "query":{
          "filtered":{
            "query":{},
            "filter":{
              "geo_distance":{
                "geo":{
                  "lat":lonlatstr.split(',')[1],
                  "lon":lonlatstr.split(',')[0]
                },
                "distance":maxDistance
              }
            }

          }
        },
        "params":{
          "lat":lat,
          "lon":lon,
          "maxDistance":parseFloat(distance),
          "distanceWeight":1,
          "scoreWeight":0

        },
        "script":'(1-(doc["geo"].distanceInKm(lat,lon)/maxDistance))*distanceWeight+scoreWeight*_score'
      }
    },
    "script_fields":{
      "distance":{
        "params":{
          "lat":lat,
          "lon":lon
        },
        "script":'doc["geo"].distanceInKm(lat,lon)'
      }
    },
    "from":skip,
    "size":limit
  }

  var getCmd = req.elasticSearchClient.search(req.indexName, req.indexTypeName, req.params.id, qryObj)
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

/*

 app.get('/card',apiRoutes.listCards);
 app.get('/card/:id',apiRoutes.showCard);
 app.post('/card/:id/clip/:userId',apiRoutes.clipCard);
 */
