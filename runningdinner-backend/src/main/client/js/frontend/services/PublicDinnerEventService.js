(function(angular) {
  'use strict';

  angular.module('rd.frontend.services')
    .factory('PublicDinnerEventService', PublicDinnerEventService);

  function PublicDinnerEventService(RestClientService, UtilService, Constants, FrontendRequests) {

    return {
      findRunningDinnerByPublicId: findRunningDinnerByPublicIdImpl,
      findPublicRunningDinners: findPublicRunningDinnersImpl,
      performRegistrationValidation: performRegistrationValidationImpl,
      performRegistration: performRegistrationImpl,
      activateSubscribedParticipantAsync: activateSubscribedParticipantAsyncImpl
    };

    function findRunningDinnerByPublicIdImpl(publicDinnerId) {
      return RestClientService.execute(FrontendRequests.findRunningDinnerByPublicId, {
        "pathParams": {
          "publicDinnerId": publicDinnerId
        }
      });
    }

    function findPublicRunningDinnersImpl() {
      return RestClientService.execute(FrontendRequests.findPublicRunningDinners)
          .then(function(response) {
            if (response.publicRunningDinners) {
              for (var i = 0; i < response.publicRunningDinners.length; i++) {
                var description = response.publicRunningDinners[i].publicSettings.description;
                response.publicRunningDinners[i].publicDescriptionTeaser = UtilService.getTruncatedText(description, 256);
              }
            }
            return response;
          });
    }

    function activateSubscribedParticipantAsyncImpl(participantId, publicDinnerId) {
      return RestClientService.execute(FrontendRequests.activateSubscribedParticipant, {
        "pathParams": {
          "participantId": participantId,
          "publicDinnerId": publicDinnerId
        },
        "data": {}
      });
    }

    function performRegistrationValidationImpl(publicDinnerId, registrationData) {
      return executeRegistrationRequest(publicDinnerId, registrationData, true);
    }

    function performRegistrationImpl(publicDinnerId, registrationData) {
      return executeRegistrationRequest(publicDinnerId, registrationData, false);
    }

    function executeRegistrationRequest(publicDinnerId, registrationData, validateOnly) {
      if (!registrationData.gender) {
        registrationData.gender = Constants.GENDER.UNDEFINED;
      }
      return RestClientService.execute(FrontendRequests.performRegistration, {
        "pathParams": {
          "publicDinnerId": publicDinnerId
        },
        "queryParams": {
          "validateOnly": validateOnly
        },
        "data": registrationData
      });
    }

  }

})(angular);
