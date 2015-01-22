/*global angular*/
angular
  .module('nutrient', ['crud'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('nutrients', {
      url: '/nutrients',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Nutrient',
        title: 'Нутриеты',
        root: 'nutrients'

      }
    })
    .state('nutrients.list', {
      url: '',
      templateUrl: 'src/utils/list.html',
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('nutrients.item', {
      url: '/:id',
      templateUrl: 'src/utils/item.html',
      controller: 'ItemCtrl as ctrl'
    });
  }]);
