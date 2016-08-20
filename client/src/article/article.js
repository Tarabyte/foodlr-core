define(['angular','lbServices', '../utils/crud', '../utils/utils',
        'angular-file-upload', '../html/html'], function(angular){
  function ArticleListCtrl($scope, $injector) {
    var $state = $injector.get('$state'),
        Rubric = $injector.get('Rubric'),
        Collection = $injector.get('Article'),
        Cuisine = $injector.get('Cuisine'),
        Tag = $injector.get('Tag'),
        RangeService = $injector.get('RangeService'),
        ToggleService = $injector.get('ToggleService'),
        page = 1,
        size = 10,
        search = '',
        currentRubric = 0,
        currentCuisine = 0,
        currentTag = 0,
        pageList = [];

    Object.defineProperties($scope, {
      pageList: {
        enumerable: true,
        get: function() {
          return pageList;
        },
        set: function(data) {
          pageList = RangeService.range(this.page, data.pages);
        }
      },
      lastPage: {
        enumerable: true,
        get: function() {
          return this.pageList.slice(-1)[0] || 1;
        }
      },
      page: {
        enumerable: true,
        get: function() {
          return page;
        },
        set: function(val) {
          if(val > 0 && val <= this.lastPage) {
            page = val;
            fetch();
          }
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

      currentCuisine: {
        enumerable: true,
        get: function() {
          return currentCuisine;
        },
        set: function(val) {
          currentCuisine = currentCuisine === val ? 0 : val;
          first();
        }
      },

      currentTag: {
        enumerable: true,
        get: function() {
          return currentTag;
        },
        set: function(val) {
          currentTag = currentTag === val ? 0 : val;
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
      if(currentCuisine) {
        filter.where['cuisine.id'] = currentCuisine;
      }
      if(currentTag) {
        filter.where['tags.id'] = currentTag;
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
        $scope.list = data.data;
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

    Cuisine.active().$promise.then(function(data) {
      data.unshift({id: 0, caption: 'Все'});
      $scope.cuisines = data;
    });

    Tag.active().$promise.then(function(data) {
      data.unshift({id: 0, caption: 'Все'});
      $scope.tags = data;
    });

    ToggleService.togglify(this, $scope);

    angular.extend(this, {
      data: $state.$current.data,
      $Collection: Collection,
      remove: function(id) {
        if(confirm('Вы действительно хотите удалить статью?')) {
          Collection.deleteById({id: id}).$promise.then(first);
        }
      }
    });

  }

  ArticleListCtrl.$inject = ['$scope', '$injector'];

  /**
   * Item create|edit control
   */
  function ArticleItemCtrl($scope, $injector) {
    var $state = $injector.get('$state'),
        data = $state.$current.data,
        Collection = $injector.get(data.collection),
        Rubric = $injector.get('Rubric'),
        Cuisine = $injector.get('Cuisine'),
        Tag = $injector.get('Tag'),
        Product = $injector.get('Product'),
        related = {
          products: Product,
          cuisines: Cuisine,
          rubrics: Rubric,
          tags: Tag
        };

    $scope.selectedRubrics = {};

    Object.keys(related).forEach(function load(name) {
      $scope[name] = [];

      related[name].active().$promise.then(function(data) {
        $scope[name] = data;
      })
    })    


    function initRubrics(rubrics) {
      $scope.selectedRubrics = (rubrics || []).reduce(function(cache, rubric){
        cache[rubric.id] = true;
        return cache;
      }, {});
    }

    function initTags(tags) {
      $scope.selectedTags = (tags || []).reduce(function(cache, rubric){
        cache[rubric.id] = true;
        return cache;
      }, {});
    }

    angular.extend(this, {
      data: data,
      Collection: Collection,
      wrapItem: function(item) {
        initRubrics(item.rubrics);
        initTags(item.tags);
        Object.defineProperties(item, {
          rubrics: {
            enumerable: true,
            get: function() {
              var selected = $scope.selectedRubrics;
              return $scope.rubrics.filter(function(rubric){
                return selected[rubric.id];
              });
            }
          },
          tags: {
            enumerable: true,
            get: function() {
              var selected = $scope.selectedTags;
              return $scope.tags.filter(function(tag){
                return selected[tag.id];
              });
            }
          },
          cuisine: {
            enumerable: true,
            get: function() {
              var id = $scope.cuisineId;
              return $scope.cuisines.filter(function(item) {
                return item.id === id;
              })[0];
            }
          }
        });

        return item;
      },
      list: function() {
        $state.go(data.root + '.list');
      },
      afterSave: function(item) {
        $state.go(data.root + '.item', {id: item.id});
      },
      save: function() {
        Collection.upsert($scope.item).$promise.then(this.afterSave.bind(this));
      },
      remove: function() {
        if(confirm('Вы действительно хотите удалить статью?')) {
          Collection.deleteById({id: $scope.item.id})
            .$promise.then(this.list.bind(this));
        }
      }

    });
  }

  function NewArcticleItemCtrl($scope, $injector) {
    var instance = new ArticleItemCtrl($scope, $injector);

    $scope.item = instance.wrapItem({
      rubrics: []
    });

    return angular.extend(instance, {
      title: 'Новая статья',
      isNew: true
    });
  }

  NewArcticleItemCtrl.$inject = ['$scope', '$injector'];

  function EditArticleItemCtrl($scope, $injector) {
    var instance = new ArticleItemCtrl($scope, $injector),
        $state = $injector.get('$state'),
        id = $state.params.id,
        FileUploader = $injector.get('FileUploader');

    instance.Collection.findById({id: id})
      .$promise.then(function(item) {
      var container = 'api/containers/news_' + id,
          uploader = new FileUploader({
            url: container + '/upload',
            autoUpload: true
          }),
          images = item.images || [];

      $scope.cuisineId = item.cuisine && item.cuisine.id;
      $scope.uploader = uploader;
      $scope.item = instance.wrapItem(item);
      $scope.item.images = images; //in case it was empty

      uploader.onSuccessItem = function(_, data) {
        var file = data.result.files.file[0];

        images.push({
          name: file.name,
          type: file.type,
          src: container + '/download/' + file.name
        });
      };

    });

    return angular.extend(instance, {
      title: 'Редактирование статьи',
      isNew: false,
      removeImage: function(img) {
        var index, images = $scope.item.images;
        if(confirm('Вы действительно хотите удалить картинку?')) {
          index = images.indexOf(img);
          if(index >= 0) {
            images.splice(index, 1);
          }
        }
      }
    });
  }

  EditArticleItemCtrl.$inject = ['$scope', '$injector'];

  angular.module('article', ['lbServices', 'crud', 'utils',
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
        controller: 'NewArticleItemCtrl as ctrl'
      })
      .state('articles.item', {
        url: '/:id',
        templateUrl: 'src/article/item.html',
        controller: 'EditArticleItemCtrl as ctrl'
      });
    }])
  .controller('ArticleListCtrl', ArticleListCtrl)
  .controller('NewArticleItemCtrl', NewArcticleItemCtrl)
  .controller('EditArticleItemCtrl', EditArticleItemCtrl);
});
