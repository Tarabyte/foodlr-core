define(['angular','ui.router', 'lbServices', 'ngMessages', 'dropdown'], function(angular){
  angular
    .module('auth', ['ui.router', 'lbServices', 'ngMessages'])
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider
        .interceptors
        .push(['$q', '$injector', function($q, $injector) {
          return {
            responseError: function(rejection) {
              var status = rejection.status,
                  SessionService;
              if(status === 401 || status === 403) {
                SessionService = $injector.get('SessionService');
                SessionService.clear();
                SessionService.toLogin();
                return;
              }

              return $q.reject(rejection);
            }
          };
        }]);
    }])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
        .state('login', {
          url: '/login',
          data: {
            unprotected: true
          },
          templateUrl: 'src/auth/login.html',
          controller: 'LoginCtrl'
        })
        .state('profile', {
          url: '/profile',
          templateUrl: 'src/auth/profile.html',
          controller: 'ProfileCtrl as ctrl'
        });

    }])
    .controller('ProfileCtrl', ['$scope', '$injector', function($scope, $injector){
      var SessionService = $injector.get('SessionService'),
          user = SessionService.getCurrentUser(),
          growl = $injector.get('growl');

      if(user == null) {
        SessionService.loadUser().then(function(data) {
          $scope.user = user = data.user||data;
        });
      }
      else {
        $scope.user = user;
      }

      angular.extend(this, {
        data: {
          title: 'Настройка профиля'
        },
        changePassword: {},
        changePwd: function(valid) {
          if(!valid) {
            return;
          }
          SessionService.changePassword(this.changePassword)
          .then(function() {
            growl.info('Пароль сменен.', {ttl: 2000});
          })
          .catch(function() {
            growl.error('Ошибка при смене пароля', {ttl: 5000});
          });
        }

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
    .directive('equalsTo', function() {
      return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
          equalsTo: '='
        },
        link: function(scope, element, atts, ngModel) {
          if(!ngModel) {
            return;
          }

          ngModel.$validators.equalsTo = function(modelValue, viewValue) {
            return  (modelValue || viewValue) === scope.equalsTo;
          };

          scope.$watch('equalsTo', function() { //if another value changed.
            ngModel.$validate();
          });
        }
      };
    })
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
    .directive('logout', ['SessionService', '$compile', function(SessionService, $compile) {
      var tmpl = $compile('<a href="#/login" ng-click="logout()"><fa icon="sign-out"/> Выйти</a>');
      return {
        restrict: 'E',
        scope: true,
        controller: ['$scope', function($scope) {
          $scope.logout = SessionService.signOut.bind(SessionService);
        }],
        link: function(scope, element) {
          element.replaceWith(tmpl(scope));
        }
      };
    }])
    .directive('avatar', ['SessionService', function(SessionService) {
      return {
        restrict: 'E',
        scope: true,
        template: '<span class="small">Привет,</span> {{user.username}}',
        link: function(scope) {
          function loadUser() {
            SessionService.loadUser().then(function(user) {
              scope.user = user;
            });
          }

          scope.$on('signInOut', loadUser);
          loadUser();
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

      this.clear = function() {
        authService.clearUser();
        authService.clearStorage();
      };

      this.loadUser = function() {
        return User.getCurrent().$promise;
      };

      this.changePassword = function(data) {
        return User.changePassword({id: authService.currentUserId, data: data})
          .$promise;
      };

      this.checkAccess = function(event, to) {
        var isAccessExists = false,
            $state = $injector.get('$state');

        isAccessExists = to.data && to.data.unprotected || this.isLogged();

        if(!isAccessExists) {
          event.preventDefault(); //nah
          $state.go('login');
        }
      };

      this.toLogin = function() {
        return $injector.get('$state').go('login');
      };

      this.signIn = function(user) {
        return User.login(user).$promise.then(notify);
      };

      this.signOut = function() {
        return User.logout().$promise.then(notify);
      };

    }]);
});
