(function(angular) {
  'use strict';

  angular.module('rd.frontend.constants').constant('FrontendRequests', {

    "findRunningDinnerByPublicId": {
      "method": 'GET',
      "url": '/rest/frontend/v1/runningdinner/:publicDinnerId'
    },

    "findPublicRunningDinners": {
      "method": 'GET',
      "url": '/rest/frontend/v1/runningdinner'
    },

    "performRegistration": {
      "method": 'POST',
      "url": '/rest/frontend/v1/runningdinner/:publicDinnerId/register'
    },

    "activateSubscribedParticipant": {
      "method": 'PUT',
      "url": '/rest/frontend/v1/runningdinner/:publicDinnerId/:participantId/activate',
      "ignoreErrorCodes": [404, 400, 500, 406]
    }

  });

})(angular);
