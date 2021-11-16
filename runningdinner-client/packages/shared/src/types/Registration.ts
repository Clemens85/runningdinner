import {newEmptyParticipantInstance, Participant, TeamPartnerWishState, MealSpecifics} from ".";

export interface RegistrationData extends Participant {
  dataProcessingAcknowledged: boolean;
}

export interface RegistrationSummary {
  fullname: string,
  gender: string,
  mobile?: string;
  email: string;
  streetWithNr: string;
  zipWithCity: string;
  addressRemarks: string;
  age: number;
  ageSpecified: boolean;
  numberOfSeats: number | undefined;
  canHost: boolean;
  mealSpecifics?: MealSpecifics;
  teamPartnerWish?: string;
  teamPartnerWishState: TeamPartnerWishState,
  notes?: string;
}

export function newEmptyRegistrationDataInstance(): RegistrationData {
  const result = {
    ...newEmptyParticipantInstance(),
    dataProcessingAcknowledged: false
  };
  return result;
}
