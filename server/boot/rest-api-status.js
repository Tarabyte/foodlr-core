module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');
  var router = server.loopback.Router();
  
  router.get(restApiRoot + '/status', server.loopback.status());

  server.use(router);
};
