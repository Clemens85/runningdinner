(function(angular) {
  'use strict';

  angular.module('rd.common.filters').filter('numSeats', NumSeatsFilter);

  function NumSeatsFilter(Constants) {

    return function(incomingValue) {

      if (incomingValue === 0) {
        return 0;
      }

      if (!incomingValue || incomingValue.length === 0) {
        return '?';
      }
      if (isNaN(incomingValue) === false) {
        if (parseInt(incomingValue) <= Constants.UNDEFINED_NUMBER) {
          return '?';
        }
        return incomingValue;
      }
      return incomingValue;
    };

  }

})(angular);
