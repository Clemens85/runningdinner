(function(angular) {
  'use strict';

  angular.module('rd.common.services').factory('TriggerFocus', TriggerFocus);

  function TriggerFocus($rootScope, $timeout) {
    return function (name) {
      $timeout(function () {
        $rootScope.$broadcast('focusOn', name);
      });
    };
  }

})(angular);

