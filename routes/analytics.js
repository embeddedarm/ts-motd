var express = require('express');
var moment = require('moment');

var router = express.Router();

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var key = require('../ts-motd-fcced99fd886.json');
var SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];

var VIEW_ID = 'ga:93198762';


var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  SCOPES,
  null
);

var analytics = google.analytics('v3');

var primaryCalendarId = 'technologicsystems@gmail.com';
var ptoCalendarId = 'fprj1ujdu00buolhrpjhpru9go@group.calendar.google.com';
var birthdaysCalendarId = '3kcght187ppd9tt93hmthturfk@group.calendar.google.com';
var holidaysCalendarId = 'en.usa#holiday@group.v.calendar.google.com';
var purchasingCalendarId = 'c83gf0lh4f8d7nghm5dt4f27t4@group.calendar.google.com';
var facilitiesCalendarId = 'p9u47hh2n4pcp4946lv5a6ugnk@group.calendar.google.com';
var marketingTeamCalendarId = 'raf45lmkm3btlgdcef1psfvt5o@group.calendar.google.com';


/* GET calendar listing */
router.get('/', function(req, res, next) {

    var data = {};

    jwtClient.authorize(function (err, token) {

      if (err) {
        console.log(err);
        return;
      }
      
      var dailyMetrics = new Promise(function(resolve, reject) {
          var params = {
            'auth': jwtClient,
            'ids': VIEW_ID,
            'metrics': 'ga:sessions, ga:newUsers, ga:adClicks, ga:transactionRevenue',
            'dimensions': 'ga:nthDay',
            'start-date': 'yesterday',
            'end-date': 'today',
          };

          analytics.data.ga.get(params, function(err, response) {
              resolve(response);
          });
      });

      Promise.all([dailyMetrics]).then(function(response) {
          data = {
              'dailyMetrics': response[0],
          };

          res.render('analytics', {title: 'TS Analytics', current: 'analytics', data: data}); 
      });
    });
});

// http://localhost:8080/analytics/real-time-visitors
router.get('/real-time-visitors', function(req, res, next) {

    var data = {};

    jwtClient.authorize(function (err, token) {

      if (err) {
        console.log(err);
        return;
      }

    });

    var realTimeMetrics = new Promise(function(resolve, reject) {
        var params = {
          'auth': jwtClient,
          'ids': VIEW_ID,
          'metrics': 'rt:activeUsers',
          'dimensions': 'rt:medium',
        };

        analytics.data.realtime.get(params, function(err, response) {
            resolve(response);
        });


    });

    realTimeMetrics.then(function(response) {
        res.json(response.totalsForAllResults["rt:activeUsers"]);
    });
});

module.exports = router;
