var express = require('express');
var moment = require('moment-timezone');
var path = require('path');
var multer = require('multer');
var mime = require('mime-types');
var fs = require('fs');
var sharp = require('sharp');
var crypto = require('crypto')

//import sharp from 'sharp';

moment.tz.setDefault("America/Phoenix");

var router = express.Router();

var uploadsDir = __dirname + '/../public/uploads';
var rawUploadsDir = uploadsDir + '/raw';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, rawUploadsDir)
  },
  filename: function (req, file, cb) {
    var ext = mime.extension(file.mimetype);
    var rand = crypto.pseudoRandomBytes(4).toString('hex')
    cb(null, moment().format("YYYY-MM-DD") + '-' + rand + '.' + ext)
  }
})

var fileTypesAccepted = [
  'png',
  'jpeg',
  'gif',
]

var uploading = multer({
    storage: storage,
    limits: {fileSize: 10000000, files:10},
    //fileFilter: function (req, file, cb) {
    // if (fileTypesAccepted.indexOf(mime.extension(file.mimetype) <= 0)) {
    //  req.fileValidationError = 'Unsupported file type';
    //  return cb(null, false, new Error("Unsupported file type '" + mime.extension(file.mimetype) + "'"));
    // }
    // cb(null, true);
    //}
});

/* GET slidedeck listing */
router.get('/', function(req, res, next) {

  fs.readdir(uploadsDir, function(err, items) {

      var slides = [];
      for (var i = 0; i < items.length; i++) {
          if (items[i] != 'raw') 
              slides.push(items[i]);
      }

      var valid = req.session.valid;
      req.session.valid = null; 

      var msg = null;

      if (valid == true) {
        msg = "Successfully uploaded slides to slidedeck!"; 
      }
      else if (valid == false) {
        msg = "Fail!  Something went wrong when uploading the slides to the slidedeck."; 
      }

      res.render('slidedeck/slidedeck', {title: 'TS Slidedeck', current: 'slidedeck', slides: slides, msg: msg});
  });

});

router.get('/manage', function(req, res, next) {
    fs.readdir(uploadsDir, function(err, items) {
        var slides = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i] != 'raw') 
                slides.push(items[i]);
        }

        res.render('slidedeck/manage', {
            title: 'TS Slidedeck Manager',
            current: 'slidedeck-manager',
            slides: slides
        });
    });
});

router.delete('/:filename', uploading.array('photos', 10), function(req, res, next) {

    var promise = new Promise(function(resolve, reject) {
        var filename = req.params.filename;
        fs.unlink(path.join(uploadsDir, filename), function() {
            console.log("Callback for image unlink");
            resolve("Image deleted");
        });
    });

    promise.then(function(result) {
        req.session.valid = true;
        res.redirect('/slidedeck/manage');
    }, function(err) { 
        res.status(500).send('Something broke!' + result)
    });

    //var filename = req.params.filename;
    //res.send('Hello World!' + filename)
});

router.post('/', uploading.array('photos', 10), function(req, res, next) {

    var promise = new Promise(function(resolve, reject) {

        for (var i = 0; i < req.files.length; i++) {

	        var file = req.files[i].path;
            var newFile = uploadsDir + '/' + req.files[i].filename;

            sharp(file)
                .resize(800, null)
                .toFile(newFile, function (err) { if (err) reject(err); });
        }

 		resolve("Images uploaded and resized successfully");
    });

    promise.then(function(result) {
        req.session.valid = true;
        res.redirect('/slidedeck/manage');
    }, function(err) { 
        res.status(500).send('Something broke!' + result)
    });
});


module.exports = router;
