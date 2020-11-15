(function(angular) {
  'use strict';

  angular.module('rd.common.components').component('helpIcon', {
    bindings : {
      text: '<'
    },
    controller : HelpIconCtrl,
    templateUrl : 'common/components/helpicon/helpicon.html?v=@@buildno@@'
  });

  function HelpIconCtrl($translate) {

    var ctrl = this;

    ctrl.$onInit = function() {
      _activate();
    };

    function _activate() {
      if (ctrl.text) {
        ctrl.text = $translate.instant(ctrl.text);
      }
    }

  }

})(angular);
