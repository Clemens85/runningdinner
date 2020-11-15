(function(angular) {
  'use strict';

  angular.module('rd.common.components').component('applinkContainer', {
    transclude: true,
    replace: true,
    template : "<span class='applink-container'>" +
                  "<ng-transclude></ng-transclude> <i class='fa fa-sign-in feature-icon' aria-hidden='true'></i>" +
                "</span>"
  });

})(angular);
