/*global angular*/
angular.module('rubric', ['lbServices'])
  .controller('RubricListCtrl', ['$scope', '$injector',
   function($scope, $injector) {
    var Collection = $injector.get('Rubric');

    $scope.list = [];
    function reload() {
      Collection.find().$promise.then(function(data) {
        $scope.list = data;
      });
    }

    reload();

    $scope.remove = function(id) {
      if(confirm('Вы действительно хотите удалить рубрику?')){
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
  .controller('RubricItemCtrl', ['$scope', '$injector',
   function($scope, $injector){
     var Collection = $injector.get('Rubric'),
         $state = $injector.get('$state'),
         id = $state.params.id;

     function reload() {
       Collection.findById({id: id}).$promise.then(function(item) {
         $scope.item = item;
       });
     }

     function go() {
       $state.go('rubrics.list');
     }

     reload();

     $scope.save = function() {
       Collection.upsert($scope.item).$promise.then(go);
     };

     $scope.remove = function() {
      if(confirm('Вы действительно хотите удалить рубрику?')){
        Collection.deleteById($scope.item).$promise.then(go);
      }
     };

  }])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
    .state('rubrics', {
      url: '/rubrics',
      abstract: true,
      template: '<div ui-view/>'
    })
    .state('rubrics.list', {
      url: '',
      templateUrl: 'src/rubric/list.html',
      controller: 'RubricListCtrl'
    })
    .state('rubrics.item', {
      url: '/:id',
      templateUrl: 'src/rubric/item.html',
      controller: 'RubricItemCtrl'
    });
  }]);
