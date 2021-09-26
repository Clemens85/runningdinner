import {PublicRunningDinner, PublicRunningDinnerList} from "../types";
import axios from "axios";
import {BackendConfig} from "../BackendConfig";

export async function findPublicRunningDinnersAsync(): Promise<PublicRunningDinner[]> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner`);
  const response = await axios.get<PublicRunningDinnerList>(url);
  return response.data.publicRunningDinners;
}

export async function findPublicRunningDinnerByPublicId(publicDinnerId: string): Promise<PublicRunningDinner> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}`);
  const response = await axios.get<PublicRunningDinner>(url);
  return response.data;
}