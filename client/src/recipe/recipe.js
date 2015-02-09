/*global angular*/
'use strict';

function round(val, to) {
  to = typeof to === 'number' ? to : 2;
  to = Math.pow(10, to);
  return Math.round(val*to) / to;
}

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
      setPage(1);
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
    }, filter = {where: {}, fields: {ingredients: false, images: false}};

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
      $scope.currentCategory = $scope.currentCategory === id ? 0 : id;
      setPage(1);
    },
    selectRubric: function(id) {
      $scope.currentRubric = $scope.currentRubric === id ? 0 : id;
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
      Tag = $injector.get('Tag'),
      productsCache = {},
      selectedRubrics = {},
      selectedTags = {},
      instance = this;

  $scope.rubrics = [];
  $scope.categories = [];
  $scope.selectedRubrics = selectedRubrics;
  $scope.selectedTags = selectedTags;


  function emptyIngredient() {
    $scope.ingredient = {};
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

  Tag.active().$promise.then(function(items) {
    $scope.tags = items;
  });

  function ingredientTitle(ingredient) {
    return ingredient.caption + ' ' + ingredient.val + ' г.';
  }

  angular.extend(instance, {
    data: data,
    /**
     * Grouping function for product list.
     */
    groupProducts: function(product) {
      return product.category? product.category.caption : 'Без категории';
    },
    save: function() {
      Recipe.upsert($scope.item)
        .$promise
        .then(instance.afterSave.bind(instance));
    },

    afterSave: function(data) {
      $injector.get('$state').go('recipies.item', {id: data.id});
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

    moveIngredientUp: function(index) {
      var item, ingredients;
      if(index > 0) {
        ingredients = $scope.item.ingredients;
        item = ingredients[index];
        ingredients[index] = ingredients[index - 1];
        ingredients[index - 1] = item;
      }
    },
    moveIngredientDown: function(index) {
      var item, ingredients = $scope.item.ingredients;
      if(index < ingredients.length - 1) {
        item = ingredients[index];
        ingredients[index] = ingredients[index + 1];
        ingredients[index + 1] = item;
      }
    },

    isTagSelected: function(tag) {
      return selectedTags[tag.id];
    },

    makeRecipe: function(item) {
      var portionWeight;
      if(item.rubrics) {
        item.rubrics.forEach(function(rubric) {
          selectedRubrics[rubric.id] = true;
        });
      }
      if(item.category && item.category.portionWeight !== item.portionWeight) {
        portionWeight = item.portionWeight;
      }
      if(item.tags) {
        item.tags.forEach(function(tag) {
          selectedTags[tag.id] = true;
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
        tags: {
          enumerable: true,
          get: function() {
            var selected = selectedTags || {};
            return $scope.tags.filter(function(tag){
              return selected[tag.id];
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
        },
        weight: {
          enumerable: false,
          get: function() {
            return item.ingredients.reduce(function(acc, ingredient){
              return acc + ingredient.val;
            }, 0);
          }
        },

        portionWeight: {
          enumerable: true,
          get: function() {
            if(portionWeight) {
              return portionWeight;
            }
            if(this.category) {
              return this.category.portionWeight;
            }
            return 1;
          },
          set: function(val) {
            portionWeight = val;
          }
        },
        portions: {
          enumerable: true,
          get: function() {
            return round(this.weight / this.portionWeight, 0);
          }
        }
      });

      'calories|fats|proteins|carbs'.split('|').forEach(function(prop){
        var value = item[prop]; //original value
        Object.defineProperty(item, prop, {
          enumerable: true,
          get: function() {
            if($scope.item.isCalculationMagic) {
              //calculate magically
              var result = item.ingredients.reduce(function(acc, ingredient){
                var id = ingredient.product,
                    product = instance.productsCache[id];
                if(product) {
                  acc.weight += ingredient.val;
                  acc.val += ingredient.val*product[prop];
                }
                return acc;
              }, {weight: 0, val: 0});

              return round(result.val/result.weight) || 0;
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
      portions: 1,
      isCalculationMagic: true
    };

  instance.makeRecipe(item);

  $scope.item = item;

  angular.extend(instance, {
    title: 'Новый рецепт',
    isNew: true
  });

  return instance;
}

NewRecipeItemCtrl.$inject = ['$scope', '$injector'];

function EditRecipeItemCtrl($scope, $injector) {
  var instance = new RecipeItemCtrl($scope, $injector),
      Recipe = $injector.get('Recipe'),
      id = $injector.get('$state').params.id,
      FileUploader = $injector.get('FileUploader');


  Recipe.findById({id: id}).$promise.then(function(recipe){
    var category = recipe.category, uploader, images = recipe.images || [],
        container = 'api/containers/recipe_' + id;
    instance.makeRecipe(recipe);
    if(recipe.portions == null) {
      recipe.portions = 1;
    }
    if(category) {
      $scope.categoryId = category.id;
    }
    $scope.item = recipe;

    uploader = $scope.uploader = new FileUploader({
      url: container + '/upload',
      autoUpload: true
    });

    $scope.item.images = images;

    uploader.onSuccessItem = function(_, data){
      var file = data.result.files.file[0];
      images.push({
        name: file.name,
        type: file.type,
        src: container + '/download/' + file.name
      });

      if(images.length === 1) { //set first image to be main
        recipe.mainImg = file.name;
      }
    };

  });

  angular.extend(instance, {
    id: id,
    title: 'Редактирование рецепта',
    isNew: false,
    removeImage: function(img){
      var item = $scope.item,
          images = item.images,
          index = images.indexOf(img);

      if(index >= 0) {
        images.splice(index, 1);
        if(img.name === item.mainImg) {
          item.mainImg = undefined;

          if(images.length) { //set first as main
            item.mainImg = images[0].name;
          }

        }
      }

    },
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

angular.module('recipe', ['lbServices', 'crud', 'ui.select',
                          'angularFileUpload', 'html'])
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
