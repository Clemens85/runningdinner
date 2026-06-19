const STORAGE_KEY = 'runningdinner_portal_token';

/**
 * Returns the portal token stored in localStorage, or null if none is stored.
 * The token is the single credential the frontend holds. All event data is resolved
 * server-side by submitting this token — no raw adminIds or participant UUIDs are stored.
 */
export function getStoredPortalToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Persists the portal token in localStorage.
 * Overwrites any previously stored token (one token per browser, covering all events for the email).
 */
export function storePortalToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

/**
 * Removes the portal token from localStorage entirely.
 * Used by the "forget me on this device" action.
 */
export function clearStoredPortalToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}
