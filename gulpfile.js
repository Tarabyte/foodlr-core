/*jshint node:true*/
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var coffee = require('coffee-script');
var connect = require('connect');
var tinyLr = require('tiny-lr');
var proxy = require('proxy-middleware');
var static = require('serve-static');
var http = require('http');
var _ = require('lodash');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var rebaseCss = require('gulp-css-rebase-urls');
var angularTemplates = require('gulp-angular-templatecache');


coffee.register();

var sourceJs = ['./server/**/*.js', './common/**/*'];
var tests = './test/**/[^_]*'; // _something is not a test but a fixture of whatever
var testSrc = './test/**/*'; //all files
var client = 'client';
var lessSrc = './client/styles/**/*.less';
var cssSrc = ["client/vendor/font-awesome/css/font-awesome.css", "client/vendor/angular-ui-select/dist/select.css", "client/vendor/textAngular/src/textAngular.css", "client/vendor/angular-growl-v2/build/angular-growl.css", "client/styles/foodlr.css",'client/vendor/angular/angular-csp.css'];
var templateSrc = ['client/templates/**/*.html', 'client/src/**/*.html'];

var lr;

function notifyLr(file) {
  var fileName = require('path').relative(client, file.path);

  console.log('Reloading: %s', fileName);

  lr.changed({
    body: {
      files: [fileName]
    }
  })
}

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
  return gulp.src(tests, {
    read: false
  })
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
    port = config.port,
    server = connect(),
    options = {
      hostname: host,
      port: port,
      pathname: apiRoot
    };

  lr = tinyLr();

  lr.listen(35729);

  options.route = apiRoot;

  server.use(proxy(options));

  server.use(static(client, {
    index: 'index.dev.html'
  }));

  http.createServer(server).listen(8666);
});

/**
 * Run backend server.
 */
gulp.task('backend', function(next) {
  //process.env.DEBUG = "loopback:connector:mongodb";

  require('child_process').exec('slc run', process, function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  }).stdout.pipe(process.stdout);

  next();
});

/**
 * Generate angular services.
 */
gulp.task('generate-services', function(done) {
  var generateServices = require('loopback-sdk-angular').services;
  var app = require('./server/server');

  app.boot(function() {
    var client = generateServices(app, 'lbServices', '/api');
    require('fs')
      .writeFile('./client/src/lb-services.js', client, function() {
        this.process.exit();
        done();
      });
  });
});

/**
 * Compile less files.
 */
gulp.task('less', function() {
  return gulp.src(lessSrc)
    .pipe(less().on('error', function(error) {
      console.log(error);
      this.emit('end');
      this.end();
    }))
    .pipe(gulp.dest('./client/styles/'));
});


/**
 * Concat and minify css files,
 */
gulp.task('css', ['less'], function() {
  return gulp.src(cssSrc)
      .pipe(rebaseCss({root: client}))
      .pipe(concat('foodlr.min.css'))
      .pipe(minifyCss())
      .pipe(gulp.dest(client));
});

/**
 * Preload and cache templates.
 */
gulp.task('templates', function() {
  return gulp.src(templateSrc)
    .pipe(angularTemplates('templates.prod.js', {
      moduleSystem: 'RequireJS',
      standalone: true,
      module: 'templates',
      root: 'src'
    }))
    .pipe(gulp.dest('client/src/templates'));
});

/**
 * Minify js files.
 */
gulp.task('scripts', ['templates'], function(next) {
  var requirejs = require('requirejs'),
      config = require('./client/config'),
      paths = config.paths;

  paths.templates = 'src/templates/templates.prod'

  var settings = {
    uglify2: true,
    out: 'client/foodlr.min.js',
    name: 'src/main',
    optimize: 'uglify2',
    baseUrl: 'client',
    paths: config.paths,
    shim: config.shim,

  };

  requirejs.optimize(settings, function(data){
      console.log('Production build ok!');
      next();
  }, function(err) {
      console.log('Production build fail!', err);
      next();
  });
});


/**
 * Big Brother.
 */
gulp.task('watch', function() {
  gulp.watch(sourceJs, ['lint', 'test']);
  gulp.watch(sourceJs.concat(testSrc), ['test']);
  gulp.watch(lessSrc, ['less']);
  gulp.watch('client/**/*', _.debounce(function(arg) {
    notifyLr(arg);
  }, 1000));
});

gulp.task('default', ['lint', 'test', 'less', 'watch', 'server']);

gulp.task('build', ['css', 'scripts']);
