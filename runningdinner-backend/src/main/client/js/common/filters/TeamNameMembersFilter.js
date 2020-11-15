(function(angular) {
  'use strict';

  angular.module('rd.common.filters').filter('teamNameMembers', TeamNameMembersFilter);

  function TeamNameMembersFilter(fullnameFilter, teamNameFilter) {

    return function(incomingObject) {
      var teamName = teamNameFilter(incomingObject);
      var teamMembers = fullnameFilter(incomingObject.teamMembers);
      return teamName + " (" + teamMembers + ")";
    };

  }

})(angular);

