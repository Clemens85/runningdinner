import axios, {Method} from 'axios';
import filter from 'lodash/filter';
import lowerCase from 'lodash/lowerCase';
import includes from 'lodash/includes';
import { BackendConfig } from "../BackendConfig";
import {isNewEntity} from "../Utils";
import {Participant, TeamPartnerWishInfo, RunningDinner} from "../types";
import {CONSTANTS} from "../Constants";

export async function findParticipantsAsync(adminId: string): Promise<Participant[]> {
  const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participants`);
  const response = await axios.get(url);
  const { participants } = response.data;
  return participants;
}

export async function saveParticipantAsync(adminId: string, participant: Participant): Promise<Participant> {

  let method: Method = 'post';
  let url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant`);
  if (!isNewEntity(participant)) {
    const {id} = participant;
    url += `/${id}`;
    method = 'put';
  }

  const response = await axios.request<Participant>({
    url: url,
    method: method,
    data: participant
  });
  return response.data;
}

export async function findNotAssignedParticipantsAsync(adminId: string): Promise<Participant[]> {
  const participants = await findParticipantsAsync(adminId);
  const result = getNotAssignableParticipants(participants);
  return result;
}

export async function findNotActivatedParticipantsByAdminIdAndIdsAsync(adminId: string, participantIds: string[]): Promise<Participant[]> {
  const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participants/not-active`);
  const response = await axios.put(url, {
    entityIds: participantIds,
    adminId
  });
  const { participants } = response.data;
  return participants;
}

export async function updateParticipantSubscriptionByAdminIdAndIdAsync(adminId: string, participantId: string): Promise<Participant> {
  const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant/${participantId}/activate`);
  const response = await axios.put(url);
  return response.data;
}

/**
 * Deletes the passed participant for the passed dinner admin id.
 * @param participant
 * @param adminId
 * @returns {*} Returns the deleted participant so that caller can take further actions (e.g. refresh view e.g.)
 */
export async function deleteParticipantAsync(adminId: string, participant: Participant): Promise<Participant> {
  const { id } = participant;
  const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant/${id}`);
  await axios.delete(url);
  return participant;
}

export async function findTeamPartnerWishInfoAsync(adminId: string, participant: Participant): Promise<TeamPartnerWishInfo> {
  var statesToIncludeQueryParam = `?relevantState=${CONSTANTS.TEAM_PARTNER_WISH_STATE.NOT_EXISTING}&relevantState=${CONSTANTS.TEAM_PARTNER_WISH_STATE.EXISTS_EMPTY_TEAM_PARTNER_WISH}`;
  const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant/${participant.id}/team-partner-wish${statesToIncludeQueryParam}`);
  const response = await axios.get(url);
  return response.data;
}

export function getFullname(participant: Participant): string {
  if (!participant || (!participant.firstnamePart && !participant.lastname)) {
    return '';
  }
  return participant.firstnamePart + ' ' + participant.lastname;
}

export function getFullnameList(participants: Participant[]): string {
  if (!participants || participants.length === 0) {
    return '';
  }
  const participantNames = participants.map(p => getFullname(p));
  return participantNames.join(', ');
}

export function getAssignableParticipants(participants: Participant[]): Participant[] {
  return filter(participants, ['assignmentType', CONSTANTS.ASSIGNMENT_TYPE.ASSIGNABLE]) || [];
}

export function getNotAssignableParticipants(participants: Participant[]): Participant[] {
  return filter(participants, ['assignmentType', CONSTANTS.ASSIGNMENT_TYPE.NOT_ASSIGNABLE]) || [];
}

export function getParticipantsOrganizedInTeams(participants: Participant[]): Participant[] {
  return filter(participants, ['assignmentType', CONSTANTS.ASSIGNMENT_TYPE.ASSIGNED_TO_TEAM]) || [];
}

export function searchParticipants(participants: Participant[], searchText: string): Participant[] {
  const searchTextLowerCase = lowerCase(searchText);
  return filter(participants, function(p) {
    let content = getFullname(p);
    const { email, street, zip, mobileNumber } = p;
    content += ` ${email} ${street} ${mobileNumber} ${zip}`;
    content = lowerCase(content);
    return includes(content, searchTextLowerCase);
  });
}

export function getParticipantsExportUrl(adminId: string) {
  return BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participants/export`);
}

export function canHost(participant: Participant, numSeatsNeededForHost: number) {
  return participant.numSeats >= 0 && participant.numSeats >= numSeatsNeededForHost;
}

export function isNumSeatsUnknown(participant: Participant) {
  return participant.numSeats < 0;
}

interface WaitingListParticipantsAssignableToTeams {
  participantsAssignable: Participant[];
  participantsRemaining: Participant[];
  numMissingParticipantsForAllAssignable: number;
}

export function getWaitingListParticipantsAssignableToTeams(runningDinner: RunningDinner, participants: Participant[]): WaitingListParticipantsAssignableToTeams {

  const {assignableParticipantSizes} = runningDinner.sessionData;
  const {nextParticipantsOffsetSize} = assignableParticipantSizes;
  if (nextParticipantsOffsetSize === 0) {
     // should never happen
    throw `Unexpected Error: nextParticipantsOffsetSize was 0: ${JSON.stringify(assignableParticipantSizes)}`;
  }

  // Incoming Participant array should already contain already not assignable participants, but enforce this again here:
  const notAssignableParticipants = getNotAssignableParticipants(participants);

  const factor = Math.trunc(notAssignableParticipants.length / nextParticipantsOffsetSize);
  if (factor === 0) {
    return {
      participantsAssignable: [],
      participantsRemaining: participants,
      numMissingParticipantsForAllAssignable: nextParticipantsOffsetSize - participants.length
    };
  }

  const numParticipantsToTake = factor * nextParticipantsOffsetSize;
  if (numParticipantsToTake > participants.length + 1) {
     // should never happen
    throw `Unexpected Error: numParticipantsToTake (${numParticipantsToTake}) is greather than participants.length (${participants.length}). (Factor was ${factor})`;
  }

  const participantsRemaining = numParticipantsToTake === participants.length ? [] : participants.slice(numParticipantsToTake);
  return {
    participantsAssignable: participants.slice(0, numParticipantsToTake),
    participantsRemaining: participantsRemaining,
    numMissingParticipantsForAllAssignable: participantsRemaining.length === 0 ? 0 : nextParticipantsOffsetSize - participantsRemaining.length
  }
}

