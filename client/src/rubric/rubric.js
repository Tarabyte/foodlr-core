/*global angular*/
angular.module('rubric', ['lbServices'])
  .controller('RubricListCtrl', ['$scope', '$injector',
   function($scope, $injector) {
    var Rubric = $injector.get('Rubric');

    $scope.rubrics = [];
    function reload() {
      Rubric.find({filter: {order: ['order ASC']}}).$promise.then(function(data) {
        $scope.rubrics = data;
      });
    }

    reload();

    $scope.remove = function(id) {
      if(confirm('Вы действительно хотите удалить рубрику?')){
        Rubric.deleteById({id: id}).$promise.then(reload);
      }
    };

    $scope.rubric = {};
    $scope.add = function() {
      var data = $scope.rubric;
      if(data.order == null) {
        data.order = $scope.rubrics.length;
      }
      Rubric.create(data).$promise.then(function() {
        $scope.rubric = {};
        reload();
      });
    };
  }])
  .controller('RubricItemCtrl', ['$scope', '$injector',
   function($scope, $injector){
     var Rubric = $injector.get('Rubric'),
         $state = $injector.get('$state'),
         id = $state.params.rubricId;

     function reload() {
       Rubric.findById({id: id}).$promise.then(function(item) {
         $scope.rubric = item;
       });
     }

     reload();

     $scope.save = function() {
       Rubric.upsert($scope.rubric).$promise.then(reload);
     };

     $scope.remove = function() {
      if(confirm('Вы действительно хотите удалить рубрику?')){
        Rubric.deleteById($scope.rubric).$promise.then(function() {
          $state.go('rubrics.list');
        });
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
      url: '/:rubricId',
      templateUrl: 'src/rubric/item.html',
      controller: 'RubricItemCtrl'
    });
  }]);
