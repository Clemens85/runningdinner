(function(angular) {
  'use strict';

  angular.module('rd.common.services').service('ButtonStateService', ButtonStateService);

  function ButtonStateService(jQuery) {

    this.registerButton = function (elm) {
      elm.addClass('disable-on-click');
    };

    this.enablePromiseBasedButtonState = function (promise) {
      // disable all enabled buttons
      var buttons = jQuery('body').find('button.disable-on-click:enabled').prop('disabled', true);

      promise.finally(function () {
        // enable all buttons which were disabled before
        buttons.prop('disabled', false);
      });
    };

    this.disableButtons = function () {
      // disable all enabled buttons
      return jQuery('body').find('button.disable-on-click:enabled').prop('disabled', true);
    };

    this.enableButtons = function (buttons) {
      // enable all buttons which were disabled before
      if (buttons != null) {
        buttons.prop('disabled', false);
      }
    };
  }
})(angular);
