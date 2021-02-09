import axios from 'axios';
import { BackendConfig } from "../BackendConfig";
import cloneDeep from "lodash/cloneDeep";
import {Meal, RunningDinner} from "../types";
import {CONSTANTS} from "../Constants";

async function findRunningDinnerAsync(adminId: string): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}`);
  const response = await axios.get<RunningDinner>(url);
  return response.data;
}

async function updateMealTimesAsync(adminId: string, meals: Array<Meal>): Promise<RunningDinner> {
  const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/mealtimes`);
  const data = {
    meals: cloneDeep(meals)
  };
  const response = await axios.put(url, data);
  return response.data;
}

function isClosedDinner(dinner: RunningDinner): boolean {
  const registrationType = dinner.basicDetails.registrationType;
  return registrationType === CONSTANTS.REGISTRATION_TYPE.CLOSED;
}

export {
  findRunningDinnerAsync,
  updateMealTimesAsync,
  isClosedDinner
}
