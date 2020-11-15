(function(angular) {
  'use strict';

  angular.module('rd.self.constants').constant('SelfAdminRequests', {

    "findTeam": {
      "method": 'GET',
      "url": '/rest/self/v1/:selfAdministrationId/:participantId/:teamId/team'
    },

    "updateTeamHost": {
      "method": 'PUT',
      "url": '/rest/self/v1/:selfAdministrationId/:participantId/:teamId/teamhost'
    },

    updateTeamPartnerWish: {
      method: "PUT",
      url: "/rest/self/v1/:selfAdministrationId/:participantId/teampartnerwish"
    },

    "findDinnerRouteBySelfAdminIdAndParticipantIdAndTeamId": {
      "method": 'GET',
      "url": '/rest/self/v1/:selfAdministrationId/:participantId/:teamId/dinnerroute'
    },

    findSelfAdminSessionData: {
      "method": 'GET',
      "url": '/rest/self/v1/:selfAdministrationId/:participantId/sessiondata'
    }

  });
})(angular);
