/*global angular*/
function ArticleListCtrl($scope, $injector) {
  var $state = $injector.get('$state'),
      Rubric = $injector.get('Rubric'),
      Collection = $injector.get('Article'),
      page = 1,
      size = 10,
      search = '',
      currentRubric = 0,
      pageList = [];

  Object.defineProperties($scope, {
    pageList: {
      enumerable: true,
      get: function() {
        return pageList;
      },
      set: function(data) {
        pageList = range(data.pages);
      }
    },
    page: {
      enumerable: true,
      get: function() {
        return page;
      },
      set: function(val) {
        page = val;
        fetch();
      }
    },
    currentRubric: {
      enumerable: true,
      get: function() {
        return currentRubric;
      },
      set: function(val) {
        currentRubric = currentRubric === val ? 0 : val;
        first();
      }
    },

    search: {
      enumerable: true,
      get: function() {
        return search;
      },
      set: function(txt) {
        search = txt;
        first();
      }
    }
  });

  function range(to) {
    var start, end, middle;
    to = to || 1;
    start = [1, 2, 3];
    end = [to-2, to-1, to];
    middle = [page-1, page, page+1];


    return start.concat(middle, end).filter(function(item) {
      return item >0 && item <= to;
    })
    .sort()
    .filter(function(item, i, array) {
      return item !== array[i-1];
    });
  }

  function fetch() {
    var options = {
      page: page - 1,
      size: size
    },
    filter = {
      where: {},
      fields: {
        images: false
      }
    };

    options.filter = filter;

    if(currentRubric) {
      filter.where['rubrics.id'] = currentRubric;
    }
    if(search) {
      var tokens = search.split(' ').filter(Boolean);
      if(tokens.length > 1) { //fulltext mode
        filter.where.$text = {search: search};
      }
      else {
        filter.where.or = [
          {caption: {like: search}},
          {content: {like: search}}
        ];
      }
    }

    Collection.paginate(options).$promise.then(function(data) {
      $scope.items = data.data;
      $scope.pageList = data;
    });
  }

  function first() {
    $scope.page = 1;
  }

  fetch();

  Rubric.active().$promise.then(function(data) {
    data.unshift({id: 0, caption: 'Все'});
    $scope.rubrics = data;
  });

  angular.extend(this, {
    data: $state.$current.data,
    remove: function(id) {
      if(confirm('Вы действительно хотите удалить статью?')) {
        Rubric.deleteById({id: id}).$promise.then(first);
      }
    }
  });

}

ArticleListCtrl.$inject = ['$scope', '$injector'];

angular.module('article', ['lbServices', 'crud',
                          'angularFileUpload', 'html'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('articles', {
      url: '/articles',
      abstract: true,
      template: '<div ui-view/>',
      data: {
        collection: 'Article',
        title: 'Статьи',
        root: 'articles'
      }
    })
    .state('articles.list', {
      url: '',
      templateUrl: 'src/article/list.html',
      controller: 'ArticleListCtrl as ctrl'
    })
    .state('articles.new', {
      url: '/new',
      templateUrl: 'src/article/item.html',
      controller: 'ItemCtrl as ctrl'
    })
    .state('articles.item', {
      url: '/:id',
      templateUrl: 'src/article/item.html',
      controller: 'ItemCtrl as ctrl'
    });
  }])
.controller('ArticleListCtrl', ArticleListCtrl);
