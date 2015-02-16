define(['angular', 'growl'], function(angular){
  'use strict';
  var crud = angular.module('crud', ['angular-growl']),
      extend = angular.extend;

  /**
   * Simple prototype inheritance.
   */
  function inherit(child, base) {
    child.prototype = Object.create(base.prototype);
    extend(child, base);
  }

  /**
   * Controllers register.
   */
  crud
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider
        .interceptors
        .push(['$q', 'growl', function($q, growl) {
          return  {
            responseError: function(rejection) {
              if(rejection.status === 422) {
                growl.error('Ошибка при сохранении.', {ttl: 10000});
              }

              return $q.reject(rejection);
            },

            response: function(response) {
              if(response && response.config.method === 'PUT') {
                growl.success('Сохранение прошло успешно.', {ttl: 2000});
              }
              return response;
            }
          };
        }]);
    }])
    .controller('ListCtrl', ListCtrl)
    .controller('DefaultListCtrl', DefaultListCtrl)
    .controller('ItemCtrl', ItemCtrl)
    .service('ReorderService', function() {
      this.reordify = function(instance, $scope) {
        function lookup(id, shift) {
          var list = $scope.list,
              a, b, index;

          list.forEach(function(item, i) {
            if(item.id === id) {
              a = item;
              index = i;
              b = list[i + shift];
            }
          });

          return {a: a, index: index, b: b, all: list};
        }

        angular.extend(instance, {
          up: function(id) {
            var data = lookup(id, -1),
                a = data.a, b = data.b, index = data.index, all = data.all;
            if(a && b) {
              this.$Collection.swap({a: a.id, b: b.id}).$promise.then(function(){
                var tmp = a.order;
                a.order = b.order;
                b.order = tmp;
                all[index] = b;
                all[index - 1] = a;

              });
            }
          },

          down: function(id) {
            var data = lookup(id, 1),
                a = data.a, b = data.b, index = data.index, all = data.all;
            if(a && b) {
              this.$Collection.swap({a: a.id, b: b.id}).$promise.then(function(){
                var tmp = a.order;
                a.order = b.order;
                b.order = tmp;
                all[index] = b;
                all[index + 1] = a;
              });
            }
          }
        });
      };

    })
    .service('ToggleService', function() {
      this.togglify = function(instance, $scope) {
        if(!instance.lookup) {
          instance.lookup = function(id) {
            return $scope.list.filter(function(item) {
              return item.id === id;
            })[0];
          }
        }
        if(!instance.toggle) {
          instance.toggle = function(id) {
            var item = this.lookup(id);
            if(item) {
              this.$Collection.toggle({id: item.id}).$promise.then(function() {
                item.active = !item.active;
              })
            }
          }
        }
      }
    })
    .directive('actions', function() {
      return {
        restrict: 'AE',
        templateUrl: 'src/utils/actions.html'
      }

    });



  /**
   * Generic list controller.
   */
  function ListCtrl($scope, $injector) {
    var $state = $injector.get('$state'),
        data = $state.$current.data,
        Collection = $injector.get(data.collection),
        ReorderService = $injector.get('ReorderService'),
        ToggleService = $injector.get('ToggleService');

    $scope.list = []; //current items
    $scope.item = {}; //editable

    function fetch() { //load data
      Collection.find().$promise.then(function(data) {
        $scope.list = data;
      });
    }

    function clean() {
      $scope.item = {};
    }

    fetch();

    ReorderService.reordify(this, $scope);
    ToggleService.togglify(this, $scope);

    extend(this, {
      $Collection: Collection,
      clear: clean,
      reload: fetch,
      data: data,
      presave: function(item) {
        return item;
      },
      postsave: angular.noop,
      save: function() {
        var me = this,
            item = me.presave($scope.item);
        Collection.save(item).$promise.then(function() {
          clean();
          fetch();
          me.postsave();
        });
      },
      remove: function(id) {
        if(confirm('Вы действительно хотите удалить объект?')) {
          Collection.deleteById({id: id}).$promise.then(fetch);
        }
      }
    });

  }

  ListCtrl.$inject = ['$scope', '$injector'];

  /**
   * Simple default list controller for dictionaries.
   * * Supports toggle method.
   * * Supports set order before save.
   */
  function DefaultListCtrl($scope) {
    ListCtrl.apply(this, arguments);
    extend(this, {
      /**
       * Add order based on current items count.
       */
      presave: function(item) {
        if(item.order == null) {
          item.order = $scope.list.length;
        }
        return item;
      }
    });
  }

  inherit(DefaultListCtrl, ListCtrl);


  /**
   * Generic item controller.
   * Supports:
   * * #save with #presave hook
   * * #remove
   * * #list goes to parent.list property.
   * Goes to parent.list state after both operations.
   */
  function ItemCtrl($scope, $injector) {
    var $state = $injector.get('$state'),
        id = $state.params.id,
        exists = !!id,
        data = $state.$current.data,
        Collection = $injector.get(data.collection),
        list = data.root + '.list';

    function fetch() {
      $scope.item = Collection.findById({id: id}).$promise.then(function(data) {
        $scope.item = data;
      });
    }

    function go() {
      $state.go(list);
    }

    if(exists) {
      fetch();
    }
    else {
      $scope.item = {};
    }

    extend(this, {
      $Collection: Collection,
      data: data,
      /**
       * Hookup for presave logic.
       */
      presave: function(item) {
        return item;
      },

      /**
       * Saves item to the backend.
       */
      save: function() {
        var item = this.presave($scope.item);
        Collection.upsert(item).$promise.then(this.postsave.bind(this));
      },

      postsave: go,

      /**
       * Remove item from the backend.
       */
      remove: function() {
        if(exists && confirm('Вы действительно хотите удалить объект?')) {
          Collection.removeById($scope.item).$promise.then(go);
        }
      },

      /**
       * Goes to parent.list property.
       */
      list: go
    });
  }

  ItemCtrl.$inject = ['$scope', '$injector'];

});
