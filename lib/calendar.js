'use strict'

//var moment = require('moment');

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '34226647040-cq6a7obq2v4dsgat69lkg0vcbd9i2gnk.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

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

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {

  // http://stackoverflow.com/questions/22971472/google-calendar-api-v3-batch-list-events
  // OR http://stackoverflow.com/questions/19939566/getting-all-events-for-all-calendars-with-google-api-javascript-client
  
  ////BatchRequest batch = gapi.client.batch();
  //var batch = gapi.client.batch();
  //for (var i = 0; i < calendarIDs.length; i++) {
  //    var req = gapi.client.events().list({
  //      'calendarId': calendarIDs[i],
  //      'timeMin': (new Date()).toISOString(),
  //      'timeMax': moment(new Date()).add(2, 'days').format(),
  //      'showDeleted': false,
  //      'singleEvents': true,
  //      'maxResults': 100,
  //      'orderBy': 'startTime'
  //    });

  //    batch.queue(req.buildHttpRequest(), Calendar.class, GoogleJsonErrorContainer.class, mycallback);
  //}           
  //batch.execute();


  var primaryCalendarId = 'technologicsystems@gmail.com';
  var ptoCalendarId = 'fprj1ujdu00buolhrpjhpru9go@group.calendar.google.com';
  var birthdaysCalendarId = '3kcght187ppd9tt93hmthturfk@group.calendar.google.com';
  var holidaysCalendarId = 'en.usa#holiday@group.v.calendar.google.com';
  var purchasingCalendarId = 'c83gf0lh4f8d7nghm5dt4f27t4@group.calendar.google.com';
  var facilitiesCalendarId = 'p9u47hh2n4pcp4946lv5a6ugnk@group.calendar.google.com';
  var marketingTeamCalendarId = 'raf45lmkm3btlgdcef1psfvt5o@group.calendar.google.com';
  
  var calendarIDs = ['primary', ptoCalendarId, birthdaysCalendarId, holidaysCalendarId];

  // PTO Calendar Items
  var request = gapi.client.calendar.events.list({
    'calendarId': ptoCalendarId,
    'timeMin': (new Date()).toISOString(),
    'timeMax': moment(new Date()).add(1, 'days').format(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 15,
    'orderBy': 'startTime'
  });

  request.execute(function(resp) {
    var ptoEvents = resp.items;

      if (ptoEvents.length > 0) {

        ptoEvents.forEach(function(event) {

          var when = moment(event.start.date).calendar(null, {
                sameDay: '[Today]', 
                nextDay: '[Starting Tomorrow]',
                nextWeek: 'dddd',
                lastDay: '[Starting Yesterday]',
                lastWeek: '[Starting Last] dddd',
                sameElse: 'DD/MM/YYYY'
              });

          $('#pto-list').append("<li><p><span class=\"summary\">" + event.summary + "</span><span class=\"when\">" + when + "</span></p></li>");
	    });

      }
  });

  // Primary Calendar Items
  var request = gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'timeMax': moment(new Date()).add(2, 'days').format(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 15,
    'orderBy': 'startTime'
  });

  request.execute(function(resp) {
    var events = resp.items;

	$('#events-loading-spinner').fadeOut(400, function() { 
      $(this).remove(); 

      if (events.length > 0) {

        events.forEach(function(event) {

          var when = event.start.dateTime;
          // This is a Date object
          if (!when) {
            when = moment(event.start.date).calendar(null, {
                sameDay: '[Today]', 
                nextDay: '[Starting Tomorrow]',
                nextWeek: 'dddd',
                lastDay: '[Starting Yesterday]',
                lastWeek: '[Starting Last] dddd',
                sameElse: 'DD/MM/YYYY'
              });
          }
          // This is a DateTime object
		  else {
            when = moment(event.start.dateTime).calendar();
          }

          $('#events-list').append("<li><p><span class=\"summary\">" + event.summary + "</span><span class=\"when\">" + when + "</span></p></li>");
	    });

 		//XXX: Not robust!  If no events, but PTO, PTO will not show.
		$('#events-list').fadeIn(400);
		$('#pto-list').fadeIn(400);

      } else {
        $('#events-list-container').empty();
        $('#events-list-container').append('<p>No upcoming events found.</p>');
      }
    });

  });
}

//module.exports = new Helpers()
