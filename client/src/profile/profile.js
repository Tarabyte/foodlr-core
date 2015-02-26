/*global define*/
define(['angular', 'lbServices', '../utils/crud'], function(angular) {
  angular.module('profile', ['lbServices', 'crud'])
    .config(['$stateProvider', function($stateProvider) {
      $stateProvider
      .state('profiles', {
        url: '/profiles',
        abstract: true,
        template: '<div ui-view/>',
        data: {
          title: 'Подписки',
          collection: 'Subscription',
          root: 'profiles',
          readonly: true
        }
      })
      .state('profiles.subscriptions', {
        url: '',
        controller: 'DefaultListCtrl as ctrl',
        templateUrl: 'src/profile/list.html'
      });
    }]);
});
