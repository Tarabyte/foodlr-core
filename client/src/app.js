/*global angular*/
angular
  .module('app', ['ui.router', 'auth', 'utils', 'rubric'])
  .config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
      .state('index', {
        url: '/',
        templateUrl: 'templates/index.html'
      });

  }])
  .run(['$rootScope', 'SessionService', function($rootScope, SessionService) {
      $rootScope.$on('$stateChangeStart', SessionService.checkAccess.bind(SessionService));
  }]);
