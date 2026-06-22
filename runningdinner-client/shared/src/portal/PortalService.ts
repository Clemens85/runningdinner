import axios from 'axios';

import { BackendConfig, isArrayEmpty } from '..';
import { PortalMyEventsResponseTO } from './PortalTypes';

export interface ConfirmPortalEventParams {
  confirmPublicDinnerId?: string;
  confirmParticipantId?: string;
  confirmAdminId?: string;
}

/**
 * Validates the portal token (GET, no side effects).
 * Safe to call on page load — email link-preview scanners issue GETs and must not
 * be able to trigger confirmation as a side effect.
 */
export async function validatePortalToken(portalToken: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/token/${portalToken}`);
  await axios.get(url);
}

/**
 * Performs an idempotent event confirmation via POST.
 * Only called after the user has actually loaded the activation page (i.e. shown intent),
 * not reachable by email scanner prefetching.
 */
export async function confirmPortalEvent(portalToken: string, params: ConfirmPortalEventParams): Promise<void> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/token/${portalToken}/confirm`);
  await axios.post(url, params);
}

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
