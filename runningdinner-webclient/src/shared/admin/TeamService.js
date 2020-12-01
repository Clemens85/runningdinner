import BackendConfig from "../BackendConfig";
import axios from "axios";
import cloneDeep from "lodash/cloneDeep";
import {isSameEntity} from "shared/Utils";
import ParticipantService from "shared/admin/ParticipantService";

export default class TeamService {

  static async findTeamsAsync(adminId) {
    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}?filterCancelledTeams=false`);
    const response = await axios.get(url);
    return response.data;
  }

  static async findTeamsNotCancelledAsync(adminId) {
    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}?filterCancelledTeams=true`);
    const response = await axios.get(url);
    return response.data;
  }

  static async createTeamArrangementsAsync(adminId) {
    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}?filterCancelledTeams=true`);
    const response = await axios.post(url);
    return response.data;
  }

  static async swapTeamMembersAsync(adminId, firstParticipantId, secondParticipantId) {

    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/teammembers/swap/${firstParticipantId}/${secondParticipantId}`);
    const response = await axios.put(url);
    return response.data;
  }

  static async updateTeamHostAsync(adminId, team, newHostingTeamMember) {
    const teamToUpdate = cloneDeep(team);
    teamToUpdate.hostTeamMember = newHostingTeamMember;
    const requestData = {
      teams: [teamToUpdate],
      dinnerAdminId: adminId
    };
    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/teamhosts`);
    const response = await axios.put(url, requestData);
    const result = response.data;
    return result.teams ? result.teams[0] : null;
  }

  static async findTeamMeetingPlanAsync(adminId, teamId) {

    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/team/${teamId}/meetingplan`);
    const response = await axios.get(url);
    return response.data;
  }

  static async cancelTeamMemberAsync(adminId, teamId, teamMemberId) {
    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/team/${teamId}/${teamMemberId}/cancel`);
    const response = await axios.put(url);
    return response.data;
  }

  static getTeamMemberCancelInfo(team, teamMemberToCancel) {

    const result = {
      cancelWholeTeam: false,
      remainingTeamMemberNames: []
    };

    const { teamMembers } = team;
    if (teamMembers.length <= 1) {
      // This means that this team has only one member left => hence we need to cancel the whole team instead just removing the member
      result.cancelWholeTeam = true;
      return result;
    } else {
      for (let i = 0; i < teamMembers.length; i++) {
        if (isSameEntity(teamMembers[i], teamMemberToCancel)) {
          continue;
        }
        result.remainingTeamMemberNames.push(ParticipantService.getFullname(teamMembers[i]));
      }
    }

    return result;
  }

  static generateCancelledTeamMembersAsNumberArray(team, teamSize) {
    const result = [];

    const { teamMembers } = team;
    const numTeamMembers = teamMembers.length;

    let cnt = 1;
    for (let i = numTeamMembers; i < teamSize; i++) {
      result.push(cnt++);
    }
    return result;
  }

  static hasEnoughSeats(team, numSeatsNeededForHost) {
    const {teamMembers} = team;
    for (let j = 0; j < teamMembers.length; j++) {
      if (teamMembers[j].numSeats && teamMembers[j].numSeats >= numSeatsNeededForHost) {
        return true;
      }
    }
    return false;
  }

  static async cancelTeamDryRunAsync(adminId, team, replacementParticipants) {
    return TeamService._performTeamCancellationAsync(adminId, team, replacementParticipants, true);
  }

  static async cancelTeamAsync(adminId, team, replacementParticipants) {
    return TeamService._performTeamCancellationAsync(adminId, team, replacementParticipants, false);
  }

  static async _performTeamCancellationAsync(adminId, team, replacementParticipants, dryRun) {

    var replacementParticipantIds =  replacementParticipants.map(rp => rp.id);
    var replaceTeam = replacementParticipantIds.length > 0;

    var teamCancellationData = {
      teamId: team.id,
      replacementParticipantIds: replacementParticipantIds,
      replaceTeam: replaceTeam,
      dryRun: dryRun
    };

    const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/team/${team.id}/cancel`);
    const response = await axios.put(url, teamCancellationData);
    return response.data;
  }

}
