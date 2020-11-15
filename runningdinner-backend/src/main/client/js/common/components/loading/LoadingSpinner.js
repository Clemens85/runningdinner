(function(angular) {
  'use strict';

  angular.module('rd.common.components').component('loadingSpinner', {
    bindings : {
      loading: '<',
      loadingFunction: '&'
    },
    controller : LoadingSpinnerCtrl,
    template : "<div ng-if='$ctrl.loading || ($ctrl.loadingFunction && !$ctrl.loadingFunctionInProgress)'>\n" +
                "  <img src='./images/ajax-loader.gif' class='show-inline' />\n" +
                "  <span translate='loading'></span>\n" +
               "</div>"
  });

  function LoadingSpinnerCtrl() {

    var ctrl = this;
    ctrl.loadingFunctionInProgress = true;

    if (ctrl.loadingFunction != null) {
      ctrl.loadingFunction.finally(function () {
        ctrl.loadingFunctionInProgress = false;
      });
    }
  }

})(angular);
