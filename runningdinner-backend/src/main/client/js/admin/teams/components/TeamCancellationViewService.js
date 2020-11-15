(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('TeamCancellationViewService', TeamCancellationViewService);

  function TeamCancellationViewService($uibModal) {

    return {
      openTeamCancellationDialogAsync: openTeamCancellationDialogAsyncImpl
    };

    function openTeamCancellationDialogAsyncImpl(team, runningDinner) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/teams/components/teamcancellationdialog.html?v=@@buildno@@',
        controller: 'TeamCancellationModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          team: function() {
            return team;
          },
          runningDinner: function() {
            return runningDinner;
          }
        }
      });

      return modalInstance.result.then(function (teamCancellationPreview) {
        return openTeamCancellationPreviewDialogAsyncImpl(teamCancellationPreview, runningDinner.adminId);
      });
    }

    function openTeamCancellationPreviewDialogAsyncImpl(teamCancellationPreview, dinnerAdminId) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/teams/components/teamcancellationpreviewdialog.html?v=@@buildno@@',
        controller: 'TeamCancellationPreviewModalCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          teamCancellationPreview: function() {
            return teamCancellationPreview;
          },
          dinnerAdminId: function() {
            return dinnerAdminId;
          }
        }
      });

      return modalInstance.result.then(function (result) {
        return result;
      });
    }
  }


  angular.module('rd.admin.components').controller('TeamCancellationModalCtrl', TeamCancellationModalCtrl);
  function TeamCancellationModalCtrl($uibModalInstance, _, ParticipantService, TeamService, ErrorHandler, Constants,
                                     team, runningDinner) {

    var vm = this;
    vm.team = team;
    vm.runningDinner = runningDinner;

    vm.cancel = cancel;
    vm.save = save;

    vm.notAssignedParticipants = [];

    _activate();

    function _activate() {
      vm.findNotAssignedParticipantsPromise = ParticipantService.findNotAssignedParticipantsAsync(runningDinner.adminId);
      vm.findNotAssignedParticipantsPromise.then(function(notAssignedParticipants) {
        vm.notAssignedParticipants = notAssignedParticipants;
        if (vm.team.teamMembers.length <= notAssignedParticipants.length) {
          var preselectedParticipants =_.take(vm.notAssignedParticipants, vm.team.teamMembers.length);
          _.each(preselectedParticipants, function(preselectedParticipant) {
            preselectedParticipant.selected = true;
          });
        }

        vm.numNeededParticipants = _calculateNumNeededParticipants();

      }).finally(function() {
        vm.loadingData = false;
      });
    }

    function _calculateNumNeededParticipants() {
      return vm.runningDinner.options.teamSize - vm.notAssignedParticipants.length;
    }

    function cancel() {
      $uibModalInstance.dismiss();
    }

    function save() {
      var selectedParticipants = _.filter(vm.notAssignedParticipants, ['selected', true]);
      return TeamService
          .cancelTeamDryRunAsync(vm.runningDinner.adminId, vm.team, selectedParticipants)
          .then(function (response) {
            response.replacementParticipants = selectedParticipants;
            return $uibModalInstance.close(response);
          })
          .catch(function (errorResponse) {
            ErrorHandler.handleProvidedIssues(_.get(errorResponse, "data.issues", []), Constants.NOTIFICATION.VALIDATION_ERROR);
          });
    }
  }


  angular.module('rd.admin.components').controller('TeamCancellationPreviewModalCtrl', TeamCancellationPreviewModalCtrl);
  function TeamCancellationPreviewModalCtrl($uibModalInstance, _, Constants, $translate, TeamService, ErrorHandler,
                                            teamCancellationPreview, dinnerAdminId) {

    var vm = this;
    vm.teamCancellationPreview = teamCancellationPreview;
    vm.dinnerAdminId = dinnerAdminId;

    vm.isReplacement = isReplacement;
    vm.isCancellation = isCancellation;
    vm.performReplacement = performReplacement;
    vm.performCancellation = performCancellation;

    vm.getHeadline = getHeadline;

    vm.getTeam = getTeam;

    vm.cancel = cancelDialog;

    function performCancellation() {
      return TeamService
          .cancelTeamAsync(dinnerAdminId, getTeam(), [])
          .then(function (response) {
            return $uibModalInstance.close(response);
          })
          .catch(function (errorResponse) {
            ErrorHandler.handleProvidedIssues(_.get(errorResponse, "data.issues", []), Constants.NOTIFICATION.VALIDATION_ERROR);
          });
    }

    function performReplacement() {
      if (!teamCancellationPreview.replacementParticipants || teamCancellationPreview.replacementParticipants.length === 0) {
        throw "Illegal state: replacementParticipants was empty";
      }
      return TeamService
          .cancelTeamAsync(dinnerAdminId, getTeam(), teamCancellationPreview.replacementParticipants)
          .then(function(response) {
            return $uibModalInstance.close(response);
          })
          .catch(function (errorResponse) {
            ErrorHandler.handleProvidedIssues(_.get(errorResponse, "data.issues", []), Constants.NOTIFICATION.VALIDATION_ERROR);
          });
    }

    function isReplacement() {
      var teamStatus = getTeam().status;
      return teamStatus === Constants.TEAM_STATUS.REPLACED;
    }

    function isCancellation() {
      var teamStatus = getTeam().status;
      return teamStatus === Constants.TEAM_STATUS.CANCELLED;
    }

    function getHeadline() {
      if (isCancellation()) {
        return $translate.instant('team_cancel_complete_headline', { teamNumber: getTeam().teamNumber});
      } else if (isReplacement()) {
        return $translate.instant('team_cancel_replace_headline', { teamNumber: getTeam().teamNumber});
      }
    }

    function getTeam() {
      return vm.teamCancellationPreview.team;
    }

    function cancelDialog() {
      $uibModalInstance.dismiss();
    }
  }

})(angular);
