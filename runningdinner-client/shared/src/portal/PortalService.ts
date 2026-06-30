import axios from 'axios';

import { BackendConfig, isArrayEmpty, PortalCredential } from '..';
import { PortalMessage, PortalMyEventsResponseTO, PortalParticipantInfo } from './PortalTypes';

/**
 * Fetches live event summaries for all events bound to the given portal tokens.
 * The backend resolves events for all supplied tokens and deduplicates by dinner.
 */
export async function fetchMyEvents(portalTokens: string[]): Promise<PortalMyEventsResponseTO> {
  if (isArrayEmpty(portalTokens)) {
    return { events: [] };
  }
  const url = BackendConfig.buildUrl(`/participant-portal/v1/my-events`);
  const response = await axios.post<PortalMyEventsResponseTO>(url, { portalTokens });
  return response.data;
}

export async function requestAccessRecovery(email: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/access-recovery`);
  await axios.post(url, { email });
}

/**
 * Permanently revokes all portal tokens on the backend, invalidating portal email links
 * for all associated email addresses. Called by the "forget me on this device" action.
 * Best-effort — callers should clear localStorage regardless of the outcome.
 */
export async function revokePortalTokens(portalTokens: string[]): Promise<void> {
  if (isArrayEmpty(portalTokens)) {
    return;
  }
  const url = BackendConfig.buildUrl(`/participant-portal/v1/token/revoke`);
  await axios.post(url, { portalTokens });
}

/**
 * Fetches participant self-service availability info for a specific event.
 * The portalToken is passed as a safety guard — the backend validates that the token
 * belongs to the participant before returning data.
 */
export async function fetchParticipantSelfServiceInfo(portalCredential: PortalCredential): Promise<PortalParticipantInfo> {
  const { selfAdminId, participantId, portalToken } = portalCredential;
  const url = BackendConfig.buildUrl(`/participant-portal/v1/${selfAdminId}/${participantId}/self-service-info`);
  const response = await axios.get<PortalParticipantInfo>(url, { params: { portalToken } });
  return response.data;
}

/**
 * Fetches the organizer-sent messages (PARTICIPANT, TEAM, DINNER_ROUTE) for the given participant,
 * ordered by sent date descending.
 * The portalToken is validated server-side against the participant's email.
 */
export async function fetchParticipantMessages(portalCredential: PortalCredential): Promise<PortalMessage[]> {
  const { selfAdminId, participantId, portalToken } = portalCredential;
  const url = BackendConfig.buildUrl(`/participant-portal/v1/${selfAdminId}/${participantId}/messages`);
  const response = await axios.get<PortalMessage[]>(url, { params: { portalToken } });
  return response.data;
}

/**
 * Records that the participant has opened (read) the given message.
 * Fire-and-forget — errors are intentionally swallowed by the caller.
 */
export async function markMessageAsRead(messageTaskId: string, portalCredential: PortalCredential): Promise<void> {
  const { selfAdminId, participantId, portalToken } = portalCredential;
  const url = BackendConfig.buildUrl(`/participant-portal/v1/${selfAdminId}/${participantId}/messages/${messageTaskId}/read`);
  await axios.post(url, null, { params: { portalToken } });
}
