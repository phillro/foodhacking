$(document).ready(function(){
  $('#submitPhoto').submit(function(e){
    if(!$("#userPhoto").val()){
      e.preventDefault();
      $("#userPhoto").trigger('click');  
    }  
  });
});