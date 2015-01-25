/*global angular*/
'use strict';

function RecipeListCtlr($scope, $injector) {
  var Recipe = $injector.get('Recipe'),
      Rubric = $injector.get('Rubric'),
      Category = $injector.get('Category'),
      $state = $injector.get('$state'),
      page = 1, size = 2;


  $scope.currentCategory = 0;
  $scope.currentRubric = 0;

  Rubric.active().$promise.then(function(data) {
    data.unshift({caption: 'Все', id: 0});
    $scope.rubrics = data;
  });

  Category.active().$promise.then(function(data) {
    data.unshift({caption: 'Все', id: 0});
    $scope.categories = data;
  });

  $scope.items = [];
  Object.defineProperty($scope, 'page', {
    get: function() {
      return page;
    }
  });

  Object.defineProperty($scope, 'size', {
    get: function() {
      return size;
    }
  });

  function range(to) {
    var start, end, middle;
    to = to || 1;
    start = [1, 2, 3];
    end = [to-2, to-1, to];
    middle = [page-1, page, page+1];


    return start.concat(middle, end).filter(function(item) {
      return item >0 && item <= to;
    })
    .sort()
    .filter(function(item, i, array) {
      return item !== array[i-1];
    });
  }

  function setPage(val) {
    page = val;
    fetch();
  }

  function fetch() {
    var options = {
      size: size,
      page: page - 1
    }, filter = {where: {}};

    if($scope.currentCategory) {
      options.filter = filter;
      filter.where.categoryId = $scope.currentCategory;
    }
    if($scope.currentRubric) {
      options.filter = filter;
      filter.where.rubricId = $scope.currentRubric;
    }
    Recipe.paginate(options).$promise.then(function(data) {
      $scope.items = data.data;
      $scope.pageList = range(data.pages);
    });
  }

  fetch();

  angular.extend(this, {
    selectCategory: function(id) {
      $scope.currentCategory = id;
      setPage(1);
    },
    selectRubric: function(id) {
      $scope.currentRubric = id;
      setPage(1);
    },
    goto: function(index) {
      if(page !== index) {
        setPage(index);
      }
    },
    next: function() {
      if(page < $scope.pageList.length) {
        setPage(++page);

      }
    },
    prev: function() {
      if(page) {
        setPage(--page);
      }
    },
    data: $state.$current.data
  });
}

RecipeListCtlr.$inject = ['$scope', '$injector'];

function NewRecipeItemCtrl($scope, $injector) {
  var $state = $injector.get('$state'),
      data = $state.$current.data,
      Recipe = $injector.get('Recipe'),
      Product = $injector.get('Product');

  $scope.item = {
    ingredients: []
  };

  function emptyIngredient() {
    $scope.ingredient = {};
    $scope.ingredient.product = $scope.products[0];
  }

  function go() {
    $state.go(data.root + '.list');
  }

  Product.active().$promise.then(function(data){
    $scope.products = data;
    emptyIngredient();
  });


  angular.extend(this, {
    data: data,
    save: function() {
      Recipe.upsert($scope.item).$promise.then(go);
    },

    list: go,

    addIngredient: function() {
      var ingredient = $scope.ingredient,
          product = ingredient.product;

      delete ingredient.product;
      ingredient.product = product.id;
      ingredient.caption = product.caption;
      if(!ingredient.txt) {
        ingredient.txt = ingredient.val + ' г.';
      }

      $scope.item.ingredients.push(ingredient);
      emptyIngredient();
    }
  });


}

NewRecipeItemCtrl.$inject = ['$scope', '$injector'];

angular.module('recipe', ['lbServices', 'crud'])
  .controller('RecipeListCtrl', RecipeListCtlr)
  .controller('NewRecipeItemCtrl', NewRecipeItemCtrl)
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
      controller: 'NewRecipeItemCtrl as ctrl'
    })
    .state('recipies.new', {
      url: '/new',
      templateUrl: 'src/recipe/item.html',
      controller: 'NewRecipeItemCtrl as ctrl'
    });
  }]);
