/*jshint node:true*/
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var coffee = require('coffee-script');
var connect = require('gulp-connect');
var proxy = require('proxy-middleware');
var url = require('url');


coffee.register();

var sourceJs = ['./server/**/*.js'];
var tests = './test/**/[^_]*'; // _something is not a test but a fixture of whatever
var testSrc = './test/**/*'; //all files
var client = 'client';

/**
 * Lint source files
 */
gulp.task('lint', function() {
  return gulp.src(sourceJs)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

/**
 * Test source files.
 */
gulp.task('test', function() {
  return gulp.src(tests, {read: false})
    .pipe(mocha({
      reporter: 'nyan',
      ui: 'bdd'
    }));
});

/**
 * Start dev server with livereload and such
 */
gulp.task('server', ['backend'], function() {
  var config = require('./server/config.json'),
      apiRoot = config.restApiRoot,
      host = config.host,
      port = config.port;

  connect.server({
    livereload: true,
    port: 8666,
    root: client,
    middleware: function() {
      var options = {
        hostname: host,
        port: port,
        pathname: apiRoot
      };

      options.route = apiRoot;

      return [
        proxy(options)
      ];
    }
  });
});

/**
 * Run backend server.
 */
gulp.task('backend', function(next) {
  require('child_process').exec('slc run', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
  next();
});

/**
 * Big Brother.
 */
gulp.task('watch', function() {
  gulp.watch(sourceJs, ['lint', 'test']);
  gulp.watch(sourceJs.concat(testSrc), ['test']);
});

gulp.task('default', ['lint', 'test', 'watch', 'server']);
