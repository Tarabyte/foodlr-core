module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');
  var router = server.loopback.Router();
  
  console.log('Registering /api/status route')
  router.get(restApiRoot + '/status', server.loopback.status());

  server.use(router);
};
