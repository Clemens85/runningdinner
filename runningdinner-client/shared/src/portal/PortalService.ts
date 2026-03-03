import axios from 'axios';

import { BackendConfig } from '..';
import { PortalAccessResponseTO, PortalCredential, PortalMyEventsResponseTO } from './PortalTypes';

export interface ResolvePortalTokenParams {
  confirmPublicDinnerId?: string;
  confirmParticipantId?: string;
  confirmAdminId?: string;
}

export async function resolvePortalToken(portalToken: string, params?: ResolvePortalTokenParams): Promise<PortalAccessResponseTO> {
  let url = BackendConfig.buildUrl(`/participant-portal/v1/token/${portalToken}`);
  const queryParts: string[] = [];
  if (params?.confirmPublicDinnerId) {
    queryParts.push(`confirmPublicDinnerId=${encodeURIComponent(params.confirmPublicDinnerId)}`);
  }
  if (params?.confirmParticipantId) {
    queryParts.push(`confirmParticipantId=${encodeURIComponent(params.confirmParticipantId)}`);
  }
  if (params?.confirmAdminId) {
    queryParts.push(`confirmAdminId=${encodeURIComponent(params.confirmAdminId)}`);
  }
  if (queryParts.length > 0) {
    url = `${url}?${queryParts.join('&')}`;
  }
  const response = await axios.get<PortalAccessResponseTO>(url);
  return response.data;
}

export async function fetchMyEvents(credentials: PortalCredential[]): Promise<PortalMyEventsResponseTO> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/my-events`);
  const response = await axios.post<PortalMyEventsResponseTO>(url, { credentials });
  return response.data;
}

export async function requestAccessRecovery(email: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/access-recovery`);
  await axios.post(url, { email });
}
