(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('EditMealTimesView', EditMealTimesView);

  function EditMealTimesView($q, $uibModal, NotificationService) {

    return {
      openEditMealTimesDialog: openEditMealTimesDialogImpl
    };

    function openEditMealTimesDialogImpl(runningDinner, activities) {

      var result = $q.defer();

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/dashboard/components/editmealtimesdialog.html?v=@@buildno@@',
        controller: 'EditMealTimesModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          runningDinner: function() {
            return runningDinner;
          },
          activities: function() {
            return activities;
          }
        }
      });

      modalInstance.result.then(function (response) {
        NotificationService.success('mealtimes_updated_success');
        result.resolve(response);
      }, function () {
        result.resolve();
      });

      return result.promise;
    }

  }


  angular.module('rd.admin.components').controller('EditMealTimesModalCtrl', EditMealTimesModalCtrl);
  function EditMealTimesModalCtrl($uibModalInstance, ActivityService, RunningDinnerService, runningDinner, activities) {

    var vm = this;
    vm.meals = angular.copy(runningDinner.options.meals);
    vm.activities = activities;

    vm.save = save;
    vm.cancel = cancel;
    vm.hasMessagesSentAlready = hasMessagesSentAlready;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      return RunningDinnerService.updateMealTimes(runningDinner.adminId, vm.meals).then(function(response) {
        $uibModalInstance.close(response);
        return response;
      });
    }

    function hasMessagesSentAlready() {
      var result = ActivityService.isMessageActivityContained(vm.activities);
      return result;
    }
  }

}(angular));
