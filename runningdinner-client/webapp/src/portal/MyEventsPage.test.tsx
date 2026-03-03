import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyEventsPage } from './MyEventsPage';

// Mock shared module for useMyEvents and storage functions
vi.mock('@runningdinner/shared', async () => {
  const actual = await vi.importActual('@runningdinner/shared');
  return {
    ...actual,
    useMyEvents: vi.fn(),
    clearAllCredentials: vi.fn(),
    requestAccessRecovery: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock react-router-dom navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

import { useMyEvents } from '@runningdinner/shared';
const mockUseMyEvents = vi.mocked(useMyEvents);

describe('MyEventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when fetching', () => {
    mockUseMyEvents.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
    } as any);

    render(<MyEventsPage />);
    // CircularProgress renders an svg role="progressbar" or just check the spinner
    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('shows error message on error', () => {
    mockUseMyEvents.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
    } as any);

    render(<MyEventsPage />);
    expect(screen.getByText('my_events_error')).toBeDefined();
  });

  it('renders event list when events are present', () => {
    mockUseMyEvents.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        events: [
          {
            eventName: 'Running Dinner Münster 2026',
            eventDate: '2026-05-15',
            city: 'Münster',
            role: 'PARTICIPANT' as const,
            adminUrl: null,
          },
        ],
      },
    } as any);

    render(<MyEventsPage />);
    expect(screen.getByText('Running Dinner Münster 2026')).toBeDefined();
  });

  it('shows empty state when no events are returned', () => {
    mockUseMyEvents.mockReturnValue({
      isPending: false,
      isError: false,
      data: { events: [] },
    } as any);

    render(<MyEventsPage />);
    expect(screen.getByText('my_events_empty')).toBeDefined();
    // Recovery form should be visible
    expect(screen.getByText('access_recovery_submit')).toBeDefined();
  });

  it('shows empty state when there are no stored credentials (disabled query)', () => {
    mockUseMyEvents.mockReturnValue({
      isPending: false,
      isError: false,
      data: undefined,
    } as any);

    render(<MyEventsPage />);
    // No events and no error → empty state
    expect(screen.getByText('my_events_empty')).toBeDefined();
  });
});
