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

exports.listBounties = function (req, res) {
  var out = new ApiResponse(res)
  var query = req.query.filter || {}
  req.models.Bounty.find(query, function (err, bounties) {
    if (err) {
      out.error = err
    } else {
      for (var i = 0; i < bounties.length; i++) {
        out.results.push(bounties[i]._doc);
      }
    }
    out.send();
  })
}

exports.showBounty = function (req, res) {
  var out = new ApiResponse(res)
  req.models.Bounty.findById(req.params.id, function (err, bounty) {
    if (err) {
      out.error = err
    } else {
      out.results.push(bounty);
    }
    out.send();
  })
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
  async.waterfall ([
    function getCard(cb){
      req.models.Card.findById(req.params.id, function (err, card) {
        cb(err, card)
      })
    } ,
    function updateCard(card, cb){
      var clip = {};
      card.clipCount++;
      card.save(cb);
    },
    function checkCardCount(card, cb){
      if(card.clipCount==card.clipsRequired){
        //Do something cause the bounty requirement is met
      }else{
        cb(undefined, card, card.clipsRequired-card.clipCount+ ' clips left to go!')
      }
    }
  ],function(waterfallError, card, msg){
    if(waterfallError){
      out.err=waterfallError
    }else{
      out.msg = msg
    }
    out.send();
  })
}

exports.showRestaurant = function (req, res) {
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

/*

  app.get('/card',apiRoutes.listCards);
  app.get('/card/:id',apiRoutes.showCard);
  app.post('/card/:id/clip/:userId',apiRoutes.clipCard);
*/
