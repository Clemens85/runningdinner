(function(angular) {
  'use strict';

  angular.module('rd.frontend.components').component('frontendNotification', {
    bindings : {
      runningDinner: '<'
    },
    template :
    '<div class="row notification-info" ng-if="$ctrl.runningDinner.runningDinnerType === \'DEMO\'">' +
    '<div class="col-xs-12 text-center">' +
    '<strong translate="notification_demo_no_registration_text"></strong>' +
    '</div>' +
    '</div>'
  });

})(angular);

