/*global angular*/
angular
  .module('product', ['crud'])
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
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('products.main.item', {
      url: '/:id',
      templateUrl: 'src/product/product.item.html',
      controller: 'ProductItemCtrl as ctrl'
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
.controller('ProductItemCtrl', ProductItemCtrl);


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
 * Extend DefaultListCtrl
 */
function ProductItemCtrl($scope, $injector) {
  var Nutrient = $injector.get('Nutrient'),
      $controller = $injector.get('$controller'),
      instance = $controller('ItemCtrl', {
        $scope: $scope,
        $injector: $injector
      });

  $scope.item.then(function() {
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

  return instance;
}
ProductItemCtrl.$inject = ['$scope', '$injector'];
