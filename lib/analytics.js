'use strict'

function comma(val){
  val = ~~val;
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}

var Analytics = function () {

  var _this = this;

  // Initial data-grab
  $.ajax({url: "/analytics/real-time-visitors", success: function(result){
    $('#real-time-spinner').fadeOut(400, function() {
      $(this).remove();
      $('#real-time-text').addClass('huge');
      $('#real-time-text').text(comma(result));
    });
  }});

  $('#todays-sessions-text').text(comma(data.dailyMetrics.rows[1][1]));
  $('#yesterdays-sessions-text').text(comma(data.dailyMetrics.rows[0][1]));
  $('#todays-new-users-text').text(comma(data.dailyMetrics.rows[1][2]));
  $('#yesterdays-new-users-text').text(comma(data.dailyMetrics.rows[0][2]));
  $('#todays-revenue-text').text("$" + comma(data.dailyMetrics.rows[1][4]));
  $('#yesterdays-revenue-text').text("$" + comma(data.dailyMetrics.rows[0][4]));
}

window.app = {
  init: function() {
    var _this = this;
    console.info("Initializing analytics");
	this.Analytics = new Analytics();
  }
}

function fetchRealTimeVisitors() {
  $.ajax({url: "/analytics/real-time-visitors", success: function(result){
      console.log("Fetched real time visitors");
      $('#real-time-text').text(comma(result));
      // Schedule the next
      setTimeout(fetchRealTimeVisitors, 2000);
  }});
}

document.addEventListener('DOMContentLoaded', function(event) {
    console.log("DOM content has been loaded, initializing app");
    app.init();

    // On timer, we're going to call real-time updates
    setTimeout(fetchRealTimeVisitors, 2000);

    $(function() {
      $( document ).idleTimer(30000);
    });

    $( document ).on( "idle.idleTimer", function(event, elem, obj) {
        window.location = "/";
    });
});

