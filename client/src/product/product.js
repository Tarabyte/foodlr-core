/*global angular*/
angular
  .module('product', ['crud'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('products', {
      url: '/products',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Product',
        title: 'Продукты',
        root: 'products'

      }
    })
    .state('products.list', {
      url: '',
      templateUrl: 'src/utils/list.html',
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('products.item', {
      url: '/:id',
      templateUrl: 'src/utils/item.html',
      controller: 'ItemCtrl as ctrl'
    });
  }]);
