/*global angular*/
angular.module('category', ['lbServices'])
  .controller('CategoryListCtrl', ['$scope', '$injector',
   function($scope, $injector) {
    var Collection = $injector.get('Category');

    $scope.list = [];
    function reload() {
      Collection.find().$promise.then(function(data) {
        $scope.list = data;
      });
    }

    reload();

    $scope.remove = function(id) {
      if(confirm('Вы действительно хотите удалить категорию?')){
        Collection.deleteById({id: id}).$promise.then(reload);
      }
    };

    $scope.toggle = function(id) {
      var item = $scope.list.filter(function(item){
        return item.id === id
      })[0];
      Collection.toggle(item).$promise.then(function() {
        item.active = !item.active;
      });
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

     function go() {
       $state.go('categories.list');
     }

     reload();

     $scope.save = function() {
       Collection.upsert($scope.item).$promise.then(go);
     };

     $scope.remove = function() {
      if(confirm('Вы действительно хотите удалить категорию?')){
        Collection.deleteById($scope.item).$promise.then(go);
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
