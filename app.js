// SERVER SIDE

var express = require('express');
var path = require('path');
GLOBAL.appDir = path.dirname(require.main.filename);
var compression = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
GLOBAL.app = express();
app.env="production";

var server = require('http').Server(app);
var io = require('socket.io')(server);
GLOBAL.loki = require('lokijs');


app.fabric = require('fabric').fabric;
GLOBAL.fabric = app.fabric;

var Events = require('./lib/events');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Placement of this middleware function does matter.
app.use(function(req, res, next){
  res.io = io;
  next();
});

app.use(compression());

io.on('connection', function(socket) {
    new Events(socket);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  console.log("In development environment");
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = {app: app, server: server};
