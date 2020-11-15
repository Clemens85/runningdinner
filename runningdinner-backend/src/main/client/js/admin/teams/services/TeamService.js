(function(angular) {
  'use strict';

  angular.module('rd.admin.services').factory('TeamService', TeamService);

  function TeamService($state, RestClientService, UtilService, ParticipantService, Constants, AdminRequests, _) {

    return {
      findTeamsAsync: findTeamsAsyncImpl,
      findTeamsNotCancelledAsync: findTeamsNotCancelledAsyncImpl,
      findTeamMeetingPlanAsync: findTeamMeetingPlanAsyncImpl,
      findDinnerRouteAsync: findDinnerRouteAsyncImpl,

      createTeamArrangementsAsync: createTeamArrangementsAsyncImpl,
      reCreateTeamArrangementsAsync: reCreateTeamArrangementsAsyncImpl,

      replaceTeamInList: replaceTeamInList,
      replaceTeamMember: replaceTeamMember,

      updateTeamHost: updateTeamHost,
      swapTeamMembersAsync: swapTeamMembersAsyncImpl,

      getTeamDetailsUrl: getTeamDetailsUrl,

      cancelTeamAsync: cancelTeamAsyncImpl,
      cancelTeamDryRunAsync: cancelTeamDryRunAsyncImpl,
      getHostAndGuestTeamIds: getHostAndGuestTeamIdsImpl,
      cancelTeamMemberAsync: cancelTeamMemberAsyncImpl,

      createNoTeamsInfo: createNoTeamsInfoImpl,

      gotoTeamMemberCancellationView: gotoTeamMemberCancellationViewImpl
    };

    function findTeamsAsyncImpl(adminId) {
      return _performFindTeams(adminId, false);
    }

    function findTeamsNotCancelledAsyncImpl(adminId) {
      return _performFindTeams(adminId, true);
    }

    function _performFindTeams(adminId, filterCancelledTeams) {
      return RestClientService.execute(AdminRequests.findTeamsByAdminId, {
        "pathParams": {
          "adminId": adminId
        },
        "queryParams": {
          "filterCancelledTeams": filterCancelledTeams
        }
      }).then(function(response) {
        return response.teams;
      });
    }

    function findTeamMeetingPlanAsyncImpl(adminId, teamId) {
      return RestClientService.execute(AdminRequests.findTeamMeetingPlanByAdminIdAndTeamId, {
        "pathParams": {
          "adminId": adminId,
          "teamId": teamId
        }
      }).then(function(response) {
        return response;
      });
    }

    function findDinnerRouteAsyncImpl(adminId, teamId) {
      return RestClientService.execute(AdminRequests.findDinnerRouteByAdminIdAndTeamId, {
        "pathParams": {
          "adminId": adminId,
          "teamId": teamId
        }
      }).then(function(response) {
        return response;
      });
    }

    function createTeamArrangementsAsyncImpl(adminId) {
      return RestClientService.execute(AdminRequests.createTeamArrangements, {
        "pathParams": {
          "adminId": adminId
        }
      }).then(function(response) {
        return response;
      });
    }

    function reCreateTeamArrangementsAsyncImpl(adminId) {
      return RestClientService.execute(AdminRequests.reCreateTeamArrangements, {
        "pathParams": {
          "adminId": adminId
        }
      }).then(function(response) {
        return response;
      });
    }

    function replaceTeamInList(team, teams) {
      for (var i = 0; i < teams.length; i++) {
        if (UtilService.isSameEntity(team, teams[i])) {
          teams[i] = team;
          return;
        }
      }
    }

    function replaceTeamMember(team, srcTeamMember, destTeamMember) {
      for (var i = 0; i < team.teamMembers.length; i++) {
        if (UtilService.isSameEntity(team.teamMembers[i], srcTeamMember)) {
          team.teamMembers[i] = destTeamMember;
          return;
        }
      }
    }

    function updateTeamHost(adminId, team) {
      var teamHostList = {
        teams: [team],
        dinnerAdminId: adminId
      };

      return RestClientService.execute(AdminRequests.updateTeamHosts, {
        "pathParams": {
          "adminId": adminId
        },
        "data": teamHostList
      });
    }

    function swapTeamMembersAsyncImpl(adminId, firstParticipantId, secondParticipantId) {
      return RestClientService.execute(AdminRequests.swapTeamMembers, {
        "pathParams": {
          "adminId": adminId,
          "firstParticipantId": firstParticipantId,
          "secondParticipantId": secondParticipantId
        }
      });
    }

    function cancelTeamDryRunAsyncImpl(dinnerAdminId, team, replacementParticipants) {
      return _performTeamCancellation(dinnerAdminId, team, replacementParticipants, true);
    }

    function cancelTeamAsyncImpl(dinnerAdminId, team, replacementParticipants) {
      return _performTeamCancellation(dinnerAdminId, team, replacementParticipants, false);
    }

    function _performTeamCancellation(dinnerAdminId, team, replacementParticipants, dryRun) {

      var replacementParticipantIds = _.map(replacementParticipants, 'id');
      var replaceTeam = replacementParticipantIds.length > 0;

      var teamCancellationData = {
        teamId: team.id,
        replacementParticipantIds: replacementParticipantIds,
        replaceTeam: replaceTeam,
        dryRun: dryRun
      };

      return RestClientService.execute(AdminRequests.cancelTeam, {
        data: teamCancellationData,
        "pathParams": {
          "adminId": dinnerAdminId,
          "teamId": team.id
        }
      });
    }

    function cancelTeamMemberAsyncImpl(dinnerAdminId, team, teamMember) {
      return RestClientService.execute(AdminRequests.cancelTeamMember, {
        "pathParams": {
          "adminId": dinnerAdminId,
          "teamId": team.id,
          "participantId": teamMember.id
        }
      });
    }

    function getHostAndGuestTeamIdsImpl(teamMeetingPlan) {
      var allTeamsArr = _.concat(teamMeetingPlan.guestTeams, teamMeetingPlan.hostTeams);
      return _.map(allTeamsArr, 'id');
    }

    /**
     * Takes the incoming participants (all of the dinner) and the dinner itself and constructs an object that contains
     * information about what would happen when user triggers team creation.
     *
     * @param existingParticipants
     * @param runningDinner
     * @returns {{}}
     */
    function createNoTeamsInfoImpl(existingParticipants, runningDinner) {

      var noTeams = {};

      noTeams.numParticipants = existingParticipants.length;
      noTeams.numAssignableParticipants = ParticipantService.getAssignableParticipants(existingParticipants).length;
      noTeams.numNotAssignableParticipants = ParticipantService.getNotAssignableParticipants(existingParticipants).length;

      noTeams.registrationType = runningDinner.registrationType;
      noTeams.registrationStillRunning = false;
      if (noTeams.registrationType !== Constants.REGISTRATION_TYPE.CLOSED) {
        var endOfRegistrationDate = _.get(runningDinner, "publicSettings.endOfRegistrationDate");
        noTeams.endOfRegistrationDate = endOfRegistrationDate;
        var now = new Date();
        if (now.getTime() < endOfRegistrationDate) {
          noTeams.registrationStillRunning = true;
        }
      }

      noTeams.numExpectedTeams = noTeams.numAssignableParticipants / runningDinner.options.teamSize;

      return noTeams;
    }

    function gotoTeamMemberCancellationViewImpl(adminId, teamMember) {
      $state.go("admin.teams.details", { "adminId": adminId, "teamId": teamMember.teamId, "teamMemberIdToCancel": teamMember.id });
    }

    function getTeamDetailsUrl(team) {
      return $state.href('admin.teams.details', { 'teamId': team.id });
    }
  }

})(angular);
