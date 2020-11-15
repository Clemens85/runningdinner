(function(angular) {
  'use strict';

  angular.module('rd.admin.components').component('adminNotification', {
    bindings : {
      adminId: '<'
    },
    controller : AdminNotificationCtrl,
    template :
      '<div class="row" ng-class="$ctrl.notificationClass" ng-if="$ctrl.notificationText">' +
        '<div class="col-xs-12 text-center">' +
          '<strong ng-bind-html="$ctrl.notificationText"></strong>' +
        '</div>' +
      '</div>' +
      '<div class="row notification-info" ng-if="$ctrl.acknowledgeRequiredText">' +
        '<div class="col-xs-12 text-center">' +
          '<strong ng-bind-html="$ctrl.acknowledgeRequiredText"></strong>' +
        '</div>' +
      '</div>'
  });

  function AdminNotificationCtrl(RunningDinnerService, Constants, localDateTimeSecondsFilter, $translate) {

    var acknowledgeRequiredText = $translate.instant('notification_dinner_acknowledge_required');

    var ctrl = this;

    ctrl.$onInit = function() {
      _activate();
    };

    function _activate() {
      RunningDinnerService.findRunningDinnerByAdminIdAsync(ctrl.adminId).then(function(runningDinner) {
        ctrl.runningDinner = runningDinner;
        if (ctrl.runningDinner.cancellationDate) {
          _showDinnerCancelledNotification();
        } else if (ctrl.runningDinner.runningDinnerType === Constants.RUNNING_DINNER_TYPE.DEMO) {
          _showDemoDinnerNotification();
        }

        if (!ctrl.runningDinner.acknowledgedDate && ctrl.runningDinner.runningDinnerType !== Constants.RUNNING_DINNER_TYPE.DEMO) {
          ctrl.acknowledgeRequiredText = acknowledgeRequiredText;
        }
      });
    }

    function _showDinnerCancelledNotification() {
      var cancellationDateFormatted = localDateTimeSecondsFilter(ctrl.runningDinner.cancellationDate) ;
      ctrl.notificationText = $translate.instant('notification_dinner_cancellation_text', { cancellationDate: cancellationDateFormatted });
      ctrl.notificationClass = "notification-danger";
    }

    function _showDemoDinnerNotification() {
      ctrl.notificationText = $translate.instant('notification_dinner_demo_mode');
      if (!ctrl.runningDinner.acknowledgedDate) {
        ctrl.notificationText += '<br>' + acknowledgeRequiredText;
      }
      ctrl.notificationClass = "notification-info";
    }

  }

})(angular);

