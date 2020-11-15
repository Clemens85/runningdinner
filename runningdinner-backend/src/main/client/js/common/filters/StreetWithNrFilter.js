(function(angular) {
  'use strict';

  angular.module('rd.common.filters').filter('streetWithNr', StreetWithNrFilter);

  function StreetWithNrFilter() {

    return function(participant) {
      if (participant) {
        return participant.street + ' ' + participant.streetNr;
      }
      return '';
    };

  }

})(angular);
