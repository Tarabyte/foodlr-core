/*global angular*/
angular.module('html', ['ngSanitize', 'textAngular'])
  .config(['$provide',
    function($provide) {
      $provide.decorator('taTranslations', localize);
      $provide.decorator('taOptions', configOptions);
    }
  ]);

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
  }
};

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

  toolbar.push(['insertLocalImage', 'insertProductLink']);

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
