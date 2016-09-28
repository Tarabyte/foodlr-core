module.exports = function logExplorerOnStart(app) {
  app.once('started', function() {
    if(app.get('loopback-component-explorer')) {      
      const baseUrl = app.get('url').replace(/\/$/, '');
      const explorerPath = app.get('loopback-component-explorer').mountPath

      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
