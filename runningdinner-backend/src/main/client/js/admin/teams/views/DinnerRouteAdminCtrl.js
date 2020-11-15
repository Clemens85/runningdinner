(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('DinnerRouteAdminCtrl', DinnerRouteAdminCtrl);

  function DinnerRouteAdminCtrl(TeamService, adminId, teamId) {

    var vm = this;
    vm.adminId = adminId;
    vm.teamId = teamId;

    _activate();

    function _activate() {
      vm.findDinnerRoutePromise = TeamService.findDinnerRouteAsync(adminId, teamId);
      vm.findDinnerRoutePromise.then(function(response) {
        vm.dinnerRoute = response;
      });
    }

  }

})(angular);
