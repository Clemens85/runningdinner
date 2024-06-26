import {
  newEmptyParticipantInstance,
  TeamPartnerWishState,
  MealSpecifics,
  ParticipantFormModel,
  Participant,
  ParticipantName,
  BackendIssue,
  PaymentOptions
} from ".";
import { isStringNotEmpty, TeamPartnerWishRegistrationData } from "..";

export interface RegistrationData extends ParticipantFormModel {
  dataProcessingAcknowledged: boolean;
  teamPartnerRegistrationDisabled?: boolean;
}

export interface RegistrationPaymentSummary extends Omit<PaymentOptions, "id"> {
  teamPartnerRegistration: boolean;
  totalPriceFormatted: string;
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
  teamPartnerWishEmail?: string;
  teamPartnerWishState: TeamPartnerWishState;
  teamPartnerWishRegistrationData?: TeamPartnerWishRegistrationData;
  notes?: string;
  registrationPaymentSummary?: RegistrationPaymentSummary
}

export interface ParticipantActivationResult {
  activatedParticipant?: Participant;
  activatedTeamPartnerRegistration?: ParticipantName;
  validationIssue?: BackendIssue;
}

export interface RegistrationDataCollection {
  registrationData: RegistrationData;
  registrationSummary: RegistrationSummary;
}

export function isParticipantActivationSuccessful(activationResult?: ParticipantActivationResult): boolean {
  return activationResult !== undefined && activationResult != null &&
         activationResult.activatedParticipant !== undefined && activationResult.activatedParticipant != null;
}

export function newEmptyRegistrationDataInstance(invitingParticipantEmailAddress?: string, prefilledEmailAddress?: string): RegistrationData {
  const result: RegistrationData = {
    ...newEmptyParticipantInstance(),
    dataProcessingAcknowledged: false
  };
  if (isStringNotEmpty(invitingParticipantEmailAddress)) {
    result.teamPartnerWishEmail = invitingParticipantEmailAddress;
    result.teamPartnerRegistrationDisabled = true;
  }
  if (isStringNotEmpty(prefilledEmailAddress)) {
    result.email = prefilledEmailAddress;
  }
  return result;
}
