define(['angular' , 'ui.router', './utils/crud', './auth/auth', './utils/utils',
        './recipe/recipe', './product/product', './article/article', './category/category', './rubric/rubric', './faq/faq'], function(angular){
  angular
    .module('app',
      ['crud', 'ui.router', 'auth', 'utils', 'rubric', 'category', 'recipe',
       'article', 'product', 'faq']
      )
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

            $scope.productFields = $scope.recipeFields = {
              id: true,
              caption: true,
              category: true
            };

            $scope.articleColumns = [
              {caption: 'Название', tmpl: 'link'},
              {caption: 'Текст', tmpl: '{{::item.content|limitTo: 100|html}}...'}
            ];

            $scope.faqColumns = [
              {caption: 'Вопрос', tmpl: 'link'},
              {caption: 'Ответ', tmpl: '{{::item.content|limitTo: 100|html}}...'}
            ];

            $scope.articleFields = $scope.faqFields = {
              id: true,
              caption: true,
              content: true
            }
          }],
          templateUrl: 'templates/index.html'
        });

    }])
    .run(['$rootScope', 'SessionService', function($rootScope, SessionService) {
        $rootScope.$on('$stateChangeStart', SessionService.checkAccess.bind(SessionService));
    }]);

});
