import axios from "axios";
import { BackendConfig } from "../BackendConfig";
import {GenderAspects, LabelValue, Meal, RunningDinner, RunningDinnerBasicDetails, RunningDinnerOptions, 
        RunningDinnerPublicSettings, RunningDinnerType, newEmptyRunningDinnerBasicDetails, newEmptyRunningDinnerPublicSettings} from "../types";
import {CONSTANTS} from "../Constants";
import {getHoursOfDate, getMinutesOfDate, isSameDay, minusDays, plusDays, plusHours, toLocalDateQueryString, withHourAndMinute} from "../date";
import {isClosedDinner} from "../admin";
import {useTranslation} from "react-i18next";
import {FetchData, FetchStatus} from "../redux/";

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

export async function createRunningDinnerAsync(runningDinner: CreateRunningDinnerWizardModel): Promise<CreateRunningDinnerResponse> {
  const url = BackendConfig.buildUrl(`/wizardservice/v1/create`);
  const result = await axios.post<CreateRunningDinnerResponse>(url, runningDinner);
  return result.data;
}

export function setDefaultEndOfRegistrationDate(runningDinner: CreateRunningDinnerWizardModel) {
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
  return [
    { label: "appetizer", time: withHourAndMinute(dinnerDate, 19, 0) },
    { label: "main_course", time: withHourAndMinute(dinnerDate, 21, 0) },
    { label: "dessert", time: withHourAndMinute(dinnerDate, 23, 0) }
  ];
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

export function fillDemoDinnerValues(runningDinner: CreateRunningDinnerWizardModel) {
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


export interface NavigationStep extends LabelValue {
}

export interface CreateRunningDinnerWizardModel extends Omit<RunningDinner, "sessionData"> {

}

export interface WizardState {
  runningDinner: CreateRunningDinnerWizardModel;
  administrationUrl?: string;
  navigationSteps: NavigationStep[];

  nextNavigationStep?: NavigationStep;
  previousNavigationStep?: NavigationStep;
  completedNavigationSteps: NavigationStep[];

  registrationTypes: FetchData<LabelValue[]>;
  genderAspects: FetchData<LabelValue[]>;
}


export const BasicDetailsNavigationStep: NavigationStep = { label: 'wizard_step_basics', value: '/' };
export const OptionsNavigationStep: NavigationStep = { label: 'wizard_step_options', value: '/options' };
export const MealTimesNavigationStep: NavigationStep = { label: 'wizard_step_mealtimes', value: '/mealtimes' };
export const PublicRegistrationNavigationStep: NavigationStep = { label: 'wizard_step_public_registration', value: '/registration-settings' };
export const ParticipantPreviewNavigationStep: NavigationStep = { label: 'wizard_step_participant_preview', value: '/participants-preview' };
export const FinishNavigationStep: NavigationStep = { label: 'wizard_step_finish', value: '/finish' };
export const SummaryNavigationStep: NavigationStep = { label: 'summary', value: '/summary' };

export const ALL_NAVIGATION_STEPS: NavigationStep[] = [
  BasicDetailsNavigationStep,
  OptionsNavigationStep,
  MealTimesNavigationStep,
  PublicRegistrationNavigationStep,
  ParticipantPreviewNavigationStep,
  FinishNavigationStep
];

export const ALL_NAVIGATION_STEPS_CLOSED_DINNER: NavigationStep[] = [
  BasicDetailsNavigationStep,
  OptionsNavigationStep,
  MealTimesNavigationStep,
  ParticipantPreviewNavigationStep,
  FinishNavigationStep
];

const initialState: WizardState = {
  runningDinner: {
    adminId: '',
    email: '',
    runningDinnerType: RunningDinnerType.STANDARD,
    basicDetails: newEmptyRunningDinnerBasicDetails(),
    options: {
      teamSize: 2,
      meals: newDefaultMeals(new Date()),
      forceEqualDistributedCapacityTeams: true,
      genderAspects: GenderAspects.FORCE_GENDER_MIX,
      considerShortestPaths: false,
      teamPartnerWishDisabled: false
    },
    publicSettings: newEmptyRunningDinnerPublicSettings(),
    contract: {
      fullname: "",
      zip: "",
      streetWithNr: "",
      city: "",
      email: "",
      newsletterEnabled: false
    }
  },

  registrationTypes: { fetchStatus: FetchStatus.IDLE, data: [] },
  genderAspects: { fetchStatus: FetchStatus.IDLE, data: [] },

  navigationSteps: ALL_NAVIGATION_STEPS,
  nextNavigationStep: OptionsNavigationStep,
  completedNavigationSteps: [ParticipantPreviewNavigationStep] // This is not yet completed, but has no relevance to be run through, hence add it always
};

