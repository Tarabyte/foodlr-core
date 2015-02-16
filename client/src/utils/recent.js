define(['angular'], function(angular){
  var tmpl, tmpls = {};
  angular.module('recent', [])
    .run(['$interpolate', function($interpolate){
      tmpl = $interpolate;
    }])
    .directive('recent', RecentDirective);

  function RecentDirective($injector) {
    return {
      restrict: 'E',
      scope: {
        collection: "@",
        columns: "=",
        root: '@',
        fields: "="
      },
      templateUrl: 'src/utils/recent.html',
      controller: RecentDirectiveCtrl,
      controllerAs: 'ctrl'
    };
  }

  RecentDirective.$inject = ['$injector'];

  function Column(data) {
    angular.extend(this, data);
    this.init();
  }

  Column.prototype.init = function() {
    this.tmpl = tmpl(tmpls[this.tmpl] || this.tmpl);
  };

  Column.prototype.renderFn = function(item, $scope) {
    return this.tmpl({
      item: item,
      $scope: $scope
    });
  };

  tmpls.link = '<a href="#/{{$scope.root}}/{{item.id}}">{{item.caption}}</a>';
  tmpls.categoryLabel =
    '<span class="label label-info">' +
    '{{item.category.caption}}</span>';

  function RecentDirectiveCtrl($scope, $injector) {
    var Collection = $injector.get($scope.collection),
        columns = $scope.columns,
        fields = $scope.fields || {};

    if(!columns) {
      columns = [
        {
          caption: 'Название',
          tmpl: 'link'
        }
      ];
    }

    $scope.columnDefs = columns.map(function(column){
      return new Column(column);
    });


    Collection.recent({filter: {fields: fields}}).$promise.then(function(data) {
      $scope.items = data;
    });

    angular.extend(this, {
      Collection: Collection,

    });
  }

  RecentDirectiveCtrl.$inject = ['$scope', '$injector'];
});
