import axios from 'axios';

import { BackendConfig } from '..';
import { DinnerRoute, SelfAdminBaseParams, SelfAdminSessionData, SelfAdminTeamNameInfo, SelfAdminTeamParams, SelfAdminUpdateTeamHostRequest, Team } from '../types';

export async function findSelfAdminSessionDataAsync({ selfAdminId, participantId }: SelfAdminBaseParams): Promise<SelfAdminSessionData> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/sessiondata`);
  const response = await axios.get<SelfAdminSessionData>(url);
  return response.data;
}

export async function findSelfAdminTeam({ selfAdminId, participantId, teamId }: SelfAdminTeamParams): Promise<Team> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/team`);
  const response = await axios.get<Team>(url);
  return response.data;
}

export async function updateSelfAdminTeamHost(
  { selfAdminId, participantId, teamId }: SelfAdminTeamParams,
  updateTeamHostRequestData: SelfAdminUpdateTeamHostRequest,
): Promise<Team> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/teamhost`);
  const response = await axios.put<Team>(url, updateTeamHostRequestData);
  return response.data;
}

export async function findSelfAdminTeamNameInfo({ selfAdminId, participantId, teamId }: SelfAdminTeamParams): Promise<SelfAdminTeamNameInfo> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/teamname`);
  const response = await axios.get<SelfAdminTeamNameInfo>(url);
  return response.data;
}

export async function updateSelfAdminTeamName({ selfAdminId, participantId, teamId }: SelfAdminTeamParams, teamName: string): Promise<SelfAdminTeamNameInfo> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/teamname`);
  const response = await axios.put<SelfAdminTeamNameInfo>(url, { teamName });
  return response.data;
}

export async function findSelfAdminDinnerRoute({ selfAdminId, participantId, teamId }: SelfAdminTeamParams): Promise<DinnerRoute> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/${teamId}/dinnerroute`);
  const response = await axios.get<DinnerRoute>(url);
  return response.data;
}

export async function updateSelfTeamPartnerWish({ selfAdminId, participantId }: SelfAdminBaseParams, teamPartnerWishEmail: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/self/v1/${selfAdminId}/${participantId}/teampartnerwish?email=${teamPartnerWishEmail}`);
  await axios.put<Team>(url);
  return;
}
