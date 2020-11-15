(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('ParticipantDeletionViewService', ParticipantDeletionViewService);

  function ParticipantDeletionViewService($uibModal) {

    return {
      openParticipantDeletionDialogAsync: openParticipantDeletionDialogAsyncImpl
    };

    function openParticipantDeletionDialogAsyncImpl(participant, dinnerAdminId) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/participants/components/participantdeletiondialog.html?v=@@buildno@@',
        controller: 'ParticipantDeletionModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          participant: function() {
            return participant;
          },
          dinnerAdminId: function() {
            return dinnerAdminId;
          }
        }
      });

      return modalInstance.result;
    }
  }


  angular.module('rd.admin.components').controller('ParticipantDeletionModalCtrl', ParticipantDeletionModalCtrl);
  function ParticipantDeletionModalCtrl($uibModalInstance, ParticipantService, TeamService, UtilService, ErrorHandler, IssueMessageConstants,
                                        participant, dinnerAdminId) {

    var vm = this;
    vm.dinnerAdminId = dinnerAdminId;
    vm.participant = participant;

    vm.cancel = cancel;
    vm.deleteParticipant = deleteParticipant;
    vm.cancelTeamMember = cancelTeamMember;


    function cancel() {
      $uibModalInstance.dismiss();
    }

    function deleteParticipant() {
      _deleteParticipant();
    }

    function cancelTeamMember() {
      $uibModalInstance.dismiss();
      if (UtilService.isNewEntity(vm.participant)) {
        return;
      }
      TeamService.gotoTeamMemberCancellationView(vm.dinnerAdminId, vm.participant);
    }

    function _deleteParticipant() {
      if (UtilService.isNewEntity(vm.participant)) {
        $uibModalInstance.close();
        return;
      }
      return ParticipantService.deleteParticipantAsync(vm.participant, dinnerAdminId)
          .then(function() {
            $uibModalInstance.close();
          })
          .catch(function (response) {
            if (ErrorHandler.isValidationErrorResponse(response) && ErrorHandler.getIssueByMessage(response, IssueMessageConstants.PARTICIPANT_ASSINGED_IN_TEAM)) {
              TeamService.gotoTeamMemberCancellationView(vm.dinnerAdminId, vm.participant);
            }
          });
    }
  }

})(angular);
