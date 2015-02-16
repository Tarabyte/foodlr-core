/*global angular*/
angular
  .module('product', ['crud', 'utils', 'ngSanitize', 'angularFileUpload'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('products', {
      url: '/products',
      abstract: true,
      templateUrl: 'src/product/tabs.html',
      data: {
        hideHeader: true
      }
    })
    .state('products.main', {
      url: '',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Product',
        title: 'Продукты',
        root: 'products.main'
      }
    })
    .state('products.main.list', {
      url: '',
      templateUrl: 'src/product/product.list.html',
      controller: 'ProductListCtrl as ctrl'
    })
    .state('products.main.item', {
      url: '/:id',
      templateUrl: 'src/product/product.item.html',
      controller: 'ProductItemCtrl as ctrl'
    })
    .state('products.categories', {
      url: '/categories',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'ProductCategory',
        title: 'Категории',
        root: 'products.categories'
      }
    })
    .state('products.categories.list', {
      url: '/list',
      templateUrl: 'src/product/category.list.html',
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('products.categories.item', {
      url: '/:id',
      templateUrl: 'src/utils/item.html',
      controller: 'ItemCtrl as ctrl'
    })
    .state('products.tags', {
      url: '/tags',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Tag',
        title: 'Ярлыки',
        root: 'products.tags'
      }
    })
    .state('products.tags.list', {
      url: '/list',
      templateUrl: 'src/utils/list.html',
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('products.tags.item', {
      url: '/:id',
      templateUrl: 'src/utils/item.html',
      controller: 'ItemCtrl as ctrl'
    })
    .state('products.nutrients', {
      url: '/nutrients',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Nutrient',
        title: 'Нутриенты',
        root: 'products.nutrients'
      }
    })
    .state('products.nutrients.list', {
      url: '/list',
      templateUrl: 'src/product/nutrient.list.html',
      controller: 'NutrientListCtrl as ctrl'
    })
    .state('products.nutrients.item', {
      url: '/:id',
      templateUrl: 'src/product/nutrient.item.html',
      controller: 'NutrientItemCtrl as ctrl'
    })
    .state('products.units', {
      url: '/units',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Unit',
        title: 'Единицы',
        root: 'products.units'
      }
    })
    .state('products.units.list', {
      url: '/list',
      templateUrl: 'src/product/unit.list.html',
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('products.units.item', {
      url: '/:id',
      templateUrl: 'src/product/unit.item.html',
      controller: 'ItemCtrl as ctrl'
    });
  }])
.controller('NutrientListCtrl', NutrientListCtrl)
.controller('NutrientItemCtrl', NutrientItemCtrl)
.controller('ProductItemCtrl', ProductItemCtrl)
.controller('ProductListCtrl', ProductListCtrl);


/**
 * Nutrient list controller.
 * Extends DefaultListCtrl.
 */
function NutrientListCtrl($scope, $injector) {
  var Unit = $injector.get('Unit'),
      $controller = $injector.get('$controller'),
      instance = $controller('DefaultListCtrl', {
        $scope: $scope,
        $injector: $injector
      });


  function defaultUnit() {
    $scope.item.unit = $scope.units[0];
  }

  $scope.units = [];
  Unit.active().$promise.then(function(data) {
    $scope.units = data;
    defaultUnit();
  });

  instance.postsave = defaultUnit;

  return instance;
}
NutrientListCtrl.$inject = ['$scope', '$injector'];

/**
 * Nutrient item controller.
 * Extends ItemCtrl
 */
function NutrientItemCtrl($scope, $injector) {
  var Unit = $injector.get('Unit'),
      $controller = $injector.get('$controller'),
      instance = $controller('ItemCtrl', {
        $scope: $scope,
        $injector: $injector
      });

  $scope.units = [];
  Unit.active().$promise.then(function(data) {
    $scope.units = data.map(function(item) {
      return item.toJSON();
    });
  });


  return instance;
}

NutrientItemCtrl.$inject = ['$scope', '$injector'];

/**
 * Product Item Controller
 * Extend ItemCtrl
 */
function ProductItemCtrl($scope, $injector) {
  var Nutrient = $injector.get('Nutrient'),
      ProductCategory = $injector.get('ProductCategory'),
      Tag = $injector.get('Tag'),
      selectedTags = {},
      $controller = $injector.get('$controller'),
      instance = $controller('ItemCtrl', {
        $scope: $scope,
        $injector: $injector
      }),
      FileUploader = $injector.get('FileUploader');

  ProductCategory.active().$promise.then(function(items) {
    $scope.categories = items;
  });

  $scope.categoryId = null;
  $scope.selectedTags = selectedTags;

  Tag.active().$promise.then(function(tags) {
    $scope.tags = tags;
  });


  $scope.item.then(function() {
    var item = $scope.item,
        uploader, images = item.images || [],
        container = 'api/containers/product_' + item.id,
        tags = item.tags;

    if(tags && tags.length) {
      tags.forEach(function(tag) {
        selectedTags[tag.id] = true;
      });
    }

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
    };

    $scope.categoryId = $scope.item.category && $scope.item.category.id;
    Object.defineProperties($scope.item, {
      category: {
        enumerable: true,
        get: function() {
          return $scope.categories.filter(function(category){
            return category.id === $scope.categoryId;
          })[0];
        }
      },
      tags: {
        enumerable: true,
        get: function() {
          var selected = $scope.selectedTags || {};
          return $scope.tags.filter(function(tag) {
            return selected[tag.id];
          });
        }
      }
    });

    Nutrient.active().$promise.then(function(nutrients) {
      var fulfilled = $scope.item.nutrients,
          byId = fulfilled ? fulfilled.reduce(function(acc, item){
            acc[item.id] = item;
            return acc;
          }, {}) : {};

      $scope.item.nutrients = nutrients.map(function(nutrient) {
        var fulfilled = byId[nutrient.id],
            data = {
              id: nutrient.id,
              caption: nutrient.caption,
              unit: nutrient.unit.abbreviation
            };

        if(fulfilled) {
          data.value = fulfilled.value;
        }

        return data;
      });
    });
  });

  angular.extend(instance, {
    removeImage: function(img) {
       var item = $scope.item,
          images = item.images,
          index = images.indexOf(img);

      if(index >= 0) {
        images.splice(index, 1);
      }
    },
    postsave: angular.noop,
    isTagSelected: function(tag) {
      return $scope.selectedTags[tag.id];
    }
  });

  return instance;
}
ProductItemCtrl.$inject = ['$scope', '$injector'];

/**
 * Product List Controller
 */
function ProductListCtrl($scope, $injector) {
    var $state = $injector.get('$state'),
      Collection = $injector.get('Product'),
      RangeService = $injector.get('RangeService'),
      ToggleService = $injector.get('ToggleService'),
      ReorderService = $injector.get('ReorderService'),
      page = 1,
      size = 10,
      pageList = [];

  Object.defineProperties($scope, {
    pageList: {
      enumerable: true,
      get: function() {
        return pageList;
      },
      set: function(data) {
        pageList = RangeService.range(this.page, data.pages);
      }
    },
    page: {
      enumerable: true,
      get: function() {
        return page;
      },
      set: function(val) {
        if(val > 0 && val <= this.pageList.length) {
          page = val;
          fetch();
        }
      }
    },
    item: {
      enumerable: true,
      value: {},
      writable: true
    }
  });

  function fetch() {
    var options = {
      page: page - 1,
      size: size
    },
    filter = {
      where: {},
      fields: {
        images: false
      }
    };

    options.filter = filter;

    Collection.paginate(options).$promise.then(function(data) {
      $scope.list = data.data;
      $scope.pageList = data;
    });
  }

  function first() {
    $scope.page = 1;
  }

  fetch();

  ReorderService.reordify(this, $scope);
  ToggleService.togglify(this, $scope);

  angular.extend(this, {
    $Collection: Collection,
    data: $state.$current.data,
    remove: function(id) {
      if(confirm('Вы действительно хотите удалить продукт?')) {
        Collection.deleteById({id: id}).$promise.then(first);
      }
    },

    save: function() {
      Collection.count().$promise.then(function(data) {
        $scope.item.order = data.count;
        Collection.upsert($scope.item).$promise.then(function(item) {
          var id = item.id;
          $state.go($state.$current.data.root + '.item', {id: id});
        });
      });
    }
  });
}
ProductListCtrl.$inject = ['$scope', '$injector'];
