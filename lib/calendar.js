'use strict'

function addEvents(events, ulId) {
  var eventsAdded = false;

  if (events && events.length > 0) {
    eventsAdded = true;

    moment.tz.setDefault("America/Phoenix");

    events.forEach(function(event) {

      var when = '';
      var startWhen = event.start.dateTime; // Is it dateTime or date?
      if (!startWhen) {
        startWhen = moment(event.start.date).calendar(null, {
            sameDay: '[Today]', 
            nextDay: '[Starting Tomorrow]',
            nextWeek: 'dddd',
            lastDay: '[Starting Yesterday]',
            lastWeek: '[Starting Last] dddd',
            sameElse: 'MMM DD, YYYY'
        });
      }
      else {
        startWhen = moment(event.start.dateTime).calendar();
      }

      when += startWhen;

      var endWhen = event.end.dateTime;
      if (!endWhen) {
        endWhen = moment(event.end.date).subtract(1, 'hours').calendar(null, {
            sameDay: '[]',
            nextDay: '[Tomorrow]',
            nextWeek: 'dddd',
            lastDay: '[]',
            lastWeek: '[]',
            sameElse: 'MMM DD, YYYY'
        });
      }
      else {
        endWhen = moment(event.end.dateTime).calendar(null, {
            sameDay: 'h:mm A', 
            nextDay: '[Tomorrow] h:mm A',
            nextWeek: 'dddd',
            lastDay: '[]',
            lastWeek: '[]',
            sameElse: 'DD/MM/YYYY'
        });
      }

      if (endWhen != '') {
        when += ' to ' + endWhen;
      }

      $('#' + ulId).append("<li><p><span class=\"summary\">" + event.summary + "</span><span class=\"when\">" + when + "</span></p></li>");
    });
  }

  return eventsAdded;
}

var Calendar = function () {

  var _this = this;

  var ptoEventUlId = 'pto-list';
  var primaryEventUlId = 'events-list';
  
  var ptoEventsAdded = addEvents(events.pto, ptoEventUlId);
  var primaryEventsAdded = addEvents(events.primary, primaryEventUlId);
  
  $('#events-loading-spinner').fadeOut(400, function() { 
    $(this).remove(); 
  
    if (ptoEventsAdded) {
      $('#' + ptoEventUlId).fadeIn(400);
    }
  
    if (primaryEventsAdded) {
      $('#' + primaryEventUlId).fadeIn(400);
    }
  
    if (!ptoEventsAdded && !primaryEventsAdded) {
      $('#no-events').fadeIn(400);
    }
  });
}

window.app = {
  init: function() {
    var _this = this;
    console.info("Initializing calendar");
	this.Calendar = new Calendar();
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
    console.log("DOM content has been loaded, initializing app");
    app.init();

    $(function() {
      $( document ).idleTimer(30000);
    });

    $( document ).on( "idle.idleTimer", function(event, elem, obj) {
        window.location = "/";
    });
});

