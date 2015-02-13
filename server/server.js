var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();


app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
app.boot = function(next) {
  console.log('booting');
  boot(app, __dirname, function() {
    console.log('booted');
    if(typeof next === 'function') {
      next();
    }
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.boot();
  app.start();
}
