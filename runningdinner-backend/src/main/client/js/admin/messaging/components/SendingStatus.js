(function(angular) {
  'use strict';

  angular.module('rd.admin.components').component('sendingStatus', {
    bindings : {
      messageObject: '<'
    },
    controller : SendingStatusCtrl,
    templateUrl : 'admin/messaging/components/sendingstatus.html?v=@@buildno@@'
  });

  function SendingStatusCtrl(MessageService, _) {

    var ctrl = this;

    ctrl.$onInit = function() {
      _activate();
    };

    function _activate() {
      ctrl.statusResult = MessageService.getStatusResult(ctrl.messageObject);
    }
  }

})(angular);
