import { beforeEach, describe, expect, it } from 'vitest';

import { clearStoredPortalToken, getStoredPortalToken, storePortalToken } from './PortalStorageService';

const STORAGE_KEY = 'runningdinner_portal_token';

describe('PortalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getStoredPortalToken', () => {
    it('returns null when storage is empty', () => {
      expect(getStoredPortalToken()).toBeNull();
    });

    it('returns null when storage key is missing', () => {
      localStorage.removeItem(STORAGE_KEY);
      expect(getStoredPortalToken()).toBeNull();
    });

    it('returns the stored token string', () => {
      localStorage.setItem(STORAGE_KEY, 'my-token-abc');
      expect(getStoredPortalToken()).toBe('my-token-abc');
    });
  });

  describe('storePortalToken', () => {
    it('persists the token in localStorage', () => {
      storePortalToken('token-123');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('token-123');
    });

    it('overwrites an existing token', () => {
      storePortalToken('token-old');
      storePortalToken('token-new');
      expect(getStoredPortalToken()).toBe('token-new');
    });
  });

  describe('clearStoredPortalToken', () => {
    it('removes the stored token', () => {
      storePortalToken('token-123');
      clearStoredPortalToken();
      expect(getStoredPortalToken()).toBeNull();
    });

    it('removes the storage key entirely', () => {
      storePortalToken('token-123');
      clearStoredPortalToken();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('is safe to call when storage is already empty', () => {
      expect(() => clearStoredPortalToken()).not.toThrow();
    });
  });
});
