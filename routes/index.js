var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {

  var serializedCanvas = JSON.parse(JSON.stringify(app.canvas));
  serializedCanvas.objects.forEach(function(rawObject, i) {
      if(rawObject.type === 'group') {
          // Somehow this is set to black during group serialization...
          delete serializedCanvas.objects[i].fill;
      }
  });

  res.render('index', { title: 'TS Message of the Day', current: 'home', canvasState: JSON.stringify(serializedCanvas) });
});

/**
 * Present the droodle data as a javascript file that can be
 * retrieved as GZIP script.
 */
router.get('/js/state.js', function(req, res) {
    var serializedCanvas = JSON.parse(JSON.stringify(app.canvas));
    serializedCanvas.objects.forEach(function(obj, i) {
        if(obj.type === 'group') {
            // Somehow this is set to black during group serialization...
            delete serializedCanvas.objects[i].fill;
            delete serializedCanvas.objects[i].stroke;
        }

        // Preventing object:added loop.
        obj.remote = true;
    });

    res.send('window.initialState = ' + JSON.stringify(serializedCanvas) + ';');
});

router.get('/jquery/jquery.js', function(req, res, next) {
  res.sendFile(path.resolve(appDir + '/../node_modules/jquery/dist/jquery.min.js'));
});

router.get('/fabric/fabric.js', function(req, res, next) {
  res.sendFile(path.resolve(appDir + '/../node_modules/fabric/dist/fabric.js'));
});

router.get('/moment/moment.js', function(req, res, next) {
  res.sendFile(path.resolve(appDir + '/../node_modules/moment/min/moment.min.js'));
});

router.get('/moment/moment-timezone.js', function(req, res, next) {
  res.sendFile(path.resolve(appDir + '/../node_modules/moment-timezone/builds/moment-timezone-with-data.min.js'));
});

/**
 * Retrieve the current DOTD droodle as a PNG.
 */
router.get('/motd.png', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    var stream = canvas.createPNGStream();
    stream.on('data', function(chunk) {res.write(chunk)});
    stream.on('end', function() {res.end()});
});


/**
 * Retrieve the current DOTD droodle as a SVG.
 */
router.get('/motd.svg', function(req, res) {
    res.send(app.canvas.toSVG());
});

module.exports = router;
