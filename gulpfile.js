'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream')
var size = require('gulp-size')

 
gulp.task('sass', function () {
  return gulp.src('./sass/styles.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('browserify', function() {
    var b = browserify({entries: './lib/ts-motd.js', debug: false})

    return b.bundle()
        .pipe(source('ts-motd.js'))
        .pipe(buffer())
        // .pipe(ifElse(isProduction, uglify))
        .pipe(gulp.dest('./public/javascripts'))
        .pipe(size())
})

gulp.task('watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./lib/*.js', ['browserify:app'])

});

gulp.task('copy-javascripts', function() {
  gulp.src('./lib/calendar.js')
  .pipe(gulp.dest('./public/javascripts'));

  gulp.src('./lib/analytics.js')
  .pipe(gulp.dest('./public/javascripts'));

  gulp.src('./lib/jsKeyboard.js')
  .pipe(gulp.dest('./public/javascripts'));
});

//gulp.task('default', ['sass', 'watch'])
gulp.task('default', ['sass', 'browserify', 'copy-javascripts']);

