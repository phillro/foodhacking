/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 11:38 AM
 */

var indexRoutes = require('./index.js');
var userRoutes  = require("./user.js");
var apiRoutes = require('./api.js');


module.exports = function(app){

  app.get('/', indexRoutes.index);
  app.get("/home", indexRoutes.home);

  app.get("/punch/:card", indexRoutes.card);
  app.post('/punch/:id/clip/:userId',indexRoutes.clipCard);

  app.get("/login", userRoutes.login);
  app.get("/fs/callback", userRoutes.foursquareCallback);



  app.get('/bounties',apiRoutes.listBounties);
  app.get('/bounties/:bid',apiRoutes.showBounty);


  app.get("/card/create/:bid", indexRoutes.createCard);
  app.get('/card',apiRoutes.listCards);
  app.get('/card/:id',apiRoutes.showCard);
  app.get('/card/:id/join', indexRoutes.joinCard);


  app.get('/restaurant/:id',apiRoutes.showRestaurant);
  app.get('/restaurants/:latlon',apiRoutes.nearRestaurant);

}
