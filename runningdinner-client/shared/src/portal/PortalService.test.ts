import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { BackendConfig } from '../BackendConfig';
import { resolvePortalToken, fetchMyEvents, requestAccessRecovery } from './PortalService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

vi.mock('../BackendConfig', () => ({
  BackendConfig: {
    buildUrl: (path: string) => `http://localhost${path}`,
  },
}));

const TOKEN = 'test-token-abc';

describe('PortalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolvePortalToken', () => {
    it('calls correct URL without params', async () => {
      const mockResponse = { data: { credentials: [] } };
      mockedAxios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await resolvePortalToken(TOKEN);

      expect(mockedAxios.get).toHaveBeenCalledWith(`http://localhost/rest/participant-portal/v1/token/${TOKEN}`);
      expect(result).toEqual({ credentials: [] });
    });

    it('appends confirmation query params when provided', async () => {
      const mockResponse = { data: { credentials: [] } };
      mockedAxios.get = vi.fn().mockResolvedValue(mockResponse);

      await resolvePortalToken(TOKEN, {
        confirmPublicDinnerId: 'pub-123',
        confirmParticipantId: 'part-456',
      });

      const calledUrl = (mockedAxios.get as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('confirmPublicDinnerId=pub-123');
      expect(calledUrl).toContain('confirmParticipantId=part-456');
    });

    it('appends confirmAdminId when provided', async () => {
      const mockResponse = { data: { credentials: [] } };
      mockedAxios.get = vi.fn().mockResolvedValue(mockResponse);

      await resolvePortalToken(TOKEN, { confirmAdminId: 'admin-xyz' });

      const calledUrl = (mockedAxios.get as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('confirmAdminId=admin-xyz');
    });
  });

  describe('requestAccessRecovery', () => {
    it('posts to correct URL with email body', async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await requestAccessRecovery('user@example.com');

      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost/rest/participant-portal/v1/access-recovery', { email: 'user@example.com' });
    });

    it('handles error response gracefully (does not throw)', async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await expect(requestAccessRecovery('user@example.com')).resolves.not.toThrow();
    });
  });

  describe('fetchMyEvents', () => {
    it('posts credentials to correct URL', async () => {
      const mockResponse = { data: { events: [] } };
      mockedAxios.post = vi.fn().mockResolvedValue(mockResponse);
      const credentials = [{ role: 'ORGANIZER' as const, adminId: 'admin-1' }];

      const result = await fetchMyEvents(credentials);

      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost/rest/participant-portal/v1/my-events', { credentials });
      expect(result).toEqual({ events: [] });
    });
  });
});
