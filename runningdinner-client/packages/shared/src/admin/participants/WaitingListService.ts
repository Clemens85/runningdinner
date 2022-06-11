import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import uniqBy from "lodash/uniqBy";
import orderBy from "lodash/orderBy";
import {Participant, SelectableParticipant, Team} from "../../types";
import {isArrayNotEmpty, isSameEntity, removeEntityFromList} from "../../Utils";
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
  GENERATE_NEW_TEAMS = "GENERATE_NEW_TEAMS"
}

export interface WaitingListInfo {
  participtantsForTeamArrangement: SelectableParticipant[];
  remainingParticipants: SelectableParticipant[];
  numMissingParticipantsForFullTeamArrangement: number;
  teamsWithCancelStatusOrCancelledMembers: Team[];
  teamsGenerated: boolean;
  totalNumberOfMissingTeamMembers: number;
  possibleActions: WaitingListAction[];
}

export async function findWaitingListInfoAsync(adminId: string): Promise<WaitingListInfo> {
  const url = BackendConfig.buildUrl(`/waitinglistservice/v1/runningdinner/${adminId}`);
  const response = await axios.get(url);
  return response.data;
}

export async function generateNewTeamsFromWaitingListAsync(adminId: string, participants: Participant[]): Promise<void> {
  const url = BackendConfig.buildUrl(`/waitinglistservice/v1/runningdinner/${adminId}/generate-new-teams`);
  const response = await axios.put(url, {
    participants
  });
  return response.data;
}

export async function assignParticipantsToExistingTeamsAsync(adminId: string, teamParticipantsAssignmentList: TeamParticipantsAssignment[]): Promise<TeamParticipantsAssignment[]> {
  const url = BackendConfig.buildUrl(`/waitinglistservice/v1/runningdinner/${adminId}/assign-participants-teams`);
  const teamParticipantsAssignments = teamParticipantsAssignmentList.filter(tpa => isArrayNotEmpty(tpa.selectedParticipants));

  const teamParticipantsAssignmentsNormalized = teamParticipantsAssignments.map((tpa) => {
    return {
      teamId: tpa.team.id,
      participantIds: tpa.selectedParticipants.map(p => p.id)
    };
  });

  await axios.put(url, {
    teamParticipantsAssignments: teamParticipantsAssignmentsNormalized
  });
  return teamParticipantsAssignments;
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
  let cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, teamSizeOfRunningDinner);
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




// export function getWaitingListParticipantsAssignableToTeams(runningDinner: RunningDinner, participants: Participant[]): WaitingListParticipantsAssignableToTeams {
//
//   const {assignableParticipantSizes} = runningDinner.sessionData;
//   const {nextParticipantsOffsetSize} = assignableParticipantSizes;
//   if (nextParticipantsOffsetSize === 0) {
//     // should never happen
//     throw `Unexpected Error: nextParticipantsOffsetSize was 0: ${JSON.stringify(assignableParticipantSizes)}`;
//   }
//
//   // Incoming Participant array should already contain already not assignable participants, but enforce this again here:
//   const notAssignableParticipants = getNotAssignableParticipants(participants);
//
//   const factor = Math.trunc(notAssignableParticipants.length / nextParticipantsOffsetSize);
//   if (factor === 0) {
//     return {
//       participantsAssignable: [],
//       participantsRemaining: participants,
//       numMissingParticipantsForAllAssignable: nextParticipantsOffsetSize - participants.length
//     };
//   }
//
//   const numParticipantsToTake = factor * nextParticipantsOffsetSize;
//   if (numParticipantsToTake > participants.length + 1) {
//     // should never happen
//     throw `Unexpected Error: numParticipantsToTake (${numParticipantsToTake}) is greather than participants.length (${participants.length}). (Factor was ${factor})`;
//   }
//
//   const participantsRemaining = numParticipantsToTake === participants.length ? [] : participants.slice(numParticipantsToTake);
//   return {
//     participantsAssignable: participants.slice(0, numParticipantsToTake),
//     participantsRemaining: participantsRemaining,
//     numMissingParticipantsForAllAssignable: participantsRemaining.length === 0 ? 0 : nextParticipantsOffsetSize - participantsRemaining.length
//   }
// }
