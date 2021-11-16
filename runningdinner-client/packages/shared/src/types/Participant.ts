import {BaseEntity} from "./Base";
import {CONSTANTS} from "../Constants";
import clone from "lodash/clone";

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
  numberSeats: number | undefined;
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

export interface GeocodingResult {
  lat?: number;
  lng?: number;
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
  numberSeats: -1,
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
  numberSeats: 6
};

export function newEmptyParticipantInstance(): Participant {
  return clone(EMPTY_PARTICIPANT);
}

export function newExampleParticipantInstance(): Participant {
  return clone(EXAMPLE_PARTICIPANT);
}
