(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('fieldsetHeadline', fieldsetHeadline);

  function fieldsetHeadline($translate) {

    var result = {
      restrict: 'E',
      scope: {},
      replace: true,

      link: function(scope, element, attrs) {
        scope.text = $translate.instant(attrs.text);

        scope.bgClass = '';
        if (attrs.bgClass) {
          scope.bgClass = attrs.bgClass;
        }

        scope.rowClass = '';
        if (attrs.rowClass) {
          scope.rowClass = attrs.rowClass;
        }
      },

      template: "<div class='row' ng-class='rowClass'><div class='col-xs-12'>" +
      "<h4 class='background-line'><span ng-class='bgClass'>{{ text }}</span></h4>" +
      "</div></div>"
    };

    return result;

  }

})(angular);

