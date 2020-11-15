(function(angular) {
  'use strict';

  angular.module('rd.common.filters').filter('teamName', TeamNameFilter);

  function TeamNameFilter() {

    return function(incomingObject) {
      if (incomingObject) {
        return "Team " + incomingObject.teamNumber;
      }
    };

  }

})(angular);

