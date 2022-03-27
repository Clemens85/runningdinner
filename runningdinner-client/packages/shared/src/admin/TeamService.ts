import { BackendConfig } from "../BackendConfig";
import axios from "axios";
import cloneDeep from "lodash/cloneDeep";
import {isSameEntity} from "../Utils";
import {DinnerRoute, Participant, Team, TeamArrangementList, TeamCancellationResult, TeamMeetingPlan, TeamMemberCancelInfo} from "../types";
import {getFullname} from "./ParticipantService";

export async function findTeamsAsync(adminId: string): Promise<Array<Team>> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}?filterCancelledTeams=false`);
  const response = await axios.get(url);
  return response.data ? response.data.teams : []; // The backend API provides a result which contains the teams as own attribute
}

export async function findTeamsNotCancelledAsync(adminId: string): Promise<Array<Team>> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}?filterCancelledTeams=true`);
  const response = await axios.get(url);
  return response.data ? response.data.teams : []; // The backend API provides a result which contains the teams as own attribute
}

export async function findTeamsForWaitingListAsync(adminId: string): Promise<Array<Team>> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/waitinglist-fillable`);
  const response = await axios.get(url);
  return response.data ? response.data.teams : []; // The backend API provides a result which contains the teams as own attribute
}

export async function createTeamArrangementsAsync(adminId: string): Promise<TeamArrangementList> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}`);
  const response = await axios.post(url);
  return response.data;
}

export async function reCreateTeamArrangementsAsync(adminId: string): Promise<TeamArrangementList> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}`);
  const response = await axios.put(url);
  return response.data;
}

export async function swapTeamMembersAsync(adminId: string, firstParticipantId: string, secondParticipantId: string): Promise<TeamArrangementList> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/teammembers/swap/${firstParticipantId}/${secondParticipantId}`);
  const response = await axios.put(url);
  return response.data;
}

export async function updateTeamHostAsync(adminId: string, team: Team, newHostingTeamMember: Participant): Promise<Team> {
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

export async function findTeamMeetingPlanAsync(adminId: string, teamId: string): Promise<TeamMeetingPlan> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/team/${teamId}/meetingplan`);
  const response = await axios.get(url);
  return response.data;
}

export async function cancelTeamMemberAsync(adminId: string, teamId: string, teamMemberId: string): Promise<Team> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/team/${teamId}/${teamMemberId}/cancel`);
  const response = await axios.put(url);
  return response.data;
}

export async function findDinnerRouteByAdminIdAndTeamIdAsync(adminId: string, teamId: string): Promise<DinnerRoute> {
  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/team/${teamId}/dinnerroute`);
  const response = await axios.get(url);
  return response.data;
}

export function getTeamMemberCancelInfo(team: Team, teamMemberToCancel: Participant): TeamMemberCancelInfo {
  const result = {
    cancelWholeTeam: false,
    remainingTeamMemberNames: new Array<string>()
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
      result.remainingTeamMemberNames.push(getFullname(teamMembers[i]));
    }
  }

  return result;
}

export function generateCancelledTeamMembersAsNumberArray(team: Team, teamSize: number): number[] {
  const result = [];

  const { teamMembers } = team;
  const numTeamMembers = teamMembers.length;

  let cnt = 1;
  for (let i = numTeamMembers; i < teamSize; i++) {
    result.push(cnt++);
  }
  return result;
}

export function hasEnoughSeats(team: Team, numSeatsNeededForHost: number) {
  const {teamMembers} = team;
  for (let j = 0; j < teamMembers.length; j++) {
    if (teamMembers[j].numSeats && teamMembers[j].numSeats >= numSeatsNeededForHost) {
      return true;
    }
  }
  return false;
}

export async function cancelTeamDryRunAsync(adminId: string, team: Team, replacementParticipants: Participant[]): Promise<TeamCancellationResult> {
  return _performTeamCancellationAsync(adminId, team, replacementParticipants, true);
}

export async function cancelTeamAsync(adminId: string, team: Team, replacementParticipants: Participant[]): Promise<TeamCancellationResult> {
  return _performTeamCancellationAsync(adminId, team, replacementParticipants, false);
}

async function _performTeamCancellationAsync(adminId: string, team: Team, replacementParticipants: Participant[], dryRun: boolean): Promise<TeamCancellationResult> {

  const replacementParticipantIds = replacementParticipants.map(rp => rp.id);
  const replaceTeam = replacementParticipantIds.length > 0;

  const teamCancellationData = {
    teamId: team.id,
    replacementParticipantIds: replacementParticipantIds,
    replaceTeam: replaceTeam,
    dryRun: dryRun
  };

  const url = BackendConfig.buildUrl(`/teamservice/v1/runningdinner/${adminId}/team/${team.id}/cancel`);
  const response = await axios.put(url, teamCancellationData);
  return response.data;
}

export function isTeam(entity: any): entity is Team {
  return entity && entity.teamNumber;
}

