/*jshint node:true*/
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var coffee = require('coffee-script');

coffee.register();

var sourceJs = ['./src/**/*.js', 'index.js'];
var tests = './test/**/[^_]*'; // _something is not a test but a fixture of whatever
var testSrc = './test/**/*'; //all files

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
 * Big Brother.
 */
gulp.task('watch', function() {
  gulp.watch(sourceJs, ['lint', 'test']);
  gulp.watch(sourceJs.concat(testSrc), ['test']);
});

gulp.task('default', ['lint', 'test', 'watch']);
