(function(angular) {
  'use strict';

  angular.module('rd.admin.components').service('ChangeTeamHostService', ChangeTeamHostService);

  function ChangeTeamHostService($uibModal) {

    return {
      openChangeTeamHostDialogAsync: openChangeTeamHostDialogAsyncImpl
    };

    function openChangeTeamHostDialogAsyncImpl(adminId, team, onSavedCallback) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/teams/components/changeteamhostdialog.html?v=@@buildno@@',
        controller: 'ChangeTeamHostModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          team: function () {
            return team;
          },
          adminId: function() {
            return adminId;
          }
        }
      });

      modalInstance.result.then(function (result) {
        if (onSavedCallback) {
          onSavedCallback(result);
        }
      }, function () {
        // User hit cancel
      });
    }
  }


  angular.module('rd.admin.components').controller('ChangeTeamHostModalCtrl', ChangeTeamHostModalCtrl);
  function ChangeTeamHostModalCtrl($uibModalInstance, TeamService, adminId, team) {

    var vm = this;
    vm.originalTeam = team;
    vm.team = angular.copy(team);
    vm.adminId = adminId;

    vm.save = save;
    vm.cancel = cancel;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      return saveTeamHost().then(function(response) {
        vm.team = response.teams[0];
        return vm.team;
      }).then(function() {
        $uibModalInstance.close(vm.team);
      });
      // Do nothing and so that dialog stays open on any error
    }

    function saveTeamHost() {
      return TeamService.updateTeamHost(vm.adminId, vm.team);
    }
  }

})(angular);
