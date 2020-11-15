(function(angular) {
  'use strict';

  angular.module('SelfAdminApp').controller('DinnerRouteUserViewCtrl', DinnerRouteUserViewCtrl);

  function DinnerRouteUserViewCtrl($scope, $state, BaseController, SelfAdminService) {

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    var vm = this;

    _activate();

    function _activate() {

      vm.selfAdministrationId = $state.params.selfAdministrationId;
      vm.teamId = $state.params.teamId;
      vm.participantId = $state.params.participantId;

      vm.findDinnerRoutePromise = SelfAdminService.findDinnerRouteAsync(vm.selfAdministrationId, vm.participantId, vm.teamId);
      vm.findDinnerRoutePromise.then(function(response) {
        vm.dinnerRoute = response;
      });
    }


  }

})(angular);
