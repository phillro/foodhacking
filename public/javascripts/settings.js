$(document).bind("mobileinit", function(){
  $.mobile.ajaxEnabled = false;
});
$(document).ready(function(){
  if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(function(position){
       var cookieData = position.coords.latitude + ";" + position.coords.longitude;
       $.cookie("geolocation", cookieData, { path: '/' });
       }, function(){
       alert("We couldn't get your current location.")
     }
     );
    }
});