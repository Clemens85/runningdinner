(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('DashboardCtrl', DashboardCtrl);

    function DashboardCtrl(RunningDinnerService, ActivityService, EditMealTimesView, UtilService, adminId) {

      var vm = this;

      vm.isClosedDinner = isClosedDinner;
      vm.isPublicVisibleDinner = isPublicVisibleDinner;
      vm.isOpenDinner = isOpenDinner;

      vm.getTeaser = getTeaser;

      vm.openEditMealTimesDialog = openEditMealTimesDialog;
      vm.isAllMealsOnSameDay = isAllMealsOnSameDay;

      vm.adminId = adminId;

      vm.activitiesLoading = true;

      // Quick information about the running dinner:
      vm.details = null;
      vm.meals = null;
      vm.publicSettings = null;
      vm.location = '';
      vm.daysFromTodayTillEndOfRegistration = null;

      var runningDinnerPromise = RunningDinnerService.findRunningDinnerByAdminIdAsync(adminId);
      runningDinnerPromise.then(_setDinnerToView);

      _activate();

      function _activate() {
        _findAdminActivities();
      }

      function _findAdminActivities() {
        ActivityService.findAdminActivitiesByAdminId(adminId)
          .then(function (response) {
            vm.adminActivities = ActivityService.processAdminActivities(response.activities);
            vm.checkList = response.checkList;
        }).finally(function() {
            vm.activitiesLoading = false;
        });
      }

      function _setDinnerToView(runningDinner) {
        vm.details = runningDinner.basicDetails;
        vm.meals = runningDinner.options.meals;
        vm.publicSettings = runningDinner.publicSettings;
        vm.location = vm.details.zip + " " + vm.details.city;
        vm.runningDinner = runningDinner;
      }

      function isClosedDinner(runningDinner) {
        if (runningDinner) {
          return RunningDinnerService.isClosedDinner(runningDinner);
        }
      }

      function isPublicVisibleDinner(runningDinner) {
        if (runningDinner) {
          return RunningDinnerService.isPublicVisibleDinner(runningDinner);
        }
      }

      function isOpenDinner(runningDinner) {
        return !isPublicVisibleDinner(runningDinner) && !isClosedDinner(runningDinner);
      }

      function getTeaser(input, limit) {
        if (!limit) {
          limit = 64;
        }
        return UtilService.getTruncatedText(input, limit);
      }

      function openEditMealTimesDialog() {
        EditMealTimesView.openEditMealTimesDialog(vm.runningDinner, vm.adminActivities).then(function(runningDinner) {
          if (runningDinner) {
            _findAdminActivities(); // Refresh timeline
            _setDinnerToView(runningDinner);
          }
        });
      }

      function isAllMealsOnSameDay() {
        // TODO
        return true;
      }
    }

}(angular));
