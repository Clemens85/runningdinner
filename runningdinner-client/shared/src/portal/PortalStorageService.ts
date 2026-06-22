const STORAGE_KEY = 'runningdinner_portal_tokens';
const LEGACY_STORAGE_KEY = 'runningdinner_portal_token';

function readTokensRaw(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Returns all portal tokens stored on this device.
 * Automatically migrates a legacy single-token entry to the new array format on first call.
 */
export function getStoredPortalTokens(): string[] {
  const current = readTokensRaw();
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) {
    return current;
  }
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  if (current.includes(legacy)) {
    return current;
  }
  const merged = [...current, legacy];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Adds a portal token to the device storage.
 * Has no effect if the token is already stored (idempotent).
 */
export function storePortalToken(token: string): void {
  const current = getStoredPortalTokens();
  if (!current.includes(token)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, token]));
  }
}

/**
 * Removes all portal tokens from this device.
 * Used by the "forget me on this device" action.
 */
export function clearAllPortalTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}
