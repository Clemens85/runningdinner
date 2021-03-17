import axios from "axios";
import { BackendConfig } from "../BackendConfig";
import {GenderAspects, HttpError, LabelValue, Meal, RunningDinner, RunningDinnerBasicDetails, RunningDinnerOptions, RunningDinnerPublicSettings, RunningDinnerType} from "../types";
import {CONSTANTS} from "../Constants";
import {getHoursOfDate, getMinutesOfDate, isSameDay, minusDays, plusDays, plusHours, toLocalDateQueryString, withHourAndMinute} from "../date";
import {isClosedDinner} from "../admin";
import {useTranslation} from "react-i18next";

export const DEFAULT_END_OF_REGISTRATION_DATE_DAYS_BEFORE_DINNER = 5;

export interface CreateRunningDinnerResponse {
  runningDinner: RunningDinner;
  administrationUrl: string;
}

export async function validateBasicDetails(basicDetails: RunningDinnerBasicDetails) {
  const url = BackendConfig.buildUrl(`/wizardservice/v1/validate/basicdetails`);
  await axios.put<void>(url, basicDetails);
}

export async function validateRunningDinnerOptions(options: RunningDinnerOptions, runningDinnerDate: Date) {
  const dinnerDateQueryStr = toLocalDateQueryString(runningDinnerDate);
  const url = BackendConfig.buildUrl(`/wizardservice/v1/validate/options?runningDinnerDate=${dinnerDateQueryStr}`);
  await axios.put<void>(url, options);
}

export async function validatePublicSettings(publicSettings: RunningDinnerPublicSettings, runningDinnerDate: Date) {
  const dinnerDateQueryStr = toLocalDateQueryString(runningDinnerDate);
  const url = BackendConfig.buildUrl(`/wizardservice/v1/validate/publicsettings?runningDinnerDate=${dinnerDateQueryStr}`);
  await axios.put<void>(url, publicSettings);
}

export async function createRunningDinnerAsync(runningDinner: RunningDinner): Promise<CreateRunningDinnerResponse> {
  const url = BackendConfig.buildUrl(`/wizardservice/v1/create`);
  const result = await axios.post<CreateRunningDinnerResponse>(url, runningDinner);
  return result.data;
}

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

export function newDefaultMeals(dinnerDate: Date): Meal[] {
  const meals = [
    { label: "appetizer", time: withHourAndMinute(dinnerDate, 19, 0) },
    { label: "main_course", time: withHourAndMinute(dinnerDate, 21, 0) },
    { label: "dessert", time: withHourAndMinute(dinnerDate, 23, 0) }
  ];
  return meals;
}

export function useMealsTranslated() {
  const {t} = useTranslation('common');
  function getMealsTranslated(meals: Meal[]): Meal[] {
    return meals
            .map(meal => { return {label: t(meal.label), time: meal.time}; });
  }
  return {getMealsTranslated};
}

export function mapExistingMealTimesToNewMeals(existingMealsWithTime: Meal[], newMeals: string[], runningDinnerDate: Date) {
  const result = new Array<Meal>();
  for (let i = 0; i < newMeals.length; i++) {
    let mealWithTime;
    if (existingMealsWithTime.length > i) {
      mealWithTime = {label: newMeals[i], time: existingMealsWithTime[i].time }
    } else {
      const time = i > 0 ?
                      plusHours(result[i - 1].time, 2) : // Previous time + 2h
                      withHourAndMinute(runningDinnerDate, 19, 0);
      mealWithTime = { label: newMeals[i], time };
    }
    result.push(mealWithTime);
  }
  return result;
}

export function applyDinnerDateToMeals(meals: Meal[], runningDinnerDate: Date) {
  return meals.map(meal => {
    if (isSameDay(meal.time, runningDinnerDate)) {
      return meal;
    }
    return {...meal, time: withHourAndMinute(runningDinnerDate, getHoursOfDate(meal.time), getMinutesOfDate(meal.time))}
  });
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
  administrationUrl?: string;
  navigationSteps: LabelValue[];

  nextNavigationStep?: LabelValue;
  previousNavigationStep?: LabelValue;

  fetchRegistrationTypesStatus: FetchStatus;
  fetchRegistrationTypesError?: HttpError;
  fetchGenderAspectsStatus: FetchStatus;
  fetchGenderAspectsError?: HttpError;
}


export const BasicDetailsNavigationStep: LabelValue = { label: 'wizard_step_basics', value: '/' };
export const OptionsNavigationStep: LabelValue = { label: 'wizard_step_options', value: '/options' };
export const MealTimesNavigationStep: LabelValue = { label: 'wizard_step_mealtimes', value: '/mealtimes' };
export const PublicRegistrationNavigationStep: LabelValue = { label: 'wizard_step_public_registration', value: '/registration-settings' };
export const ParticipantPreviewNavigationStep: LabelValue = { label: 'wizard_step_participant_preview', value: '/participants-preview' };
export const FinishNavigationStep: LabelValue = { label: 'wizard_step_finish', value: '/finish' };
export const SummaryNavigationStep: LabelValue = { label: 'summary', value: '/summary' };

export const ALL_NAVIGATION_STEPS: LabelValue[] = [
  BasicDetailsNavigationStep,
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
      meals: newDefaultMeals(new Date()),
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
  fetchGenderAspectsStatus: FetchStatus.IDLE,

  navigationSteps: ALL_NAVIGATION_STEPS,
  nextNavigationStep: OptionsNavigationStep
};

