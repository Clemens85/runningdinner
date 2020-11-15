(function(angular) {
  'use strict';

  angular.module('rd.admin.components').component('checklistView', {
    bindings : {
      closedDinner: '<',
      checkList: '<',
      loading: '<',
      runningDinner: '<'
    },
    controller : ChecklistViewCtrl,
    templateUrl : 'admin/dashboard/components/checklistview.html?v=@@buildno@@'
  });

  function ChecklistViewCtrl(DateService) {

    var ctrl = this;
    ctrl.getDaysFromTodayTillEndOfRegistration = getDaysFromTodayTillEndOfRegistrationImpl;

    function getDaysFromTodayTillEndOfRegistrationImpl() {
      if (!ctrl.closedDinner && ctrl.runningDinner) {
        var now = new Date();
        var endOfRegistrationDate = new Date(ctrl.runningDinner.publicSettings.endOfRegistrationDate);
        return DateService.getDaysBetweenDates(now, endOfRegistrationDate);
      }
    }
  }

})(angular);
