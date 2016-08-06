define(['angular', 'lbServices', '../utils/crud'], function(angular){
  angular.module('cuisine', ['lbServices', 'crud'])
    .config(['$stateProvider', function($stateProvider) {
      $stateProvider
      .state('cuisines', {
        url: '/cuisines',
        abstract: true,
        template: '<div ui-view/>',
        data: {
          collection: 'Cuisine',
          title: 'Кухни',
          root: 'cuisines'
        }
      })
      .state('cuisines.list', {
        url: '',
        templateUrl: 'src/cuisine/list.html',
        controller: 'DefaultListCtrl as ctrl'
      })
      .state('cuisines.item', {
        url: '/:id',
        templateUrl: 'src/cuisine/item.html',
        controller: 'ItemCtrl as ctrl'
      });

    }]);
});
