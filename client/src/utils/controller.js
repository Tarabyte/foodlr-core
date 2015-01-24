/*global angular*/
angular.module('controller', [])
  .config(['$provide', '$controllerProvider', function($provide, $controllerProvider) {
    var controllerCache = {},
        oldRegister = $controllerProvider.register;

    $controllerProvider.register = function(name, ctrl) {
      console.log('registering: ', name);
      controllerCache[name] = ctrl;
      oldRegister.apply($controllerProvider, arguments);
    };

    $provide.provider('$controllerConstructor', function() {
      this.$get = function() {
        return function(name) {
          return controllerCache[name];
        };
      };
    });
  }]);
