(function(angular) {
  'use strict';

    angular.module('rd.wizard.constants').constant('WizardRequests', {

      "validateBasicDetails": {
          "method": 'PUT',
          "url": '/rest/wizardservice/v1/validate/basicdetails'
      },

      "validateOptions": {
          "method": 'PUT',
          "url": '/rest/wizardservice/v1/validate/options'
      },

      "validatePublicSettings": {
          "method": 'PUT',
          "url": '/rest/wizardservice/v1/validate/publicsettings'
      },

      "uploadParticipantsFile": {
          "method": "POST",
          "url": '/rest/wizardservice/v1/upload/participants'
      },

      "findColumnMappingOptions": {
          "method": 'GET',
          "url": '/rest/wizardservice/v1/upload/participants/columnmappingoptions',
          "cache": true
      },

      "parseUploadedParticipantFile": {
          "method": 'PUT',
          "url": '/rest/wizardservice/v1/upload/participants/parse'
      },

      "createRunningDinner": {
        "method": 'POST',
        "url": '/rest/wizardservice/v1/create'
      }

    });

})(angular);
