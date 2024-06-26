import {
  HttpError,
  isNumSeatsPositiveIntegerOrEmpty,
  newHttpError,
  ParticipantActivationResult,
  PublicRunningDinner,
  PublicRunningDinnerList, RegistrationOrder,
  RegistrationSummary, RunningDinnerSessionData
} from "../types";
import axios from "axios";
import {BackendConfig} from "../BackendConfig";
import {RegistrationData} from "../types/Registration";
import {getBackendIssuesFromErrorResponse} from "../issue";
import {isArrayNotEmpty, trimStringsInObject} from "..";

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

async function executePerformRegistrationRequest(publicDinnerId: string, registrationData: RegistrationData, validateOnly: boolean): Promise<RegistrationSummary> {
  let url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}/register`);
  if (validateOnly) {
    url += '/validate';
  }
  if (!isNumSeatsPositiveIntegerOrEmpty(registrationData)) { // TODO: Not very nice, but it works for now. Should be replaced by client side validation
    throw newHttpError(406, [{
      field: "numSeats",
      message: "num_seats_invalid"
    }]);
  }

  const registrationDataWithTrimmedStringFields = trimStringsInObject(registrationData);

  const response = await axios.post<RegistrationSummary>(url, registrationDataWithTrimmedStringFields);
  return response.data;
}

export async function activateSubscribedParticipant(publicDinnerId: string, participantId: string): Promise<ParticipantActivationResult> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}/${participantId}/activate`);
  try {
    const response = await axios.put<ParticipantActivationResult>(url, {});
    return response.data;
  } catch (e) {
    const backendValidationIssues = getBackendIssuesFromErrorResponse(e as HttpError, true);
    return {
      validationIssue: isArrayNotEmpty(backendValidationIssues) ? backendValidationIssues[0] : undefined
    };
  }
}

export async function findRunningDinnerSessionDataByPublicId(publicDinnerId: string): Promise<RunningDinnerSessionData> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}/sessiondata`);
  const response = await axios.get<RunningDinnerSessionData>(url);
  return response.data;
}

export async function createRegistrationOrder(publicDinnerId: string, registrationData: RegistrationData): Promise<RegistrationOrder> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}/order`);
  const response = await axios.post<RegistrationOrder>(url, registrationData);
  return response.data;
}

export async function captureRegistrationOrder(publicDinnerId: string, token: string): Promise<RegistrationData> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}/order/capture?token=${token}`);
  const response = await axios.get<RegistrationData>(url);
  return response.data;
}

export async function cancelRegistrationOrder(publicDinnerId: string, token: string): Promise<RegistrationData> {
  const url = BackendConfig.buildUrl(`/frontend/v1/runningdinner/${publicDinnerId}/order/cancel?token=${token}`);
  const response = await axios.get<RegistrationData>(url);
  return response.data;
}

export async function finalizeRegistrationOrder(publicDinnerId: string, token: string, capturePayment: boolean) {
  if (capturePayment) {
    return captureRegistrationOrder(publicDinnerId, token);
  } else {
    return cancelRegistrationOrder(publicDinnerId, token);
  }
}