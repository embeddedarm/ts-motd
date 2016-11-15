var express = require('express');
var moment = require('moment');

var router = express.Router();

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var key = require('../ts-motd-fcced99fd886.json');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  SCOPES,
  null
);

var calendar = google.calendar('v3');
var client = google.calendar('v3');

var primaryCalendarId = 'technologicsystems@gmail.com';
var ptoCalendarId = 'fprj1ujdu00buolhrpjhpru9go@group.calendar.google.com';
var birthdaysCalendarId = '3kcght187ppd9tt93hmthturfk@group.calendar.google.com';
var holidaysCalendarId = 'en.usa#holiday@group.v.calendar.google.com';
var purchasingCalendarId = 'c83gf0lh4f8d7nghm5dt4f27t4@group.calendar.google.com';
var facilitiesCalendarId = 'p9u47hh2n4pcp4946lv5a6ugnk@group.calendar.google.com';
var marketingTeamCalendarId = 'raf45lmkm3btlgdcef1psfvt5o@group.calendar.google.com';


/* GET calendar listing */
router.get('/', function(req, res, next) {

    var events = {};

    jwtClient.authorize(function (err, token) {
      if (err) {
        console.log(err);
        return;
      }

      var primaryList = new Promise(function(resolve, reject) {
          var paramsPrimary = {
              'auth': jwtClient,
              'calendarId': primaryCalendarId,
              'timeMin': (new Date()).toISOString(),
              'timeMax': moment(new Date()).add(2, 'days').format(),
              'showDeleted': false,
              'singleEvents': true,
              'maxResults': 15,
              'orderBy': 'startTime'
          };

          calendar.events.list(paramsPrimary, function(err, response) {
              resolve(response);
          });
      });

      var ptoList = new Promise(function(resolve, reject) {
          var paramsPto = {
              'auth': jwtClient,
              'calendarId': ptoCalendarId,
              'timeMin': (new Date()).toISOString(),
              'timeMax': moment(new Date()).add(1, 'days').format(),
              'showDeleted': false,
              'singleEvents': true,
              'maxResults': 15,
              'orderBy': 'startTime'
          };

          calendar.events.list(paramsPto, function(err, response) {
              resolve(response);
          });
      });

      Promise.all([primaryList, ptoList]).then(function(response) {

	  	events = {
	  	   'primary': response[0].items,
	  	   'pto': response[1].items,
	  	};

        res.render('calendar', {title: 'TS Calendar', current: 'calendar', events: events});
      });
    });
});

module.exports = router;
