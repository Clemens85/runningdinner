(function(angular) {
  'use strict';

  angular.module('rd.self.services').factory('SelfAdminService', SelfAdminService);

  function SelfAdminService(RestClientService, SelfAdminRequests) {

    return {
      findTeamAsync: findTeamAsyncImpl,
      updateTeamHostAsync: updateTeamHostAsyncImpl,
      findDinnerRouteAsync: findDinnerRouteAsyncImpl,
      updateTeamPartnerWishAsync: updateTeamPartnerWishAsyncImpl,
      findSelfAdminSessionDataAsync: findSelfAdminSessionDataAsyncImpl
    };

    function findTeamAsyncImpl(changeTeamHostRequest) {
      var selfAdministrationId = changeTeamHostRequest.selfAdministrationId;
      var teamId = changeTeamHostRequest.teamId;
      var participantId = changeTeamHostRequest.participantId;
      return RestClientService.execute(SelfAdminRequests.findTeam, {
        "pathParams": {
          "selfAdministrationId": selfAdministrationId,
          "participantId": participantId,
          "teamId": teamId
        }
      });
    }

    function updateTeamHostAsyncImpl(changeTeamHostRequest) {
      var selfAdministrationId = changeTeamHostRequest.selfAdministrationId;
      var teamId = changeTeamHostRequest.teamId;
      var participantId = changeTeamHostRequest.participantId;
      return RestClientService.execute(SelfAdminRequests.updateTeamHost, {
        "pathParams": {
          "selfAdministrationId": selfAdministrationId,
          "participantId": participantId,
          "teamId": teamId
        },
        "data": changeTeamHostRequest
      });
    }

    function findDinnerRouteAsyncImpl(selfAdministrationId, participantId, teamId) {
      return RestClientService.execute(SelfAdminRequests.findDinnerRouteBySelfAdminIdAndParticipantIdAndTeamId, {
        "pathParams": {
          "selfAdministrationId": selfAdministrationId,
          "participantId": participantId,
          "teamId": teamId
        }
      }).then(function(response) {
        return response;
      });
    }

    function updateTeamPartnerWishAsyncImpl(selfAdministrationId, participantId, email) {
      return RestClientService.execute(SelfAdminRequests.updateTeamPartnerWish, {
        "pathParams": {
          "selfAdministrationId": selfAdministrationId,
          "participantId": participantId
        },
        "queryParams": {
          "email": email
        }
      });
    }

    function findSelfAdminSessionDataAsyncImpl(selfAdministrationId, participantId) {
      return RestClientService.execute(SelfAdminRequests.findSelfAdminSessionData, {
        "pathParams": {
          "selfAdministrationId": selfAdministrationId,
          "participantId": participantId
        }
      }).then(function(sessionData) {
        return sessionData;
      });
    }

  }

})(angular);

