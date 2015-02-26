/*global define*/
define(['angular'], function(angular){
  angular.module('utils.progress.bar', [])
    .directive('progressBar', ProgressBarDirective);

  function ProgressBarDirective() {
    return {
      restrict: 'E',
      scope: {
        value: '=',
        expected: '='
      },
      templateUrl: 'src/utils/progress.bar/tmpl.html',
      link: function(scope) {
        var expected;
        if(!scope.value) {
          scope.value = 0;
        }
        if(isNaN(scope.expected)) {
          scope.expected = 100;
        }
        expected = scope.expected;


        scope.error = expected*0.33;
        scope.warn = expected*0.66;
      }
    };
  }

});
