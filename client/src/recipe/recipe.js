/*global angular*/
'use strict';

function RecipeListCtlr($scope, $injector) {
  var options = {},
      Recipe = $injector.get('Recipe'),
      Rubric = $injector.get('Rubric'),
      Category = $injector.get('Category'),
      controller = $injector.get('$controller'),
      instance = controller('ListCtrl', {$scope: $scope, $injector: $injector});


  $scope.currentCategory = 0;
  $scope.currentRubric = 0;
  $scope.selectCategory = function(id) {
    $scope.currentCategory = id;
  };
  $scope.selectRubric = function(id) {
    $scope.currentRubric = id;
  };

  Rubric.active().$promise.then(function(data) {
    data.unshift({caption: 'Все', id: 0});
    $scope.rubrics = data;
  });

  Category.active().$promise.then(function(data) {
    data.unshift({caption: 'Все', id: 0});
    $scope.categories = data;
  });


  return instance;
}

RecipeListCtlr.$inject = ['$scope', '$injector'];

angular.module('recipe', ['lbServices', 'crud'])
  .controller('RecipeListCtrl', RecipeListCtlr)
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('recipies', {
      url: '/recipies',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Recipe',
        title: 'Рецепты',
        root: 'recipies'

      }
    })
    .state('recipies.list', {
      url: '',
      templateUrl: 'src/recipe/list.html',
      controller: 'RecipeListCtrl as ctrl'
    })
    .state('recipies.item', {
      url: '/:id',
      templateUrl: 'src/recipe/item.html',
      controller: 'ItemCtrl as ctrl'
    })
    .state('recipies.new', {
      url: '/new',
      templateUrl: 'src/recipe/item.html',
      controller: 'ItemCtrl as ctrl'
    });
  }]);
