(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('AcknowledgeCtrl', AcknowledgeCtrl);

  function AcknowledgeCtrl($state, $scope, BaseController, Constants, UtilService, _, RunningDinnerService, adminId) {

    var vm = this;
    vm.acknowledgeSucceeded = false;
    vm.acknowledgeFailed = false;

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    vm.acknowledgeId = $state.params.acknowledgeId;
    vm.adminId = adminId;

    vm.acknowledgeErrorEmail = Constants.GLOBAL_ADMIN_EMAIL;

    _activate();

    function _activate() {

      vm.loading = true;
      RunningDinnerService.acknowledgeRunningDinnerAsync(vm.adminId, vm.acknowledgeId).then(function() {
        vm.acknowledgeSucceeded = true;
      })
      .catch(function() {
        vm.acknowledgeFailed = true;
      })
      .finally(function() {
        vm.loading = false;
      });
    }

  }

})(angular);



