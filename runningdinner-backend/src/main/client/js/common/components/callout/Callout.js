(function(angular) {
  'use strict';

  angular.module('rd.common.components').component('callout', {
    bindings : {
      type : '@',
      icon: '@',
      headline: '<'
    },
    transclude: true,
    controller : CalloutComponentCtrl,
    template : "<div class='bs-callout bs-callout-{{ $ctrl.typeToUse }}'>" +
                  "<h4>" +
                    "<span ng-if='$ctrl.icon'><i class='fa fa-fw' ng-class='$ctrl.icon'></i> </span>" +
                    "<span ng-bind-html='$ctrl.headlineTranslated'></span>" +
                  "</h4>" +
                  "<div><ng-transclude></ng-transclude></div>" +
                "</div>"
  });

  function CalloutComponentCtrl($translate) {

    var ctrl = this;

    ctrl.$onInit = function() {
      _activate();
    };

    function _activate() {

      ctrl.headlineTranslated = $translate.instant(ctrl.headline);

      ctrl.typeToUse = ctrl.type;
      if (!ctrl.type) {
        ctrl.typeToUse = "success";
      }
    }
  }

})(angular);
