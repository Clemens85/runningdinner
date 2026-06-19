import axios from 'axios';

import { BackendConfig } from '..';
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
 * Fetches live event summaries for all events bound to the given portal token.
 * The token is the only credential sent — no raw adminIds or participant UUIDs leave the browser.
 */
export async function fetchMyEvents(portalToken: string): Promise<PortalMyEventsResponseTO> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/my-events`);
  const response = await axios.post<PortalMyEventsResponseTO>(url, { portalToken });
  return response.data;
}

export async function requestAccessRecovery(email: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/access-recovery`);
  await axios.post(url, { email });
}

/**
 * Permanently revokes the portal token on the backend, invalidating all portal email links
 * for this email address. Called by the "forget me on this device" action.
 * Best-effort — callers should clear localStorage regardless of the outcome.
 */
export async function revokePortalToken(portalToken: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/participant-portal/v1/token/${portalToken}`);
  await axios.delete(url);
}
