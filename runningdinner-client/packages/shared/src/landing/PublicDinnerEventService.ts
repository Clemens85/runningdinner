import {BackendIssue, PublicRunningDinner, PublicRunningDinnerList, RegistrationSummary} from "../types";
import axios from "axios";
import {BackendConfig} from "../BackendConfig";
import {RegistrationData} from "../types/Registration";
import {getBackendIssuesFromErrorResponse} from "../issue";
import {isArrayNotEmpty} from "@runningdinner/shared";

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

export async function performRegistrationValidation(publicDinnerId: string, registrationData: RegistrationData): Promise<RegistrationSummary> {
  return executePerformRegistrationRequest(publicDinnerId, registrationData, true);
}

export async function performRegistration(publicDinnerId: string, registrationData: RegistrationData): Promise<RegistrationSummary> {
  return executePerformRegistrationRequest(publicDinnerId, registrationData, false);
}

async function executePerformRegistrationRequest(publicDinnerId: string, registrationData: RegistrationData, validateOnly: boolean) {
  const url = BackendConfig.buildUrl(`/frontend/v2/runningdinner/${publicDinnerId}/register?validateOnly=${validateOnly}`);
  const response = await axios.post<RegistrationSummary>(url, registrationData);
  return response.data;
}

export interface ParticipantActivationResult {
  activationSucceeded: boolean;
  validationIssue?: BackendIssue;
}

export async function activateSubscribedParticipant(publicDinnerId: string, participantId: string): Promise<ParticipantActivationResult> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}/${participantId}/activate`);
  try {
    await axios.put<void>(url, {});
    return { activationSucceeded: true };
  } catch (e) {
    const backendValidationIssues = getBackendIssuesFromErrorResponse(e, true);
    return {
      activationSucceeded: false,
      validationIssue: isArrayNotEmpty(backendValidationIssues) ? backendValidationIssues[0] : undefined
    };
  }
}