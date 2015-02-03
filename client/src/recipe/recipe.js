/*global angular*/
'use strict';

function RecipeListCtlr($scope, $injector) {
  var Recipe = $injector.get('Recipe'),
      Rubric = $injector.get('Rubric'),
      Category = $injector.get('Category'),
      $state = $injector.get('$state'),
      page = 1, size = 10, search = "";


  $scope.currentCategory = 0;
  $scope.currentRubric = 0;

  Object.defineProperty($scope, 'search', {
    enumerable: true,
    get: function() {
      return search;
    },
    set: function(val) {
      search = val;
      fetch();
    }
  });

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

    options.filter = filter;

    if($scope.currentCategory) {

      filter.where['category.id'] =$scope.currentCategory;
    }
    if($scope.currentRubric) {
      filter.where['rubrics.id'] = $scope.currentRubric;
    }
    if(search) {
      var tokens = search.split(' ').filter(Boolean);
      if(tokens.length > 1) { //fulltext mode
        filter.where.$text = {search: search};
      }
      else {
        filter.where.or = [
          {caption: {like: search}},
          {content: {like: search}}
        ];
      }
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
    remove: function(id) {
      if(confirm('Вы действительно хотите удалить рецепт?')) {
        Recipe.removeById({id: id}).$promise.then(function(){
          fetch();
        });
      }
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
    data: $state.$current.data,
    /**
     * Toggle Active state
     */
    toggle: function(id) {
      var item = $scope.items.filter(function(item){
        return item.id === id;
      })[0];
      if(item) {
        Recipe.toggle({id: id}).$promise.then(function() {
          item.active = !item.active;
        });
      }
    }
  });
}

RecipeListCtlr.$inject = ['$scope', '$injector'];

function RecipeItemCtrl($scope, $injector) {
  var $state = $injector.get('$state'),
      data = $state.$current.data,
      Recipe = $injector.get('Recipe'),
      Product = $injector.get('Product'),
      Category = $injector.get('Category'),
      Rubric = $injector.get('Rubric'),
      productsCache = {},
      selectedRubrics = {},
      instance = this;


  $scope.isCalculationMagic = true;
  $scope.rubrics = [];
  $scope.categories = [];
  $scope.selectedRubrics = selectedRubrics;


  function emptyIngredient() {
    $scope.ingredient = {};
    $scope.ingredient.product = $scope.products[0];
  }

  function go() {
    $state.go(data.root + '.list');
  }

  Product.active().$promise.then(function(data){
    $scope.products = data;
    data.reduce(function(acc, product){
      acc[product.id] = product;
      return acc;
    }, productsCache);
    emptyIngredient();
  });

  Category.active().$promise.then(function(data) {
    $scope.categories = data;
  });

  Rubric.active().$promise.then(function(data) {
    $scope.rubrics = data;
  });

  function ingredientTitle(ingredient) {
    return ingredient.caption + ' ' + ingredient.val + ' г.';
  }

  angular.extend(instance, {
    data: data,
    save: function() {
      Recipe.upsert($scope.item).$promise.then(go);
    },

    list: go,
    productsCache: productsCache,

    isSelected: function(rubric) {
      return !!selectedRubrics[rubric.id];
    },

    addIngredient: function() {
      var ingredient = $scope.ingredient,
          product = ingredient.product;

      delete ingredient.product;
      ingredient.product = product.id;
      ingredient.caption = product.caption;
      if(!ingredient.txt) {
        ingredient.txt = ingredientTitle(ingredient);
      }

      $scope.item.ingredients.push(ingredient);
      emptyIngredient();
    },

    removeIngredient: function(index) {
      $scope.item.ingredients.splice(index, 1);
    },

    recalculateIngredientText: function(index) {
      var item = $scope.item.ingredients[index];
      item.txt = ingredientTitle(item);
    },

    makeRecipe: function(item) {
      if(item.rubrics) {
        item.rubrics.forEach(function(rubric) {
          selectedRubrics[rubric.id] = true;
        });
      }
      Object.defineProperties(item, {
        rubrics: {
          enumerable: true,
          get: function() {
            var selected = selectedRubrics || {};
            return $scope.rubrics.filter(function(rubric){
              return selected[rubric.id];
            });
          }
        },
        category: {
          enumerable: true,
          get: function() {
            var id = $scope.categoryId;
            return $scope.categories.filter(function(item) {
              return item.id === id;
            })[0];
          }
        }
      });

      'calories|fats|proteins|carbs'.split('|').forEach(function(prop){
        var value = 0;
        Object.defineProperty(item, prop, {
          enumerable: true,
          get: function() {
            if($scope.isCalculationMagic) {
              //calculate magically
              return item.ingredients.reduce(function(acc, ingredient){
                var id = ingredient.product,
                    product = instance.productsCache[id];
                if(product) {
                  acc += ingredient.val*product[prop]/100; //assuming for 100 g
                }
                return acc;
              }, 0);
            }
            else {
              return value;
            }

          },
          set: function(val) {
            value = val;
          }
        });
      });
    }
  });
}

function NewRecipeItemCtrl($scope, $injector) {
  var instance = new RecipeItemCtrl($scope, $injector);
  var item = {
      ingredients: [],
      portions: 1
    };

  instance.makeRecipe(item);

  $scope.item = item;

  angular.extend(instance, {
    title: 'Новый рецепт',
    isNew: false
  });

  return instance;
}

NewRecipeItemCtrl.$inject = ['$scope', '$injector'];

function EditRecipeItemCtrl($scope, $injector) {
  var instance = new RecipeItemCtrl($scope, $injector),
      Recipe = $injector.get('Recipe'),
      id = $injector.get('$state').params.id;

  Recipe.findById({id: id}).$promise.then(function(recipe){
    var category = recipe.category;
    instance.makeRecipe(recipe);
    if(recipe.portions == null) {
      recipe.portions = 1;
    }
    if(category) {
      $scope.categoryId = category.id;
    }
    $scope.item = recipe;
  });

  angular.extend(instance, {
    id: id,
    title: 'Редактирование рецепта',
    remove: function() {
      if(confirm('Вы действительно хотите удалить рецепт?')) {
        Recipe.removeById($scope.item).$promise.then(function(){
          instance.list();
        });
      }
    }
  });

  return instance;
}

EditRecipeItemCtrl.$inject = ['$scope', '$injector'];

angular.module('recipe', ['lbServices', 'crud'])
  .controller('RecipeListCtrl', RecipeListCtlr)
  .controller('NewRecipeItemCtrl', NewRecipeItemCtrl)
  .controller('EditRecipeItemCtrl', EditRecipeItemCtrl)
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
    .state('recipies.new', {
      url: '/new',
      templateUrl: 'src/recipe/item.html',
      controller: 'NewRecipeItemCtrl as ctrl'
    })
    .state('recipies.item', {
      url: '/:id',
      templateUrl: 'src/recipe/item.html',
      controller: 'EditRecipeItemCtrl as ctrl'
    });
  }]);
