import {isSameDay} from '../date';
import {RunningDinnerBasicDetails} from "../types";
import {CONSTANTS} from "../Constants";
import { findParticipantsAsync } from '.';

function isChangeInDate(a: RunningDinnerBasicDetails, b: RunningDinnerBasicDetails) {
  return !isSameDay(a.date, b.date);
}

function isChangedFromClosedToPublicOrOpen(original: RunningDinnerBasicDetails, updated: RunningDinnerBasicDetails) {
  return hasClosedRegistrationType(original) && !hasClosedRegistrationType(updated);
}

function isChangedFromPublicOrOpenToClosed(original: RunningDinnerBasicDetails, updated: RunningDinnerBasicDetails) {
  return !hasClosedRegistrationType(original) && hasClosedRegistrationType(updated);
}

export function hasClosedRegistrationType(basicDetails: RunningDinnerBasicDetails) {
  return basicDetails.registrationType === CONSTANTS.REGISTRATION_TYPE.CLOSED;
}

export enum SettingsChangeType {
  CHANGE_FROM_NON_CLOSED_TO_CLOSED,
  CHANGE_FROM_CLOSED_TO_NON_CLOSED,
  CHANGE_IN_DATE_WITH_REGISTERED_PARTICIPANTS
}

export async function getSettingsChangeTypeListAsync(original: RunningDinnerBasicDetails, updated: RunningDinnerBasicDetails, adminId: string): Promise<SettingsChangeType[]> {
  const result = new Array<SettingsChangeType>();
  if (isChangedFromClosedToPublicOrOpen(original, updated)) {
    result.push(SettingsChangeType.CHANGE_FROM_CLOSED_TO_NON_CLOSED);
  } else if (isChangedFromPublicOrOpenToClosed(original, updated)) {
    result.push(SettingsChangeType.CHANGE_FROM_NON_CLOSED_TO_CLOSED);
  }

  if (isChangeInDate(original, updated)) {
    const participantList = await findParticipantsAsync(adminId);
    if (participantList.numParticipantsTotal > 0) {
      result.push(SettingsChangeType.CHANGE_IN_DATE_WITH_REGISTERED_PARTICIPANTS);
    }
  } 
  return result;
}