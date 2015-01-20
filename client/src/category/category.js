/*global angular*/
angular.module('category', ['lbServices'])
  .controller('CategoryListCtrl', ['$scope', '$injector',
   function($scope, $injector) {
    var Collection = $injector.get('Category');

    $scope.list = [];
    function reload() {
      Collection.find({filter: {order: ['order ASC']}}).$promise.then(function(data) {
        $scope.list = data;
      });
    }

    reload();

    $scope.remove = function(id) {
      if(confirm('Вы действительно хотите удалить категорию?')){
        Collection.deleteById({id: id}).$promise.then(reload);
      }
    };

    $scope.item = {};
    $scope.add = function() {
      var data = $scope.item;
      if(data.order == null) {
        data.order = $scope.list.length;
      }
      Collection.create(data).$promise.then(function() {
        $scope.item = {};
        reload();
      });
    };
  }])
 .controller('CategoryItemCtrl', ['$scope', '$injector',
   function($scope, $injector){
     var Collection = $injector.get('Category'),
         $state = $injector.get('$state'),
         id = $state.params.id;

     function reload() {
       Collection.findById({id: id}).$promise.then(function(item) {
         $scope.item = item;
       });
     }

     reload();

     $scope.save = function() {
       Collection.upsert($scope.item).$promise.then(reload);
     };

     $scope.remove = function() {
      if(confirm('Вы действительно хотите удалить категорию?')){
        Collection.deleteById($scope.item).$promise.then(function() {
          $state.go('categories.list');
        });
      }
     };

  }])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('categories', {
      url: '/categories',
      abstract: true,
      template: '<div ui-view/>'
    })
    .state('categories.list', {
      url: '',
      templateUrl: 'src/category/list.html',
      controller: 'CategoryListCtrl'
    })
    .state('categories.item', {
      url: '/:id',
      templateUrl: 'src/category/item.html',
      controller: 'CategoryItemCtrl'
    });

  }]);
