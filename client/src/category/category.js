/*global angular*/
angular.module('category', ['lbServices', 'crud'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('categories', {
      url: '/categories',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Category',
        title: 'Категории',
        root: 'categories'
      }
    })
    .state('categories.list', {
      url: '',
      templateUrl: 'src/utils/list.html',
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('categories.item', {
      url: '/:id',
      templateUrl: 'src/utils/item.html',
      controller: 'ItemCtrl as ctrl'
    });

  }]);
