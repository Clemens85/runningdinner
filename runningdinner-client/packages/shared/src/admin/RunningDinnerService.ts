import axios from 'axios';
import { BackendConfig } from "../BackendConfig";
import cloneDeep from "lodash/cloneDeep";
import {Meal, RunningDinner} from "../types";
import {CONSTANTS} from "../Constants";
import {getDaysBetweenDates} from '../date';

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

export async function acknowledgeRunningDinnerAsync(adminId: string, acknowledgeId: string): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/acknowledge/${acknowledgeId}`);
  const response = await axios.put<RunningDinner>(url);
  return response.data;
}

export function isClosedDinner(dinner: RunningDinner): boolean {
  const registrationType = dinner.basicDetails.registrationType;
  return registrationType === CONSTANTS.REGISTRATION_TYPE.CLOSED;
}

export function getDaysFromTodayTillEndOfRegistration(runningDinner: RunningDinner) {
  if (!isClosedDinner(runningDinner)) {
    const now = new Date();
    const endOfRegistrationDate = new Date(runningDinner.publicSettings.endOfRegistrationDate);
    return getDaysBetweenDates(endOfRegistrationDate, now);
  }
}

export function isAcknowledgeRequired(runningDinner: RunningDinner) {
  return !runningDinner.acknowledgedDate && runningDinner.runningDinnerType !== CONSTANTS.RUNNING_DINNER_TYPE.DEMO;
}

export function isNotificationRequired(runningDinner: RunningDinner): boolean {
  return isAcknowledgeRequired(runningDinner) || !!runningDinner.cancellationDate || runningDinner.runningDinnerType === CONSTANTS.RUNNING_DINNER_TYPE.DEMO;
}


