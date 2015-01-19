/*global angular*/
angular
  .module('auth', ['ui.router', 'lbServices'])
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('login', {
          url: '/login',
          data: {
            unprotected: true
          },
          templateUrl: 'templates/auth/login.html',
          controller: 'LoginCtrl'
      });

  }])
  .controller('LoginCtrl', ['$scope', '$injector', function($scope, $injector) {
    var SessionService = $injector.get('SessionService'),
        $state = $injector.get('$state');

    $scope.user = {};
    $scope.signIn = function() {
      SessionService.signIn($scope.user)
      .then(function() {
        $scope.isLogged = SessionService.isLogged();
        $state.go('index');
      })
      .catch(function() {
        alert('ooops');
      });
    };

    $scope.signOut = function() {
      SessionService.signOut()
      .then(function() {
        $state.go('login');
      })
      .catch(function() {
        alert('ooops');
      });
    };
  }])
  .directive('isLogged', ['SessionService', function(SessionService) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var toggle = function() {
          element.toggle(SessionService.isLogged());
        };
        scope.$on('signInOut', toggle);
        toggle();
      }
    };
  }])
  .directive('isNotLogged', ['SessionService', function(SessionService) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var toggle = function() {
          element.toggle(!SessionService.isLogged());
        };
        scope.$on('signInOut', toggle);
        toggle();
      }
    };
  }])
  .service('SessionService', ['$injector', function($injector) {
    var authService = $injector.get('LoopBackAuth'),
        User = $injector.get('User'),
        $rootScope = $injector.get('$rootScope'),
        notify = function() {
          $rootScope.$broadcast('signInOut');
        };

    this.isLogged = function() {
      return authService.currentUserId !== null;
    };

    this.getCurrentUser = function() {
      return authService.currentUserData;
    };

    this.checkAccess = function(event, to) {
      var isAccessExists = false,
          $state = $injector.get('$state');

      isAccessExists = to.data && to.data.unprotected || this.isLogged();

      if(! isAccessExists) {
        event.preventDefault(); //nah
        $state.go('login');
      }
    };

    this.signIn = function(user) {
      return User.login(user).$promise.then(notify);
    };

    this.signOut = function() {
      return User.logout().$promise.then(notify);
    };

  }]);
