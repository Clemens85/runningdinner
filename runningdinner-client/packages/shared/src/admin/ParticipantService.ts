import axios, {Method} from 'axios';
import filter from 'lodash/filter';
import lowerCase from 'lodash/lowerCase';
import includes from 'lodash/includes';
import { BackendConfig } from "../BackendConfig";
import {
  findEntityById, isArrayEmpty,
  isNewEntity,
  isStringEmpty,
  isStringNotEmpty,
  trimStringsInObject
} from "../Utils";
import {
  Participant,
  TeamPartnerWishInfo,
  ParticipantList,
  ParticipantListable,
  TeamPartnerWishState,
  ParticipantName
} from "../types";
import {CONSTANTS} from "../Constants";

export async function findParticipantsAsync(adminId: string): Promise<ParticipantList> {
  const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participants`);
  const response = await axios.get(url);
  return enhanceTeamPartnerRegistrationData(adminId, response.data);
}

export async function saveParticipantAsync(adminId: string, participant: Participant): Promise<Participant> {

  let method: Method = 'post';
  let url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant`);
  if (!isNewEntity(participant)) {
    const {id} = participant;
    url += `/${id}`;
    method = 'put';
  }

  const participantWithTrimmedStringFields = trimStringsInObject(participant);

  const response = await axios.request<Participant>({
    url: url,
    method: method,
    data: participantWithTrimmedStringFields
  });
  return response.data;
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

export async function findTeamPartnerWishInfoForListAsync(adminId: string, participants: Participant[]): Promise<TeamPartnerWishInfo[]> {
  const participantIds = participants.map(p => p.id);
  if (isArrayEmpty(participantIds)) {
    return [];
  }
  const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participants/team-partner-wish`);
  const response = await axios.put(url, {
    entityIds: participantIds,
    adminId
  });
  return response.data;
}

export function getFullname(participant: ParticipantName): string {
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

export function filterParticipantsOrganizedInTeams<T extends Participant>(participants: T[]): T[] {
  return participants.filter(p => isStringNotEmpty(p.teamId));
}

export function searchParticipants<T extends Participant>(participants: T[], searchText: string): T[] {
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

/**
 * Returns true if the passed participant was added by another participant
 * (that means the user added a TeamPartnerRegisrtrationData during regisrtration to the root participant, which created the passed participant).
 *
 * @param participant
 */
export function isTeamPartnerWishChild(participant: Participant) {
  return isTeamPartnerWishRegistration(participant) && participant.teamPartnerWishOriginatorId !== participant.id;
}

export function isTeamPartnerWishRoot(participant: Participant) {
  return isTeamPartnerWishRegistration(participant) && participant.teamPartnerWishOriginatorId === participant.id;
}

export function isTeamPartnerWishRegistration(participant: Participant) {
  return participant && isStringNotEmpty(participant.teamPartnerWishOriginatorId);
}

async function enhanceTeamPartnerRegistrationData(adminId: string, participantList: ParticipantList): Promise<ParticipantList> {
  const allParticipants = participantList.participants.concat(participantList.participantsWaitingList || []);
  await enhanceParticipantsWithTeamPartnerRegistrationData(adminId, participantList.participants, allParticipants);
  await enhanceParticipantsWithTeamPartnerRegistrationData(adminId, participantList.participantsWaitingList, allParticipants);
  return participantList;
}

async function enhanceParticipantsWithTeamPartnerRegistrationData(adminId: string, participants: ParticipantListable[], allParticipants: ParticipantListable[]) {
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    if (isStringEmpty(participant.teamPartnerWishOriginatorId)) {
      continue;
    }
    if (isTeamPartnerWishChild(participant)) {
      const rootParticipant = findEntityById(allParticipants, participant.teamPartnerWishOriginatorId);
      if (!rootParticipant) {
        continue;
      }
      participant.rootTeamPartnerWish   = {
        ...rootParticipant
      };
    } else {
      const childParticipant = filter(allParticipants, p => p.id !== participant.teamPartnerWishOriginatorId && p.teamPartnerWishOriginatorId === participant.id);
      if (!childParticipant || childParticipant.length !== 1) {
        continue;
      }
      participant.childTeamPartnerWish = {
        ...childParticipant[0]
      };
    }
  }

  const participantsWithTeamPartnerWishEmail = filter(participants, p => isStringNotEmpty(p.teamPartnerWishEmail))
  const teamPartnerWishInfos = await findTeamPartnerWishInfoForListAsync(adminId, participantsWithTeamPartnerWishEmail) || [];
  for (let i = 0; i < teamPartnerWishInfos.length; i++) {
    const teamPartnerWishInfo = teamPartnerWishInfos[i];
    if (teamPartnerWishInfo.subscribedParticipant) {
      const participantToEnhance = findEntityById(participants, teamPartnerWishInfo.subscribedParticipant.id);
      participantToEnhance.teamPartnerWishStateEmailInvitation = teamPartnerWishInfo.state;
    }
  }
}
