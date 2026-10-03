import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MyTeamSection } from './MyTeamSection';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

afterEach(cleanup);

function renderTeam(accessibility = {}) {
  const info = {
    mealLabel: 'Starter', mealTime: new Date(2026, 10, 1, 18),
    teamPartnerName: 'Sam Example', teamPartnerEmail: null, teamPartnerMobileNumber: null,
    hostName: 'Sam Example', manageTeamHostingUrl: '/hosting', selfIsHost: false, fixedTeamPartner: false,
    teamPartnerMealSpecifics: null, likelyGuestMealSpecifics: null, teamPartnerCancelled: false,
    selfRequiresAccessibleHome: false, teamPartnerCanHostAccessibly: false, teamPartnerRequiresAccessibleHome: false,
    ...accessibility,
  };
  render(<MyTeamSection participantInfo={{ teamSelfServiceInfo: info }} isLoading={false} />);
}

describe('Portal team accessibility', () => {
  it('shows the partner hosting option when the viewer needs access', () => {
    renderTeam({ selfRequiresAccessibleHome: true, teamPartnerCanHostAccessibly: true });
    expect(screen.getByText('participant_event_team_partner_access_available')).toBeInTheDocument();
    expect(screen.queryByText('participant_event_team_partner_access_required')).not.toBeInTheDocument();
  });

  it('shows unconfirmed access only when the viewer needs it', () => {
    renderTeam({ selfRequiresAccessibleHome: true });
    expect(screen.getByText('participant_event_team_partner_access_unconfirmed')).toBeInTheDocument();
  });

  it.each([false, true])('hides unconfirmed partner access when the viewer hosts, with partner need %s', (partnerNeedsAccess) => {
    renderTeam({ selfIsHost: true, selfRequiresAccessibleHome: true, teamPartnerRequiresAccessibleHome: partnerNeedsAccess });
    expect(screen.queryByText('participant_event_team_partner_access_unconfirmed')).not.toBeInTheDocument();
    if (partnerNeedsAccess) {
      expect(screen.getByText('participant_event_team_partner_access_required')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('participant_event_team_partner_access_required')).not.toBeInTheDocument();
    }
  });

  it('shows a partner access need independently of the viewer need', () => {
    renderTeam({ teamPartnerRequiresAccessibleHome: true });
    expect(screen.getByText('participant_event_team_partner_access_required')).toBeInTheDocument();
    expect(screen.queryByText('participant_event_team_partner_access_unconfirmed')).not.toBeInTheDocument();
  });

  it('adds no accessibility content when neither participant needs it', () => {
    renderTeam({ teamPartnerCanHostAccessibly: true });
    expect(screen.queryByText('participant_event_team_partner_access_available')).not.toBeInTheDocument();
    expect(screen.queryByText('participant_event_team_partner_access_unconfirmed')).not.toBeInTheDocument();
    expect(screen.queryByText('participant_event_team_partner_access_required')).not.toBeInTheDocument();
  });

  it('omits partner access information when the partner is cancelled', () => {
    renderTeam({ teamPartnerCancelled: true, selfRequiresAccessibleHome: true, teamPartnerRequiresAccessibleHome: true });
    expect(screen.queryByText('participant_event_team_partner_access_unconfirmed')).not.toBeInTheDocument();
    expect(screen.queryByText('participant_event_team_partner_access_required')).not.toBeInTheDocument();
  });
});