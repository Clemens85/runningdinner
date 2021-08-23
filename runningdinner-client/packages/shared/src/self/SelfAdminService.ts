import axios from "axios";
import {
  DinnerRoute,
  SelfAdminBaseParams,
  SelfAdminSessionData,
  SelfAdminTeamParams,
  SelfAdminUpdateTeamHostRequest,
  Team
} from "../types";
import { BackendConfig } from "..";

export async function findSelfAdminSessionDataAsync({selfAdminId, participantId}: SelfAdminBaseParams): Promise<SelfAdminSessionData> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/sessiondata`);
  const response = await axios.get<SelfAdminSessionData>(url);
  return response.data;
}

export async function findSelfAdminTeam({selfAdminId, participantId, teamId}: SelfAdminTeamParams): Promise<Team> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/team`);
  const response = await axios.get<Team>(url);
  return response.data;
}

export async function updateSelfAdminTeamHost({selfAdminId, participantId, teamId}: SelfAdminTeamParams, updateTeamHostRequestData: SelfAdminUpdateTeamHostRequest): Promise<Team> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/teamhost`);
  const response = await axios.put<Team>(url, updateTeamHostRequestData);
  return response.data;
}

export async function findSelfAdminDinnerRoute({selfAdminId, participantId, teamId}: SelfAdminTeamParams): Promise<DinnerRoute> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/dinnerroute`);
  const response = await axios.get<DinnerRoute>(url);
  return response.data;
}
