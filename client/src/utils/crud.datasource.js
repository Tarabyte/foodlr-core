/*global angular*/

angular.module('crudDatasource', [])
  .directive('datasource', datasource)
  .directive('pager', pager);

/**
 * Pageable and filterable remode data source.
 */
function datasource() {
  return {
    restrict: 'EA',
    transclude: true,
    template: '<div ng-transclude/>',
    scope: {
      collection: '@',
      fetched: '&onFetch'
    },
    controller: ['$scope', '$attrs', '$injector',  function($scope, $attrs, $injector) {
      angular.extend(this, {
        get collection() {
          return $injector.get($scope.collection);
        },

        fetch: function() {
          this.collection.find().$promise.then(function(data) {
            console.log(data);
          });
        }
      });
    }],
    controllerAs: 'datasource',
    link: function($scope, element, attrs, controller) {
      controller.fetch();
    }
  };
}


/**
 * Pager to work with data source
 */
function pager() {
  return {
    restrict: 'EA',
    template: 'Ama pager',
    require: '^datasource',
    controller: ['$scope', '$injector', function($scope, $injector) {
      console.log($scope, $injector);
    }],
    link: function($scope, element, attrs, controller) {
      var ds = controller;
      console.log('ds controller:',  ds);
    }
  };
}
