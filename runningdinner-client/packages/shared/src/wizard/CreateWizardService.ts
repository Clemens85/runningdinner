import axios from "axios";
import { BackendConfig } from "../BackendConfig";
import {GenderAspects, HttpError, LabelValue, RunningDinner, RunningDinnerBasicDetails, RunningDinnerType} from "../types";
import {CONSTANTS} from "../Constants";
import {minusDays, plusDays} from "../date";
import {isClosedDinner} from "../admin";

export const DEFAULT_END_OF_REGISTRATION_DATE_DAYS_BEFORE_DINNER = 5;

export async function validateBasicDetails(basicDetails: RunningDinnerBasicDetails) {
  const url = BackendConfig.buildUrl(`/wizardservice/v1/validate/basicdetails`);
  await axios.put<void>(url, basicDetails);
}

export function fillDemoDinnerValues(runningDinner: RunningDinner) {
  const dinnerDate = plusDays(new Date(), 30); // 30 days in future
  runningDinner.basicDetails = {
    title: "Demo Running Dinner Event",
    city: "Musterstadt",
    zip: "99999",
    date: dinnerDate,
    registrationType: CONSTANTS.REGISTRATION_TYPE.CLOSED,
    languageCode: 'de'
  };

  // Just in case someone chooses public registration type:
  runningDinner.publicSettings.title = "Das ist ein öffentliches Demo Dinner Event";
  runningDinner.publicSettings.description = "Das ist die Beschreibung für das öffentliche Demo Dinner Event. " +
      "Da Demo Events nicht auffindbar sind, spielt es keine Rolle was hier steht.";
}


export enum FetchStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED"
}

export interface WizardState {
  runningDinner: RunningDinner;
  navigationSteps: LabelValue[];

  nextNavigationStep?: LabelValue;
  previousNavigationStep?: LabelValue;

  fetchRegistrationTypesStatus: FetchStatus;
  fetchRegistrationTypesError?: HttpError;
}


export const BasicsNavigationStep: LabelValue = { label: 'wizard_step_basics', value: '/' };
export const OptionsNavigationStep: LabelValue = { label: 'wizard_step_options', value: '/options' };
export const MealTimesNavigationStep: LabelValue = { label: 'wizard_step_mealtimes', value: '/mealtimes' };
export const PublicRegistrationNavigationStep: LabelValue = { label: 'wizard_step_public_registration', value: '/registration-settings' };
export const ParticipantPreviewNavigationStep: LabelValue = { label: 'wizard_step_participant_preview', value: '/participants-preview' };
export const FinishNavigationStep: LabelValue = { label: 'wizard_step_finish', value: '/finish' };

export const ALL_NAVIGATION_STEPS: LabelValue[] = [
  BasicsNavigationStep,
  OptionsNavigationStep,
  MealTimesNavigationStep,
  PublicRegistrationNavigationStep,
  ParticipantPreviewNavigationStep,
  FinishNavigationStep
];

const initialState: WizardState = {
  runningDinner: {
    adminId: '',
    email: '',
    runningDinnerType: RunningDinnerType.STANDARD,
    basicDetails: {
      title: "",
      city: "",
      zip: "",
      date: new Date(),
      registrationType: CONSTANTS.REGISTRATION_TYPE.OPEN,
      languageCode: "de"
    },
    options: {
      teamSize: 2,
      meals: [],
      forceEqualDistributedCapacityTeams: true,
      genderAspects: GenderAspects.FORCE_GENDER_MIX,
      considerShortestPaths: false,
      teamPartnerWishDisabled: false
    },
    publicSettings: {
      title: "",
      description: "",
      endOfRegistrationDate: minusDays(new Date(), DEFAULT_END_OF_REGISTRATION_DATE_DAYS_BEFORE_DINNER),
      publicContactName: "",
      publicContactEmail: "",
      publicContactMobileNumber: "",
      publicDinnerId: "",
      publicDinnerUrl: ""
    },
    contract: {

    },
    sessionData: { // Must be defined and is abused here for storing some state during wizard
      genderAspects: [],
      genders: [],
      numSeatsNeededForHost: 0,
      assignableParticipantSizes: {
        minimumParticipantsNeeded: 0,
        nextParticipantsOffsetSize: 0
      },
      registrationTypes: []
    }
  },
  fetchRegistrationTypesStatus: FetchStatus.IDLE,
  navigationSteps: ALL_NAVIGATION_STEPS,
  nextNavigationStep: OptionsNavigationStep
};

export function setDefaultEndOfRegistrationDate(runningDinner: RunningDinner) {
  const {date} = runningDinner.basicDetails;
  if (!isClosedDinner(runningDinner)) {
    if (!runningDinner.publicSettings.endOfRegistrationDate || runningDinner.publicSettings.endOfRegistrationDate.getTime() > date.getTime()) {
      runningDinner.publicSettings.endOfRegistrationDate = minusDays(date, DEFAULT_END_OF_REGISTRATION_DATE_DAYS_BEFORE_DINNER);
    }
  }
}

export function newInitialWizardState(): WizardState {
  return {... initialState};
}
