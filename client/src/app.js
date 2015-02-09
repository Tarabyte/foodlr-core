/*global angular*/
angular
  .module('app',
    ['crud', 'ui.router', 'auth', 'utils', 'rubric', 'category', 'recipe', 'article', 'product'])
  .config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
      .state('index', {
        url: '/',
        controller: ['$scope', function($scope) {
          $scope.recipeColumns = [
            {caption: 'Название', tmpl: 'link'},
            {caption: 'Категория', tmpl: 'categoryLabel'}
          ];

          $scope.productColumns = [
            {caption: 'Название', tmpl: 'link'},
            {caption: 'Категория', tmpl: 'categoryLabel'}
          ];
        }],
        templateUrl: 'templates/index.html'
      });

  }])
  .run(['$rootScope', 'SessionService', function($rootScope, SessionService) {
      $rootScope.$on('$stateChangeStart', SessionService.checkAccess.bind(SessionService));
  }]);
