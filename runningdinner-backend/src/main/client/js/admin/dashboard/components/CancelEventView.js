(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('CancelEventViewService', CancelEventViewService);

  function CancelEventViewService($uibModal, $q) {

    return {
      openCancelEventDialogAsync: openCancelEventDialogAsyncImpl
    };

    function openCancelEventDialogAsyncImpl(runningDinner) {
      var result = $q.defer();

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/dashboard/components/canceleventview.html?v=@@buildno@@',
        controller: 'CancelEventViewCtrl',
        controllerAs: 'ctrl',
        resolve: {
          runningDinner: function() {
            return runningDinner;
          }
        }
      });

      modalInstance.result.then(function (response) {
        result.resolve(response);
      }, function () {
        result.reject();
      });

      return result.promise;
    }
  }

  angular.module('rd.admin.components').controller('CancelEventViewCtrl', CancelEventViewCtrl);
  function CancelEventViewCtrl($uibModalInstance, RunningDinnerService, runningDinner) {

    var vm = this;
    vm.save = save;
    vm.cancel = cancel;

    vm.runningDinner = runningDinner;
    vm.isClosedDinner = RunningDinnerService.isClosedDinner(runningDinner);

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      return RunningDinnerService.cancelRunningDinnerAsync(runningDinner.adminId)
          .then(function(response) {
            $uibModalInstance.close(response);
            return response;
          });
    }
  }


})(angular);
