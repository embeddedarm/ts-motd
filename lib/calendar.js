'use strict'

//var moment = require('moment');

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '34226647040-cq6a7obq2v4dsgat69lkg0vcbd9i2gnk.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

var primaryCalendarId = 'technologicsystems@gmail.com';
var ptoCalendarId = 'fprj1ujdu00buolhrpjhpru9go@group.calendar.google.com';
var birthdaysCalendarId = '3kcght187ppd9tt93hmthturfk@group.calendar.google.com';
var holidaysCalendarId = 'en.usa#holiday@group.v.calendar.google.com';
var purchasingCalendarId = 'c83gf0lh4f8d7nghm5dt4f27t4@group.calendar.google.com';
var facilitiesCalendarId = 'p9u47hh2n4pcp4946lv5a6ugnk@group.calendar.google.com';
var marketingTeamCalendarId = 'raf45lmkm3btlgdcef1psfvt5o@group.calendar.google.com';

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  var authorizeButton = document.getElementById('authorize-button');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadCalendarApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
    authorizeDiv.style.zIndex = '999999';
    authorizeButton.style.zIndex = '99999';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

function addEvents(events, ulId) {
  var eventsAdded = false;

  if (events.length > 0) {
    eventsAdded = true;
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
            sameElse: 'DD/MM/YYYY'
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
            sameElse: 'DD/MM/YYYY'
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

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {

  var batch = gapi.client.newBatch();

  var calendarRequest = function(calendarId, timeMin, timeMax) {
    return gapi.client.calendar.events.list({
      'calendarId': calendarId,
      'timeMin': timeMin, //(new Date()).toISOString(),
      'timeMax': timeMax, //moment(new Date()).add(1, 'days').format(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 15,
      'orderBy': 'startTime'
    });
  };

  var ptoCalendar = calendarRequest(ptoCalendarId, (new Date()).toISOString(), moment(new Date()).add(1, 'days').format());
  var primaryCalendar = calendarRequest(primaryCalendarId, (new Date()).toISOString(), moment(new Date()).add(2, 'days').format());

  batch.add(ptoCalendar, {'id': 'ptoCalendar'});
  batch.add(primaryCalendar, {'id': 'primaryCalendar'});

  batch.execute(function(responseMap, rawBatchResponse) {

    var ptoEvents = responseMap.ptoCalendar.result.items;
    var primaryEvents = responseMap.primaryCalendar.result.items;

    var ptoEventUlId = 'pto-list';
    var primaryEventUlId = 'events-list';

    var ptoEventsAdded = addEvents(ptoEvents, ptoEventUlId);
    var primaryEventsAdded = addEvents(primaryEvents, primaryEventUlId);

    $('#events-loading-spinner').fadeOut(400, function() { 
      $(this).remove(); 

      if (ptoEventsAdded) {
        $('#' + ptoEventUlId).fadeIn(400);
      }

      if (primaryEventsAdded) {
        $('#' + primaryEventUlId).fadeIn(400);
      }

      if (!ptoEventsAdded && !primaryEventsAdded) {
        $('#events-list-container').empty();
        $('#events-list-container').append('<p>No upcoming events found.</p>');
      }
    });

  });
}

//module.exports = new Helpers()
