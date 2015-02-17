define(['angular', 'lbServices', '../utils/crud'], function(angular){
  angular.module('rubric', ['lbServices', 'crud'])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
      .state('rubrics', {
        url: '/rubrics',
        abstract: true,
        template: '<div ui-view/>',
        data: {
          collection: 'Rubric',
          title: 'Рубрики',
          root: 'rubrics'
        }
      })
      .state('rubrics.list', {
        url: '',
        templateUrl: 'src/utils/list.html',
        controller: 'DefaultListCtrl as ctrl'
      })
      .state('rubrics.item', {
        url: '/:id',
        templateUrl: 'src/utils/item.html',
        controller: 'ItemCtrl as ctrl'
      });
    }]);
});
