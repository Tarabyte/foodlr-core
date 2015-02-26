define(['angular', './recent'], function(angular) {
  'use strict';
  angular.module('utils', ['recent'])
    .directive('fa', function() {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          element.replaceWith('<i class="fa fa-' + attrs.icon + '"></i>');
        }
      };
  })
  .filter('html', function() {
    return function(txt) {
      return String(txt).replace(/<[^>]+(>|$)/gm, '');
    };
  })
  .service('RangeService', function() {
      this.range = function(include, max) {
        var start, middle, end;
        max = max || 1;
        include = include || 1;

        start = [1, 2, 3];
        middle = [include - 1, include, include + 1];
        end = [max - 2, max - 1, max];

        return start.concat(middle, end).filter(function(item) {
          return item > 0 && item <= max;
        })
        .sort(function(a, b) {
          return a - b;
        })
        .filter(function(item, i, array) {
          return item !== array[i-1];
        });
      };
  });
});
