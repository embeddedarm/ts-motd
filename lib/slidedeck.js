'use strict'

var Slidedeck = function () {
  var _this = this;

  /* SET PARAMETERS */
  var change_img_time 	= 10000;	
  var transition_speed	= 500;
  
  var simple_slideshow = $("#slidedeck");
  var listItems	= simple_slideshow.children('li');
  var listLen = listItems.length;
  var i = 0;
  var changeList = function () {
        	
  		listItems.eq(i).fadeOut(transition_speed, function () {
  			i += 1;
  			if (i === listLen) {
  				i = 0;
  			}
  			listItems.eq(i).fadeIn(transition_speed);
  		});

      };

  listItems.not(':first').hide();
  if (listLen > 1) {
      setInterval(changeList, change_img_time);
  }
}

window.app = {
  init: function() {
    var _this = this;
    console.info("Initializing calendar");
	this.Slidedeck = new Slidedeck();
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
    console.log("DOM content has been loaded, initializing slidedeck");
    app.init();

	$(function() {
      console.log("Initializing slidedeck");
    });

    //$(function() {
    //  $( document ).idleTimer(30000);
    //});

    //$( document ).on( "idle.idleTimer", function(event, elem, obj) {
    //    window.location = "/";
    //});
});

