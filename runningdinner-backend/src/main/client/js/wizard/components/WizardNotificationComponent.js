(function(angular) {
  'use strict';

  angular.module('WizardApp').component('wizardNotification', {
    template :
    '<div class="row notification-info">' +
    '<div class="col-xs-12 text-center">' +
      '<strong translate="wizard_demo_mode_text"></strong>' +
    '</div>' +
    '</div>'
  });

})(angular);

