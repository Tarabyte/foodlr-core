/*global angular*/
'use strict';
angular.module('recipe', ['lbServices', 'crud'])
  .controller('RecipeListCtrl', ['$scope', '$injector', function($scope, $injector) {
    var options = {},
        Recipe = $injector.get('Recipe'),
        Rubric = $injector.get('Rubric'),
        Category = $injector.get('Category');

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

    function reload() {
      var filter = {};
      /*if($scope.currentCategory) {
        filter.category = $scope.currentCategory;
      }
      if($scope.currentRubric) {
        filter.rubricId = $scope.currentRubric;
      }*/

      Recipe.find({
        filter: {
          limit: 10
        }
      }).$promise.then(function(data) {
        console.log(data);
        $scope.list = data;
      });
    }

    reload();


  }])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('recipies', {
      url: '/recipies',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Rubric'
      }
    })
    .state('recipies.list', {
      url: '',
      templateUrl: 'src/recipe/list.html',
      controller: 'ListCtrl as ctrl'
    });
  }]);
