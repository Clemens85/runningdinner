import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import uniqBy from "lodash/uniqBy";
import orderBy from "lodash/orderBy";
import {Participant, SelectableParticipant, Team} from "../../types";
import {isArrayEmpty, isArrayNotEmpty, isSameEntity, removeEntityFromList} from "../../Utils";
import {generateCancelledTeamMembersAsNumberArray} from "../TeamService";
import {BackendConfig} from "../../BackendConfig";
import axios from "axios";


export interface TeamParticipantsAssignmentModel {
  allSelectableParticipants: SelectableParticipant[];
  teamParticipantAssignments: TeamParticipantsAssignment[];
}

export interface TeamParticipantsAssignment {
  team: Team;
  selectedParticipants: SelectableParticipant[];
}

export enum WaitingListAction {
  ASSIGN_TO_EXISTING_TEAMS = "ASSIGN_TO_EXISTING_TEAMS",
  GENERATE_NEW_TEAMS = "GENERATE_NEW_TEAMS",
  DISTRIBUTE_TO_TEAMS = "DISTRIBUTE_TO_TEAMS"
}
export enum WaitingListActionAdditional {
  NO_ACTION = "NO_ACTION" // This is not from Backend, but we need it in frontend
}

export type WaitingListActionUI = WaitingListAction | WaitingListActionAdditional;

export interface WaitingListInfo {
  participtantsForTeamArrangement: SelectableParticipant[];
  remainingParticipants: SelectableParticipant[];
  allParticipantsOnWaitingList: SelectableParticipant[]; // This is just another view with participtantsForTeamArrangement + remainingParticipants combined
  numMissingParticipantsForFullTeamArrangement: number;
  teamsWithCancelStatusOrCancelledMembers: Team[];
  teamsGenerated: boolean;
  totalNumberOfMissingTeamMembers: number;
  possibleActions: WaitingListActionUI[];
}

export type WaitingListActionResult = {
  affectedTeams: Team[];
  teamMessagesAlreadySent: boolean;
  dinnerRouteMessagesAlreadySent: boolean;
};

export async function findWaitingListInfoAsync(adminId: string): Promise<WaitingListInfo> {
  const url = BackendConfig.buildUrl(`/waitinglistservice/v1/runningdinner/${adminId}`);
  const response = await axios.get(url);
  const waitingListInfo = response.data;
  waitingListInfo.allParticipantsOnWaitingList = waitingListInfo.participtantsForTeamArrangement.concat(waitingListInfo.remainingParticipants);
  waitingListInfo.allParticipantsOnWaitingList = cloneDeep(waitingListInfo.allParticipantsOnWaitingList);
  if (isArrayEmpty(waitingListInfo.possibleActions)) {
    waitingListInfo.possibleActions = [WaitingListActionAdditional.NO_ACTION];
  }
  return waitingListInfo;
}

export async function generateNewTeamsFromWaitingListAsync(adminId: string, participants: Participant[]): Promise<WaitingListActionResult> {
  const url = BackendConfig.buildUrl(`/waitinglistservice/v1/runningdinner/${adminId}/generate-new-teams`);
  const result = await axios.put(url, {
    participants
  });
  return result.data;
}

export async function assignParticipantsToExistingTeamsAsync(adminId: string, teamParticipantsAssignmentList: TeamParticipantsAssignment[]): Promise<WaitingListActionResult> {
  const url = BackendConfig.buildUrl(`/waitinglistservice/v1/runningdinner/${adminId}/assign-participants-teams`);
  const teamParticipantsAssignments = teamParticipantsAssignmentList.filter(tpa => isArrayNotEmpty(tpa.selectedParticipants));

  const teamParticipantsAssignmentsNormalized = teamParticipantsAssignments.map((tpa) => {
    return {
      teamId: tpa.team.id,
      participantIds: tpa.selectedParticipants.map(p => p.id)
    };
  });

  const result = await axios.put(url, {
    teamParticipantsAssignments: teamParticipantsAssignmentsNormalized
  });
  return result.data;
}

export function setupAssignParticipantsToTeamsModel(teams: Team[], participants: Participant[]): TeamParticipantsAssignmentModel {
  const result = {
    allSelectableParticipants: cloneDeep(participants),
    teamParticipantAssignments: teams.map((t) => { return { team: t, selectedParticipants: [] } })
  };
  return orderAndDistinctAllSelectableParticipants(result);
}

export function removeSelectedParticipantFromTeam(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel,
                                                  team: Team,
                                                  participant: SelectableParticipant) {

  const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
  teamParticipantsAssignment.selectedParticipants = removeEntityFromList(teamParticipantsAssignment.selectedParticipants, participant) || [];
  participant.selected = false;
  teamParticipantsAssignmentModel.allSelectableParticipants.push(participant);
  return orderAndDistinctAllSelectableParticipants(teamParticipantsAssignmentModel);
}

export function addSelectedParticipantToTeam(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel,
                                      team: Team,
                                      participant: SelectableParticipant) {

  const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
  teamParticipantsAssignment.selectedParticipants.push(participant);
  participant.selected = true;
  teamParticipantsAssignmentModel.allSelectableParticipants = removeEntityFromList(teamParticipantsAssignmentModel.allSelectableParticipants, participant) || [];
  return orderAndDistinctAllSelectableParticipants(teamParticipantsAssignmentModel);
}

export function getTeamParticipantsAssignment(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel, team: Team): TeamParticipantsAssignment {
  const teamParticipantsAssignment = find(teamParticipantsAssignmentModel.teamParticipantAssignments, (tpa) => isSameEntity(tpa.team, team));
  if (!teamParticipantsAssignment) {
    throw `Could not find TeamParticipantsAssignment in ${JSON.stringify(teamParticipantsAssignmentModel.teamParticipantAssignments)} for team ${JSON.stringify(team)}`;
  }
  return teamParticipantsAssignment;
}

function orderAndDistinctAllSelectableParticipants(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel) {
  teamParticipantsAssignmentModel.allSelectableParticipants = uniqBy(teamParticipantsAssignmentModel.allSelectableParticipants, 'id');
  teamParticipantsAssignmentModel.allSelectableParticipants = orderBy(teamParticipantsAssignmentModel.allSelectableParticipants, 'participantNumber');
  return teamParticipantsAssignmentModel;
}

export function calculateCancelledTeamMembersNumArr(team: Team, numSelectedParticipants: number, teamSizeOfRunningDinner: number): number[] {
  const numCancelledTeamMembers = getNumCancelledTeamMembers(team, numSelectedParticipants, teamSizeOfRunningDinner);
  const cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, teamSizeOfRunningDinner);
  return cancelledTeamMembers.slice(0, numCancelledTeamMembers);
}

export function getNumCancelledTeamMembers(team: Team,
                                           numSelectedParticipants: number,
                                           teamSizeOfRunningDinner: number) {
  const { teamMembers } = team;
  let numCancelledTeamMembers = teamSizeOfRunningDinner - teamMembers.length - numSelectedParticipants;
  if (numCancelledTeamMembers < 0) {
    numCancelledTeamMembers = 0;
  }
  return numCancelledTeamMembers;
}
