import { beforeEach, describe, expect, it } from 'vitest';

import { clearAllPortalTokens, getStoredPortalTokens, storePortalToken } from './PortalStorageService';

const STORAGE_KEY = 'runningdinner_portal_tokens';
const LEGACY_KEY = 'runningdinner_portal_token';

describe('PortalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getStoredPortalTokens', () => {
    it('returns empty array when storage is empty', () => {
      expect(getStoredPortalTokens()).toEqual([]);
    });

    it('returns all stored tokens', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['token-a', 'token-b']));
      expect(getStoredPortalTokens()).toEqual(['token-a', 'token-b']);
    });

    it('returns empty array when stored value is invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json');
      expect(getStoredPortalTokens()).toEqual([]);
    });

    it('migrates a legacy single-token entry on first read', () => {
      localStorage.setItem(LEGACY_KEY, 'legacy-token');
      expect(getStoredPortalTokens()).toContain('legacy-token');
      expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    });

    it('does not duplicate when legacy token is already in the new array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['legacy-token']));
      localStorage.setItem(LEGACY_KEY, 'legacy-token');
      expect(getStoredPortalTokens()).toEqual(['legacy-token']);
      expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    });
  });

  describe('storePortalToken', () => {
    it('adds a token to the list', () => {
      storePortalToken('token-1');
      expect(getStoredPortalTokens()).toContain('token-1');
    });

    it('stores multiple distinct tokens', () => {
      storePortalToken('token-a');
      storePortalToken('token-b');
      expect(getStoredPortalTokens()).toEqual(['token-a', 'token-b']);
    });

    it('does not add a duplicate token', () => {
      storePortalToken('token-x');
      storePortalToken('token-x');
      expect(getStoredPortalTokens()).toEqual(['token-x']);
    });
  });

  describe('clearAllPortalTokens', () => {
    it('removes all stored tokens', () => {
      storePortalToken('token-1');
      storePortalToken('token-2');
      clearAllPortalTokens();
      expect(getStoredPortalTokens()).toEqual([]);
    });

    it('also removes a legacy token if present', () => {
      localStorage.setItem(LEGACY_KEY, 'old-token');
      clearAllPortalTokens();
      expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    });

    it('is safe to call when storage is already empty', () => {
      expect(() => clearAllPortalTokens()).not.toThrow();
    });
  });
});
