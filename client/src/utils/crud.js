/*global angular*/
'use strict';
var crud = angular.module('crud', []),
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
  .controller('ListCtrl', ListCtrl)
  .controller('DefaultListCtrl', DefaultListCtrl)
  .controller('ItemCtrl', ItemCtrl);



/**
 * Generic list controller.
 */
function ListCtrl($scope, $injector) {
  var $state = $injector.get('$state'),
      data = $state.$current.data,
      Collection = $injector.get(data.collection);

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

  extend(this, {
    $Collection: Collection,
    clear: clean,
    reload: fetch,
    data: data,
    presave: function(item) {
      return item;
    },
    save: function() {
      var item = this.presave($scope.item);
      Collection.save(item).$promise.then(function() {
        clean();
        fetch();
      });
    },
    remove: function(id) {
      if(confirm('Вы действительно хотите удалить объект?')) {
        Collection.deleteById({id: id}).$promise.then(fetch);
      }
    },

    lookup: function(id) {
      return $scope.list.filter(function(item) {
        return item.id === id;
      })[0];
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
     * Toggle item active flag.
     */
    toggle: function(id) {
      var item = this.lookup(id);
      if(item) {
        this.$Collection.toggle(item).$promise.then(function() {
          item.active = !item.active;
        });
      }
    },
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
    Collection.findById({id: id}).$promise.then(function(data) {
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
      Collection.upsert(item).$promise.then(go);
    },

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
