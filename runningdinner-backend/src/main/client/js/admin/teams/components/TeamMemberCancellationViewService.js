(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('TeamMemberCancellationViewService', TeamMemberCancellationViewService);

  function TeamMemberCancellationViewService($uibModal) {

    return {
      openTeamMemberCancellationDialogAsync: openTeamMemberCancellationDialogAsyncImpl,
      isDismissedForTeamCancellation: isDismissedForTeamCancellationImpl
    };

    function openTeamMemberCancellationDialogAsyncImpl(team, teamMemberToCancel, dinnerAdminId) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/teams/components/teammembercancellationdialog.html?v=@@buildno@@',
        controller: 'TeamMemberCancellationModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          team: function() {
            return team;
          },
          teamMemberToCancel: function() {
            return teamMemberToCancel;
          },
          dinnerAdminId: function() {
            return dinnerAdminId;
          }
        }
      });

      return modalInstance.result;
    }

    function isDismissedForTeamCancellationImpl(dismissResponse) {
      return dismissResponse === 'cancelTeam';
    }
  }

  angular.module('rd.admin.components').controller('TeamMemberCancellationModalCtrl', TeamMemberCancellationModalCtrl);
  function TeamMemberCancellationModalCtrl($uibModalInstance, TeamService, fullnameFilter, IssueMessageConstants, ErrorHandler,
                                           team, teamMemberToCancel, dinnerAdminId) {

    var vm = this;
    vm.dinnerAdminId = dinnerAdminId;
    vm.teamMemberToCancel = teamMemberToCancel;
    vm.team = team;

    vm.remainingTeamMemberNames = "";
    vm.cancelWholeTeam = false;

    vm.cancel = cancel;
    vm.cancelTeamMember = cancelTeamMember;
    vm.gotoCancelTeamDialog = gotoCancelTeamDialog;

    _activate();

    function _activate() {
      var allTeamMembers = vm.team.teamMembers;

      if (allTeamMembers.length <= 1) {
        // This means that this team has only one member left => hence we need to cancel the whole team instead just removing the member
        vm.cancelWholeTeam = true;
      } else {
        for (var i = 0; i < allTeamMembers.length; i++) {
          if (allTeamMembers[i].id === teamMemberToCancel.id) {
            continue;
          }
          if (vm.remainingTeamMemberNames.length > 0) {
            vm.remainingTeamMemberNames += ", ";
          }
          vm.remainingTeamMemberNames += fullnameFilter(allTeamMembers[i]);
        }
        vm.teamMemberToCancelIsHost = vm.team.hostTeamMember.id === teamMemberToCancel.id;
      }
    }

    function cancel() {
      $uibModalInstance.dismiss();
    }

    function cancelTeamMember() {
      return TeamService.cancelTeamMemberAsync(vm.dinnerAdminId, vm.team, vm.teamMemberToCancel)
              .then(function(updatedTeam) {
                $uibModalInstance.close(updatedTeam);
              })
              .catch(function(errorResponse) {
                if (ErrorHandler.isValidationErrorResponse(errorResponse) && ErrorHandler.getIssueByMessage(errorResponse, IssueMessageConstants.TEAM_NO_TEAM_MEMBERS_LEFT)) {
                  gotoCancelTeamDialog();
                }
              });
    }

    function gotoCancelTeamDialog() {
      $uibModalInstance.dismiss('cancelTeam');
    }

  }

})(angular);
