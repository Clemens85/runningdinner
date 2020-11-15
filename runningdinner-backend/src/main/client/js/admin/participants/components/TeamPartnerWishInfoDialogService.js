(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('TeamPartnerWishInfoDialogService', TeamPartnerWishInfoDialogService);

  function TeamPartnerWishInfoDialogService($uibModal) {

    return {
      openTeamPartnerWishInfoDialogAsync: openTeamPartnerWishInfoDialogAsyncImpl
    };

    function openTeamPartnerWishInfoDialogAsyncImpl(teamPartnerWishInfo, runningDinner) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/participants/components/teampartnerwishinfodialog.html?v=@@buildno@@',
        controller: 'TeamPartnerWishInfoModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          teamPartnerWishInfo: function() {
            return teamPartnerWishInfo;
          },
          runningDinner: function() {
            return runningDinner;
          }
        }
      });

      return modalInstance.result;
    }
  }


  angular.module('rd.admin.components').controller('TeamPartnerWishInfoModalCtrl', TeamPartnerWishInfoModalCtrl);
  function TeamPartnerWishInfoModalCtrl($uibModalInstance, ParticipantService, TeamService, RunningDinnerService,
                                        MessageService, ErrorHandler, Constants, IssueMessageConstants,
                                        teamPartnerWishInfo, runningDinner) {

    var vm = this;
    vm.runningDinner = runningDinner;
    vm.participant = teamPartnerWishInfo.subscribedParticipant;
    vm.teamPartnerWishInfo = teamPartnerWishInfo;

    vm.createNewParticipant = createNewParticipantImpl;
    vm.sendTeamPartnerWishInvitation = sendTeamPartnerWishInvitationImpl;
    vm.updateTeamPartnerWish = updateTeamPartnerWishImpl;
    vm.cancel = cancelImpl;

    _activate();

    function _activate() {
      vm.dinnerClosed = RunningDinnerService.isClosedDinner(vm.runningDinner);
      vm.teamPartnerWishNotExisting = vm.teamPartnerWishInfo.state === Constants.TEAM_PARTNER_WISH_STATE.NOT_EXISTING;
      vm.teamPartnerWishIsEmpty = vm.teamPartnerWishInfo.state === Constants.TEAM_PARTNER_WISH_STATE.EXISTS_EMPTY_TEAM_PARTNER_WISH;
    }

    function cancelImpl() {
      $uibModalInstance.dismiss(ParticipantService.noTeamPartnerWishAction(vm.participant));
    }

    function createNewParticipantImpl() {
      var newParticipant = {
        email: vm.participant.teamPartnerWish,
        teamPartnerWish: vm.participant.email
      };
      $uibModalInstance.close(ParticipantService.newTeamPartnerWishActionWithNewParticipant(vm.participant, newParticipant));
    }

    function sendTeamPartnerWishInvitationImpl() {
      return MessageService.sendTeamPartnerWishInvitationAsync(vm.runningDinner.adminId, vm.participant.id)
              .then(function() {
                $uibModalInstance.close(ParticipantService.newTeamPartnerWishActionWithSendInvitation(vm.participant, vm.participant.teamPartnerWish));
              });
    }

    function updateTeamPartnerWishImpl() {
      vm.teamPartnerWishInfo.matchingParticipant.teamPartnerWish = vm.participant.email;
      return ParticipantService.saveParticipantAsync(vm.runningDinner.adminId, vm.teamPartnerWishInfo.matchingParticipant)
          .then(function() {
            $uibModalInstance.close(ParticipantService.newTeamPartnerWishActionWithTeamPartnerWishUpdated(vm.participant, vm.teamPartnerWishInfo.matchingParticipant));
          });
    }

  }

})(angular);
