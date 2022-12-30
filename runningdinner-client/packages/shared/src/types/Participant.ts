import {BaseEntity, GeocodingResult} from "./Base";
import {CONSTANTS} from "../Constants";
import clone from "lodash/clone";
import {isStringEmpty} from "../";

export interface MealSpecifics {
  vegetarian: boolean,
  lactose: boolean,
  gluten: boolean,
  vegan: boolean,
  note: string;
}

export interface Participant extends BaseEntity {
  participantNumber?: number;
  firstnamePart: string,
  lastname: string,
  gender: string,
  mobileNumber: string;
  email: string;
  street: string;
  streetNr: string;
  zip: string;
  cityName: string;
  age: number;
  vegetarian: false,
  lactose: false,
  gluten:false,
  vegan: false,
  mealSpecificsNote: string;
  numSeats: number,
  addressRemarks: string;
  teamPartnerWish: string;
  notes: string;
  teamId?: string;
  geocodingResult?: GeocodingResult;
}

export interface ParticipantList {
  participants: ParticipantListable[];
  participantsWaitingList: ParticipantListable[];
  teamsGenerated: boolean;
  numParticipantsTotal: number;
  missingParticipantsInfo: MissingParticipantsInfo
}

export function concatParticipantList(participantList: ParticipantList): ParticipantListable[] {
  return participantList.participants.concat(participantList.participantsWaitingList);
}

export interface ParticipantListable extends Participant {
  listNumber: number;
}

export interface MissingParticipantsInfo {
  numMinParticipantsNeeded: number;
  numParticipantsMissing: number;
}

export interface SelectableParticipant extends Participant {
  selected?: boolean;
}

export enum TeamPartnerWishState {
  NOT_EXISTING = "NOT_EXISTING",
  EXISTS_EMPTY_TEAM_PARTNER_WISH = "EXISTS_EMPTY_TEAM_PARTNER_WISH",
  EXISTS_SAME_TEAM_PARTNER_WISH = "EXISTS_SAME_TEAM_PARTNER_WISH",
  EXISTS_OTHER_TEAM_PARTNER_WISH = "EXISTS_OTHER_TEAM_PARTNER_WISH",
  NO_PARTNER_WISH_BUT_OTHER_TEAM_PARTNER_WISHES = "NO_PARTNER_WISH_BUT_OTHER_TEAM_PARTNER_WISHES"
}

export interface TeamPartnerWishInfo {
  relevant: boolean;
  state: TeamPartnerWishState;
  subscribedParticipant: Participant;
  matchingParticipant: Participant;
}

const EMPTY_PARTICIPANT: Participant = {
  firstnamePart: '',
  lastname: '',
  gender: CONSTANTS.GENDER.UNDEFINED,
  mobileNumber: '',
  email: '',
  street: '',
  streetNr: '',
  zip: '',
  cityName: '',
  age: -1,
  vegetarian: false,
  lactose: false,
  gluten:false,
  vegan: false,
  mealSpecificsNote: '',
  numSeats: -1,
  addressRemarks: '',
  teamPartnerWish: '',
  notes: ''
};

const EXAMPLE_PARTICIPANT: Participant = {
  ...EMPTY_PARTICIPANT,
  firstnamePart: 'Max',
  lastname: 'Mustermann',
  gender: CONSTANTS.GENDER.MALE,
  email: 'Max@Mustermann.de',
  street: 'Musterstraße',
  streetNr: '1',
  age: 25,
  numSeats: 6
};

export function newEmptyParticipantInstance(): Participant {
  return clone(EMPTY_PARTICIPANT);
}

export function newExampleParticipantInstance(): Participant {
  return clone(EXAMPLE_PARTICIPANT);
}

export function isNumSeatsPositiveIntegerOrEmpty(participant: Participant) {
  const {numSeats} = participant;
  const numSeatsStr = numSeats + "";
  if (isStringEmpty(numSeatsStr)) {
    return true;
  }
  return /^(0|[1-9]\d*)$/.test(numSeatsStr);

}