define(['angular', 'ngSanitize', 'textAngular', 'ui.select'], function(angular){
  angular.module('html', ['ngSanitize', 'textAngular', 'ui.select'])
    .config(['$provide',
      function($provide) {
        $provide.decorator('taTranslations', localize);
        $provide.decorator('taOptions', configOptions);
      }
    ]).
    run(['taRegisterTool', 'taTranslations',
     function(taRegisterTool, taTranslations) {
      registerInsertLocalImage(taRegisterTool, taTranslations);
      registerInsertProductLink(taRegisterTool, taTranslations);
    }]);

  var ru = {
    html: {
      tooltip: "Переключить HTML / Простой текст"
    },
    heading: {
      tooltip: "Заголовок"
    },
    p: {
      tooltip: "Параграф"
    },
    pre: {
      tooltip: "Форматированный текст"
    },
    ul: {
      tooltip: "Неупорядоченный список"
    },
    ol: {
      tooltip: "Упорядоченный список"
    },
    quote: {
      tooltip: "Блок цитаты"
    },
    undo: {
      tooltip: "Отмена"
    },
    redo: {
      tooltip: "Повтор"
    },
    bold: {
      tooltip: "Жирный"
    },
    italic: {
      tooltip: "Курсив"
    },
    underline: {
      tooltip: "Подчеркнутый"
    },
    strikeThrough: {
      tooltip: "Зачеркнутый"
    },
    justifyLeft: {
      tooltip: "По левому краю"
    },
    justifyRight: {
      tooltip: "По правому краю"
    },
    justifyCenter: {
      tooltip: "По центру"
    },
    indent: {
      tooltip: "Увеличить отступ"
    },
    outdent: {
      tooltip: "Уменьшить отступ"
    },
    clear: {
      tooltip: "Убрать форматирование"
    },
    insertImage: {
      dialogPrompt: "Укажите адрес картинки",
      tooltip: "Вставить картинку из сети",
      hotkey: "???"
    },
    insertVideo: {
      tooltip: "Видео",
      dialogPrompt: "Укажите адрес видео на Youtube"
    },
    insertLink: {
      tooltip: "Вставить/редактировать ссылку",
      dialogPrompt: "Укажите адрес ссылки"
    },
    editLink: {
      reLinkButton: {
        tooltip: "Адрес"
      },
      unLinkButton: {
        tooltip: "Убрать"
      },
      targetToggle: {
        buttontext: "В новом окне"
      }
    },
    wordcount: {
      tooltip: "Слов"
    },
    charcount: {
      tooltip: "Символов"
    },
    insertLocalImage: {
      tooltip: 'Выбрать картинку'
    },
    insertProductLink: {
      tooltip: 'Вставить ссылку на продукт'
    }
  },
    insertLocalImageStr = 'insertLocalImage',
    insertProductLinkStr = 'insertProductLink';

  function localize($delegate) {
    return angular.extend({}, $delegate, ru);
  }

  localize.$inject = ['$delegate'];

  /**
   * Config editor options;
   */
  function configOptions($deletage) {
    $deletage = addCustomToolbar($deletage);
    $deletage = removeCounters($deletage);

    return $deletage;
  }

  configOptions.$inject = ['$delegate'];

  /**
   * Add local image and product link tools.
   */
  function addCustomToolbar(options) {
    var toolbar = options.toolbar;

    toolbar.push([insertLocalImageStr, insertProductLinkStr]);

    return options;
  }

  /**
   * Remove word and character counters
   */
  function removeCounters(options) {
    var toolbar = options.toolbar[3],
        exclude = {
          wordcount: 1,
          charcount: 1
        };

    options.toolbar[3] =
      toolbar.filter(function(tool) {
      return !exclude[tool];
    });


    return options;
  }

  /**
   * Add insert local image tool
   */
  var imageSelectorTmpl = [
    '<div ng-if="active" style="position:absolute;">',
      '<ul>',
        '<li class="thumbnail" ng-repeat="img in images" ng-click="insertImage(img)">',
          '<img ng-src="{{img.src}}" class="img-preview">',
        '</li>',
      '</ul>',
    '</div>'

  ].join('');

  function registerInsertLocalImage(register, translation) {
    register(insertLocalImageStr, {
      iconclass: 'fa fa-plug',
      tooltiptext: translation.insertLocalImage.tooltip,
      buttontext: imageSelectorTmpl,
      action: function(later) {
        var $editor = this.$editor();
        if(this.active) { //close dropdown
          this.active = false;
          this.cleanUp();
          later.resolve();
        }
        else { //activate
          this.active = true;
          this.images = $editor.$parent.item.images;
          this.insertImage = function(image) {
            $editor.wrapSelection('insertImage', image.src, true);
            later.resolve();
          };

          this.cleanUp = function() {
            later.resolve();
            this.cleanUp = null;
          };
        }
      }
    });
  }

  /**
   * Add insert product link tool
   */

  var productSelectorTmpl = [
    '<div ng-if="active" class="form-inline" style="position:absolute;">',
    '<ui-select ng-model="product" on-select="insertLink()" class="product-select" theme="bootstrap" reset-search-input="true">',
    '<ui-select-match placeholder="Поиск продукта">{{$select.selected.caption}}</ui-select-match>',
    '<ui-select-choices repeat="product in products| filter: $select.search| orderBy: \'caption\'">',
    '<div ng-bind-html="product.caption | highlight: $select.search"></div>',
    '</ui-select-choices>',
    '</ui-select>',
    '/<div>'
  ].join('');

  function registerInsertProductLink(register, translation) {
    register(insertProductLinkStr, {
      iconclass: 'fa fa-flask',
      tooltiptext: translation.insertProductLink.tooltip,
      buttontext: productSelectorTmpl,
      action: function(later, selection) {
        var $editor = this.$editor(),
            scope = this;

        if(this.active && this.product) {
          this.active = false;
          this.cleanUp();
          later.resolve();
        }
        else {
          this.active = true;
          this.products = $editor.$parent.products;
          this.insertLink = function() {
            var product = this.product,
                html = [
                  '<a title="', product.caption,
                  '" href="/product/', product.id, '"',
                  'class="product-link">',
                  product.caption,
                  '</a>'
                ].join('');
            selection();
            $editor.wrapSelection('insertHTML', html, false);
            scope.active = false;
            this.product = null;
            later.resolve();
          };
          this.cleanUp = function() {
            later.resolve();
            this.cleanUp = null;
          };
        }
      }
    });
  }
});
