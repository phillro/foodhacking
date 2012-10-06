(function(){
  "use strict";

  // functions
  var getRestaurants, showRestaurants;

  $(document).ready(function(){
    getRestaurants();
  });

  getRestaurants = function(){
    var loc = $.cookie("geolocation").split(";");
    var lat = loc[0], lng = loc[1];

    $.ajax({
      url: "/restaurants/" + lat + "," + lng,
      success: showRestaurants,
      failure: function(err){
        console.log(err);
        alert("Can't load restaurants");
      }
    });
  };

  showRestaurants = function(data){
    data = JSON.parse(data);

    console.log(data[0]);
  };

}());
