/**
 * User: philliprosen
 * Date: 10/6/12
 * Time: 11:38 AM
 */

var indexRoutes = require('./index.js');
var apiRoutes = require('./api.js');

module.exports = function(app){



  app.get('/', indexRoutes.index);



  app.get('/bounties',indexRoutes.showBounties);

}



