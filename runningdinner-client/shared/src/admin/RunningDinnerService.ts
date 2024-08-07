import axios from 'axios';
import { BackendConfig } from "../BackendConfig";
import {cloneDeep} from 'lodash-es';
import {
  Meal, RunningDinner, RunningDinnerBasicDetailsFormModel,
  RunningDinnerOptions, RunningDinnerPublicSettings, ReSendRunningDinnerCreatedMessageModel, AfterPartyLocation
} from "../types";
import {CONSTANTS} from "../Constants";
import {getDaysBetweenDates, isAfterInDays} from '../date';
import {CreateRunningDinnerWizardModel} from "../wizard";
import {hasClosedRegistrationType} from "./SettingsService"
import {isStringNotEmpty} from "../Utils";

export async function findRunningDinnerAsync(adminId: string): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}`);
  const response = await axios.get<RunningDinner>(url);
  return response.data;
}

export async function updateMealTimesAsync(adminId: string, meals: Array<Meal>): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/mealtimes`);
  const data = {
    meals: cloneDeep(meals)
  };
  const response = await axios.put(url, data);
  return response.data;
}

export async function updateBasicSettingsAsync(adminId: string, basicDetails: RunningDinnerBasicDetailsFormModel): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/basicsettings`);
  // Backend expectes JSON in form:
  // { basicDetails: {}, teamPartnerWishDisabled: true }
  const response = await axios.put(url, {
    basicDetails,
    teamPartnerWishDisabled: basicDetails.teamPartnerWishDisabled
  });
  return response.data;
}

export async function updatePublicSettingsAsync(adminId: string, publicSettings: RunningDinnerPublicSettings): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/publicsettings`);
  const response = await axios.put(url, publicSettings);
  return response.data;
}

export async function updateRegistrationActiveState(adminId: string, enable: boolean): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/publicsettings/registration/${enable}`);
  const response = await axios.put(url);
  return response.data;
}

export async function acknowledgeRunningDinnerAsync(adminId: string, acknowledgeId: string): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/acknowledge/${acknowledgeId}`);
  const response = await axios.put<RunningDinner>(url);
  return response.data;
}

export async function cancelRunningDinnerAsync(adminId: string): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}`);
  const response = await axios.delete<RunningDinner>(url);
  return response.data;
}

export async function reSendRunningDinnerCreatedMessageAsync(adminId: string, reSendRunningDinnerCreatedMessageModel: ReSendRunningDinnerCreatedMessageModel): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/resend-runningdinner-created-message`);
  const response = await axios.put<RunningDinner>(url, reSendRunningDinnerCreatedMessageModel);
  return response.data;
}

export async function updateAfterPartyLocationAsync(adminId: string, afterPartyLocation: AfterPartyLocation): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/afterpartylocation`);
  const response = await axios.put<RunningDinner>(url, afterPartyLocation);
  return response.data;
}

export async function deleteAfterPartyLocationAsync(adminId: string): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/afterpartylocation`);
  const response = await axios.delete<RunningDinner>(url);
  return response.data;
}

export function isClosedDinner(dinner: RunningDinner | CreateRunningDinnerWizardModel): boolean {
  return hasClosedRegistrationType(dinner.basicDetails);
}

export function getDaysFromTodayTillEndOfRegistration(runningDinner: RunningDinner) {
  if (!isClosedDinner(runningDinner) && runningDinner.publicSettings.endOfRegistrationDate) {
    const now = new Date();
    const endOfRegistrationDate = new Date(runningDinner.publicSettings.endOfRegistrationDate);
    return getDaysBetweenDates(endOfRegistrationDate, now);
  }
}

export function isAcknowledgeRequired(runningDinner: RunningDinner) {
  return !runningDinner.acknowledgedDate && runningDinner.runningDinnerType !== CONSTANTS.RUNNING_DINNER_TYPE.DEMO;
}

export function isNotificationRequired(runningDinner: RunningDinner): boolean {
  return isAcknowledgeRequired(runningDinner) || 
         !!runningDinner.cancellationDate || 
         runningDinner.runningDinnerType === CONSTANTS.RUNNING_DINNER_TYPE.DEMO ||
         isDinnerExpired(runningDinner, new Date());
}

export function isDinnerExpired(runningDinner: RunningDinner, now: Date) {
  const dinnerDate = new Date(runningDinner.basicDetails.date);
  return isAfterInDays(now, dinnerDate);
}

export function getMinimumParticipantsNeeded(runningDinnerOptions: RunningDinnerOptions) {
  const numMeals = runningDinnerOptions.meals.length;
  const teamSize = runningDinnerOptions.teamSize;
  return numMeals * numMeals * teamSize;
}

export function isAfterPartyLocationDefined(afterPartyLocation?: AfterPartyLocation) {
  return afterPartyLocation !== undefined && afterPartyLocation != null && isStringNotEmpty(afterPartyLocation.street);
}