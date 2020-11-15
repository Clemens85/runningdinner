(function(angular) {
  'use strict';

  angular.module('rd.admin.components').service('ReCreateTeamsService', ReCreateTeamsService);

  function ReCreateTeamsService($uibModal) {

    return {
      openReCreateTeamsDialogAsync: openReCreateTeamsDialogAsyncImpl
    };

    function openReCreateTeamsDialogAsyncImpl(adminId, existingActivities) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/teams/components/recreateteamsdialog.html?v=@@buildno@@',
        controller: 'ReCreateTeamsModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          adminId: function() {
            return adminId;
          },
          existingActivities: function() {
            return existingActivities;
          }
        }
      });

      return modalInstance.result;
    }
  }


  angular.module('rd.admin.components').controller('ReCreateTeamsModalCtrl', ReCreateTeamsModalCtrl);
  function ReCreateTeamsModalCtrl($uibModalInstance, TeamService, Constants, ActivityService, adminId, existingActivities) {

    var vm = this;
    vm.adminId = adminId;

    vm.showDinnerRoutesSentWarning = false;
    vm.showTeamArrangementsSentWarning = false;

    vm.save = save;
    vm.cancel = cancel;

    _activate();

    function _activate() {
      var filteredActivities = ActivityService.filterActivitiesByType(existingActivities, Constants.ACTIVITY.DINNERROUTE_MAIL_SENT);
      if (filteredActivities && filteredActivities.length > 0) {
        vm.showDinnerRoutesSentWarning = true;
        return;
      }
      filteredActivities = ActivityService.filterActivitiesByType(existingActivities, Constants.ACTIVITY.TEAMARRANGEMENT_MAIL_SENT);
      if (filteredActivities && filteredActivities.length > 0) {
        vm.showTeamArrangementsSentWarning = true;
      }
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      return TeamService.reCreateTeamArrangementsAsync(vm.adminId).then(function(response) {
        $uibModalInstance.close(response);
      });
    }

  }

})(angular);
