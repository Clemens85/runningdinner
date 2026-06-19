import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredPortalToken, storePortalToken, clearStoredPortalToken } from './PortalStorageService';

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

describe('PortalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getStoredCredentials', () => {
    it('returns empty array when storage is empty', () => {
      expect(getStoredCredentials()).toEqual([]);
    });

    it('returns empty array when storage key is missing', () => {
      localStorage.removeItem(STORAGE_KEY);
      expect(getStoredCredentials()).toEqual([]);
    });

    it('returns empty array when storage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json');
      expect(getStoredCredentials()).toEqual([]);
    });

    it('returns stored credentials', () => {
      const creds: PortalCredential[] = [{ role: 'ORGANIZER', adminId: 'admin-1' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
      expect(getStoredCredentials()).toEqual(creds);
    });
  });

  describe('mergeCredentials', () => {
    it('stores credentials when storage is empty', () => {
      const creds: PortalCredential[] = [{ role: 'ORGANIZER', adminId: 'admin-1' }];
      mergeCredentials(creds);
      expect(getStoredCredentials()).toEqual(creds);
    });

    it('deduplicates ORGANIZER credentials by adminId', () => {
      const cred: PortalCredential = { role: 'ORGANIZER', adminId: 'admin-1' };
      mergeCredentials([cred]);
      mergeCredentials([cred]);
      expect(getStoredCredentials()).toHaveLength(1);
    });

    it('deduplicates PARTICIPANT credentials by selfAdminId + participantId composite key', () => {
      const cred: PortalCredential = { role: 'PARTICIPANT', selfAdminId: 'self-1', participantId: 'part-1' };
      mergeCredentials([cred]);
      mergeCredentials([cred]);
      expect(getStoredCredentials()).toHaveLength(1);
    });

    it('keeps PARTICIPANT credentials with different participantId as separate entries', () => {
      mergeCredentials([{ role: 'PARTICIPANT', selfAdminId: 'self-1', participantId: 'part-1' }]);
      mergeCredentials([{ role: 'PARTICIPANT', selfAdminId: 'self-1', participantId: 'part-2' }]);
      expect(getStoredCredentials()).toHaveLength(2);
    });

    it('keeps PARTICIPANT credentials with different selfAdminId as separate entries', () => {
      mergeCredentials([{ role: 'PARTICIPANT', selfAdminId: 'self-1', participantId: 'part-1' }]);
      mergeCredentials([{ role: 'PARTICIPANT', selfAdminId: 'self-2', participantId: 'part-1' }]);
      expect(getStoredCredentials()).toHaveLength(2);
    });

    it('merges multiple credential types together', () => {
      mergeCredentials([{ role: 'ORGANIZER', adminId: 'admin-1' }]);
      mergeCredentials([{ role: 'PARTICIPANT', selfAdminId: 'self-1', participantId: 'part-1' }]);
      expect(getStoredCredentials()).toHaveLength(2);
    });

    it('does not duplicate on repeated merges from portal token resolution', () => {
      const creds: PortalCredential[] = [
        { role: 'PARTICIPANT', selfAdminId: 'self-1', participantId: 'part-1' },
        { role: 'ORGANIZER', adminId: 'admin-1' },
      ];
      mergeCredentials(creds);
      // Simulate user clicking the same link again
      mergeCredentials(creds);
      expect(getStoredCredentials()).toHaveLength(2);
    });
  });

  describe('clearAllCredentials', () => {
    it('removes all stored credentials', () => {
      mergeCredentials([{ role: 'ORGANIZER', adminId: 'admin-1' }]);
      clearAllCredentials();
      expect(getStoredCredentials()).toEqual([]);
    });

    it('removes the storage key entirely', () => {
      mergeCredentials([{ role: 'ORGANIZER', adminId: 'admin-1' }]);
      clearAllCredentials();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('is safe to call when storage is already empty', () => {
      expect(() => clearAllCredentials()).not.toThrow();
    });
  });
});
