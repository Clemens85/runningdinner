(function(angular) {
  'use strict';

  angular.module('rd.common.filters').filter('registrationType', RegistrationTypeFilter);

  function RegistrationTypeFilter(Constants, $translate) {

    return function(registrationType) {

      switch (registrationType) {
        case Constants.REGISTRATION_TYPE.CLOSED:
          return $translate.instant('registration_type_closed');
        case Constants.REGISTRATION_TYPE.OPEN:
          return $translate.instant('registration_type_open');
        case Constants.REGISTRATION_TYPE.PUBLIC:
          return $translate.instant('registration_type_public');
      }
    };

  }

})(angular);
