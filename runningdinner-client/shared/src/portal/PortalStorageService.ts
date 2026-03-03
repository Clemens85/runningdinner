import { type PortalCredential, type OrganizerPortalCredential, type ParticipantPortalCredential } from './PortalTypes';

const STORAGE_KEY = 'runningdinner_portal_credentials';

/**
 * Returns all portal credentials currently stored in localStorage.
 * Returns an empty array if nothing is stored or the stored value is invalid.
 */
export function getStoredCredentials(): PortalCredential[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as PortalCredential[];
  } catch {
    return [];
  }
}

/**
 * Merges incoming credentials into localStorage, deduplicating by the natural key:
 * - PARTICIPANT: composite key of selfAdminId + participantId
 * - ORGANIZER: adminId
 */
export function mergeCredentials(incoming: PortalCredential[]): void {
  const existing = getStoredCredentials();
  const merged = [...existing];

  for (const cred of incoming) {
    const isDuplicate = merged.some((existing) => isSameCredential(existing, cred));
    if (!isDuplicate) {
      merged.push(cred);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

/**
 * Removes the portal credentials key from localStorage entirely.
 * Used by the "forget me on this device" action.
 */
export function clearAllCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function isSameCredential(a: PortalCredential, b: PortalCredential): boolean {
  if (a.role !== b.role) {
    return false;
  }
  if (a.role === 'PARTICIPANT' && b.role === 'PARTICIPANT') {
    const pa = a as ParticipantPortalCredential;
    const pb = b as ParticipantPortalCredential;
    return pa.selfAdminId === pb.selfAdminId && pa.participantId === pb.participantId;
  }
  if (a.role === 'ORGANIZER' && b.role === 'ORGANIZER') {
    const oa = a as OrganizerPortalCredential;
    const ob = b as OrganizerPortalCredential;
    return oa.adminId === ob.adminId;
  }
  return false;
}
