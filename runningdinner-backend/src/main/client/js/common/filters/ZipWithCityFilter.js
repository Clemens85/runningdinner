(function(angular) {
  'use strict';

  angular.module('rd.common.filters').filter('zipWithCity', ZipWithCityFilter);

  function ZipWithCityFilter() {

    return function(participant) {
      if (participant) {
        return participant.zip + ' ' + participant.cityName;
      }
      return '';
    };

  }

})(angular);


