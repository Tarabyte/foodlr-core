/*global angular*/
angular
  .module('app', ['ui.router'])
  .config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
      .state('index', {
        url: '/',
        templateUrl: 'templates/index.html'
      });

  }]);
