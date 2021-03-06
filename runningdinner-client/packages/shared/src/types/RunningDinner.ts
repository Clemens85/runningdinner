import {BaseEntity, GenderAspects, LabelValue} from "./Base";

export interface RunningDinnerBasicDetails {
  registrationType: string;
  title: string;
  city: string;
  zip: string;
  date: Date;
  languageCode: string;
}

export interface Meal extends BaseEntity {
  time: Date;
  label: string;
}

export enum RunningDinnerType {
  DEMO = "DEMO",
  STANDARD = "STANDARD"
}

export interface Contract {

}

export interface RunningDinnerOptions {
  teamSize: number;
  genderAspects: GenderAspects;
  considerShortestPaths: boolean;
  forceEqualDistributedCapacityTeams: boolean;
  teamPartnerWishDisabled: boolean;
  meals: Meal[];
}

export interface RunningDinnerPublicSettings {
  title: string;
  description: string;
  endOfRegistrationDate: Date;
  publicContactName: string;
  publicContactEmail: string;
  publicContactMobileNumber: string;
  registrationDeactivated?: boolean;
  publicDinnerId: string;
  publicDinnerUrl: string;
}

export interface RunningDinnerSessionData {
  genders: LabelValue[];
  registrationTypes: LabelValue[];
  genderAspects: LabelValue[];
  numSeatsNeededForHost: number;
  assignableParticipantSizes: AssignableParticipantSizes;
}

export interface AssignableParticipantSizes {
  minimumParticipantsNeeded: number;
  nextParticipantsOffsetSize: number;
}

export interface RunningDinner {
  adminId: string;
  email: string;
  basicDetails: RunningDinnerBasicDetails;
  options: RunningDinnerOptions;
  publicSettings: RunningDinnerPublicSettings;

  cancellationDate?: Date;

  runningDinnerType: RunningDinnerType;

  acknowledgedDate?: Date;

  sessionData: RunningDinnerSessionData;

  contract: Contract;
}
