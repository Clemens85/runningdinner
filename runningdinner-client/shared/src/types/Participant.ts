import {BaseEntity, HasGeocoding} from "./Base";
import {CONSTANTS} from "../Constants";
import clone from "lodash/clone";
import {isStringEmpty, isStringNotEmpty} from "../";

export interface MealSpecifics {
  vegetarian: boolean,
  lactose: boolean,
  gluten: boolean,
  vegan: boolean,
  mealSpecificsNote: string;
}

export interface ParticipantName {
  firstnamePart: string,
  lastname: string,
}

export interface Participant extends BaseEntity, HasGeocoding, MealSpecifics, ParticipantName {
  participantNumber?: number;
  gender: string,
  mobileNumber: string;
  email: string;
  street: string;
  streetNr: string;
  zip: string;
  cityName: string;
  age: number;
  numSeats: number,
  addressRemarks: string;
  notes: string;
  teamId?: string;
  teamPartnerWishEmail?: string;
  teamPartnerWishOriginatorId?: string;
  activationDate?: Date;
}

export interface ParticipantFormModel extends Participant {
  /**
   * Is only relevant when creating new participants
   */
  teamPartnerWishRegistrationData?: TeamPartnerWishRegistrationData;
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
  childTeamPartnerWish?: ParticipantListable;
  rootTeamPartnerWish?: ParticipantListable;
  teamPartnerWishStateEmailInvitation?: TeamPartnerWishState;
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

export enum TeamPartnerOption {
  INVITATION="INVITATION",
  REGISTRATION="REGISTRATION",
  NONE="NONE"
}

export interface TeamPartnerWishRegistrationData extends ParticipantName {
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
  teamPartnerWishEmail: '',
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



export interface ParticipantRegistrationInfo extends Omit<BaseEntity, "modifiedAt">, ParticipantName {
  email: string;
  activationDate?: Date;
  activatedBy: string;
  mobileNumber?: string;
}

export interface ParticipantRegistrationInfoList {
  registrations: ParticipantRegistrationInfo[];
  notActivatedRegistrationsTooOld: ParticipantRegistrationInfo[];
  hasMore: boolean;
  page: number;
}

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

export function hasTeamPartnerRegistrationData(teamPartnerWishRegistrationData?: TeamPartnerWishRegistrationData) {
  return teamPartnerWishRegistrationData && isStringNotEmpty(teamPartnerWishRegistrationData.lastname);
}

