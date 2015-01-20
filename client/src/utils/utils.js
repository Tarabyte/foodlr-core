/*global angular*/
angular.module('utils', [])
  .directive('fa', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.replaceWith('<i class="fa fa-' + attrs.icon + '"></i>');
      }
    };
});
