/*global angular*/
angular.module('faq', ['crud'])
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
    .state('faq', {
      url: '/faq',
      abstract: true,
      templateUrl: 'src/faq/tabs.html',
      data: {
        hideHeader: true
      }
    })
    .state('faq.main', {
      url: '',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Faq',
        title: 'Вопросы',
        root: 'faq.main'
      }
    })
    .state('faq.main.list', {
      url: '',
      templateUrl: 'src/faq/faq.list.html',
      controller: 'FaqListCtrl as ctrl'
    })
    .state('faq.main.new', {
      url: '/new',
      templateUrl: 'src/faq/faq.item.html',
      controller: 'NewFaqItemCtrl as ctrl'
    })
    .state('faq.main.item', {
      url: '/:id',
      templateUrl: 'src/faq/faq.item.html',
      controller: 'EditFaqItemCtrl as ctrl'
    })
    .state('faq.categories', {
      url: '/categories',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'FaqCategory',
        title: 'Категории',
        root: 'faq.categories'
      }
    })
    .state('faq.categories.list', {
      url: '/list',
      templateUrl: 'src/utils/list.html',
      controller: 'DefaultListCtrl as ctrl'
    })
    .state('faq.categories.item', {
      url: '/:id',
      templateUrl: 'src/utils/item.html',
      controller: 'ItemCtrl as ctrl'
    });
  }])
.controller('FaqListCtrl', FaqListCtrl)
.controller('NewFaqItemCtrl', NewFaqItemCtrl)
.controller('EditFaqItemCtrl', EditFaqItemCtrl);

/**
 * FaqListCtrl
 */

function FaqListCtrl($scope, $injector) {
  var $state = $injector.get('$state'),
      data = $state.$current.data,
      Collection = $injector.get(data.collection),
      Range = $injector.get('RangeService'),
      ToggleService = $injector.get('ToggleService'),
      ReorderService = $injector.get('ReorderService'),
      pageList = [],
      page = 1;

  Object.defineProperties($scope, {
    page: {
      enumerable: true,
      get: function() {
        return page;
      },
      set: function(val) {
        if(val > 0 && val <= pageList.length) {
          page = val;
          fetch();
        }
      }
    },
    pageList: {
      enumerable: true,
      get: function () {
        return pageList;
      },
      set: function(val) {
        pageList = Range.range(this.page, val.pages)
      }
    }
  });

  function fetch() {
    var options = {
      page: page - 1,
      size: 10
    };

    Collection.paginate(options).$promise.then(function(data){
      $scope.list = data.data;
      $scope.pageList = data;
    })
  }

  fetch();

  ToggleService.togglify(this, $scope);
  ReorderService.reordify(this, $scope);

  angular.extend(this, {
    data: data,
    $Collection: Collection,
    remove: function(id) {
      if(confirm('Вы действительно хотите удалить вопрос?')) {
        Collection.deleteById({id: id}).$promise.then(function() {
          $scope.page = 1;
        });
      }
    }
  })
}

FaqListCtrl.$inject = ['$scope', '$injector']

/**
 * FaqItemCtrl
 */
function FaqItemCtrl($scope, $injector) {
  var Category = $injector.get('FaqCategory'),
      $state = $injector.get('$state'),
      data = $state.$current.data;

  $scope.categories = [];
  Category.active().$promise.then(function(data){
    $scope.categories = data;
  });

  angular.extend(this, {
    Collection: $injector.get('Faq'),
    data: data,
    list: function() {
      $state.go(data.root + '.list')
    },
    upsert: function(item) {
      this.Collection.upsert(item).$promise.then(function(item) {
          var id = item.id;
          $state.go(data.root + '.item', {id: id});
      });
    },
    wrapItem: function(item) {
      $scope.categoryId = item.category && item.category.id;
      Object.defineProperties(item, {
        category: {
          enumerable: true,
          get: function() {
            var id = $scope.categoryId;
            return $scope.categories.filter(function(category) {
              return category.id === id;
            })[0];
          }
        }
      });

      return item;
    }
  });
}

function NewFaqItemCtrl($scope, $injector) {
  var instance = new FaqItemCtrl($scope, $injector);

  $scope.item = instance.wrapItem({});

  angular.extend(instance, {
    isNew: true,
    save: function() {
      var Collection = instance.Collection;

      Collection.count().$promise.then(function(data) {
        var item = $scope.item;
        item.order = data.count;
        instance.upsert(item);
      });
    }
  })

  return instance;
}

NewFaqItemCtrl.$inject = ['$scope', '$injector'];

function EditFaqItemCtrl($scope, $injector) {
  var instance = new FaqItemCtrl($scope, $injector),
      id = $injector.get('$state').params.id,
      Collection = instance.Collection;

  Collection.findById({id: id}).$promise.then(function(item){
    $scope.item = instance.wrapItem(item);
  });

  angular.extend(instance, {
    isNew: false,
    save: function() {
      instance.upsert($scope.item);
    },
    remove: function() {
      if(confirm('Вы действительно хотите удалить вопрос?')) {
        Collection.deleteById({id: $scope.item.id}).$promise.then(instance.list);
      }
    }
  })

  return instance;
}

EditFaqItemCtrl.$inject = ['$scope', '$injector'];
