import {BaseAddress, CONSTANTS, CreateRunningDinnerWizardModel, GeocodingResult, minusDays, plusHours} from "..";
import { BaseEntity, GenderAspects, LabelValue } from "./Base";

export const DEFAULT_END_OF_REGISTRATION_DATE_DAYS_BEFORE_DINNER = 5;

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
  fullname?: string;
  streetWithNr?: string;
  zip?: string;
  city?: string;
  email?: string;
  newsletterEnabled?: boolean;
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
  endOfRegistrationDate?: Date;
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

  afterPartyLocation?: AfterPartyLocation;

  cancellationDate?: Date;

  runningDinnerType: RunningDinnerType;

  acknowledgedDate?: Date;

  sessionData: RunningDinnerSessionData;

  contract: Contract;
}

export interface PublicRunningDinnerList {
  publicRunningDinners: PublicRunningDinner[];
}

export interface PublicRunningDinner extends Omit<RunningDinnerBasicDetails, "registrationType" | "title" | "languageCode"> {
  adminEmail: string;
  registrationDateExpired: boolean;
  runningDinnerType: RunningDinnerType;
  languageCode: string;
  teamPartnerWishDisabled: boolean;
  meals: Meal[];
  publicSettings: RunningDinnerPublicSettings;
  afterPartyLocation?: AfterPartyLocation;
}

export function newEmptyRunningDinnerBasicDetails(): RunningDinnerBasicDetails {
  return {
    title: "",
    city: "",
    zip: "",
    date: new Date(),
    registrationType: CONSTANTS.REGISTRATION_TYPE.OPEN,
    languageCode: "de"
  };
}

export interface AfterPartyLocationAddress extends BaseAddress {
  addressName?: string;
  addressRemarks?: string;
}

export interface AfterPartyLocation extends AfterPartyLocationAddress {
  geocode?: GeocodingResult;
  time: Date;
}

export function newAfterPartyLocation(runningDinner?: CreateRunningDinnerWizardModel): AfterPartyLocation {

  const zip = runningDinner?.basicDetails?.zip || "";
  const cityName = runningDinner?.basicDetails?.city || "";

  let time = new Date();
  const meals = runningDinner?.options?.meals || [];
  if (meals.length > 0) {
    const lastMeal = meals[meals.length - 1];
    time = plusHours(lastMeal.time, 2);
  }

  return {
    street: '',
    streetNr: '',
    zip,
    cityName,
    addressName: '',
    addressRemarks: '',
    time
  };
}

export function newEmptyRunningDinnerPublicSettings(runningDinnerDate?: Date): RunningDinnerPublicSettings {
  const endOfRegistrationDate = runningDinnerDate ? minusDays(runningDinnerDate, DEFAULT_END_OF_REGISTRATION_DATE_DAYS_BEFORE_DINNER) : undefined;
  return {
    title: "",
    description: "",
    publicContactName: "",
    publicContactEmail: "",
    publicContactMobileNumber: "",
    publicDinnerId: "",
    publicDinnerUrl: "",
    endOfRegistrationDate,
    registrationDeactivated: false
  };
}

export interface RunningDinnerBasicDetailsFormModel extends RunningDinnerBasicDetails {
  teamPartnerWishDisabled: boolean;
}

export function newEmptyRunningDinnerBasicDetailsFormModel(): RunningDinnerBasicDetailsFormModel {
  return {
    ...newEmptyRunningDinnerBasicDetails(),
    teamPartnerWishDisabled: false
  };
}

export interface ReSendRunningDinnerCreatedMessageModel {
  newEmailAddress?: string;
}

export function newReSendRunningdinnerCreatedMessageModel(email: string): ReSendRunningDinnerCreatedMessageModel {
  return {
    newEmailAddress: email
  };
}