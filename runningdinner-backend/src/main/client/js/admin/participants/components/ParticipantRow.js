(function(angular) {
  'use strict';

  angular.module('rd.admin.components').component('participantRow', {
    bindings : {
      participant: '<'
    },
    controller : ParticipantRowCtrl,
    templateUrl : 'admin/participants/components/participantrow.html?v=@@buildno@@'
  });

  function ParticipantRowCtrl() {

  }

})(angular);

