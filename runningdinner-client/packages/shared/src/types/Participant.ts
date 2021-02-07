import {BaseEntity} from "./Base";

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
