import axios from 'axios';

import { BackendConfig, isArrayEmpty } from '..';
import { PortalMyEventsResponseTO } from './PortalTypes';

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
