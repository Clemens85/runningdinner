import {BackendConfig, LabelValue, RunningDinner} from "@runningdinner/shared";
import axios from "axios";
import find from "lodash/find";

export async function findRegistrationTypesAsync(): Promise<LabelValue[]> {
  const url = BackendConfig.buildUrl(`/masterdataservice/v1/registrationtypes`);
  const response = await axios.get<LabelValue[]>(url);
  return response.data;
}

export async function findGenderAspectsAsync(): Promise<LabelValue[]> {
  const url = BackendConfig.buildUrl(`/masterdataservice/v1/genderaspects`);
  const response = await axios.get<LabelValue[]>(url);
  return response.data;
}

export async function findGendersAsync(): Promise<LabelValue[]> {
  const url = BackendConfig.buildUrl(`/masterdataservice/v1/genders`);
  const response = await axios.get<LabelValue[]>(url);
  return response.data;
}

export function getByValue(value: string, labelValues: LabelValue[]): LabelValue | undefined {
  const result = find(labelValues, ['value', value]);
  return result;
}
