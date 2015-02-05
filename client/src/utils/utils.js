/*global angular*/
angular.module('utils', ['recent'])
  .directive('fa', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.replaceWith('<i class="fa fa-' + attrs.icon + '"></i>');
      }
    };
});
