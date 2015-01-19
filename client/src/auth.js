/*global angular*/
angular
  .module('auth', ['ui.router'])
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'templates/auth/login.html'
      });

  }])
  .service('SessionService', ['$injector', function($injector) {
    this.doSmth = function() {
      console.log('doing something', $injector);
    };

  }]);
