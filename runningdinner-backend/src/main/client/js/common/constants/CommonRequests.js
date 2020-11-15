(function (angular) {
  'use strict';

  angular.module('rd.common.constants').constant('CommonRequests', {

    "findGenders": {
      "method": 'GET',
      "url": '/rest/masterdataservice/v1/genders'
    },

    "findRegistrationTypes": {
      "method": 'GET',
      "url": '/rest/masterdataservice/v1/registrationtypes'
    },

    "findGenderAspects": {
      "method": 'GET',
      "url": '/rest/masterdataservice/v1/genderaspects'
    },

    "createFeedback": {
      "method": 'POST',
      "url": '/rest/feedbackservice/v1/feedback'
    }
  });

})(angular);
