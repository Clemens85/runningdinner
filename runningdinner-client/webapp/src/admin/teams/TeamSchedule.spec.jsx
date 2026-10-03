import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TeamSchedule from './TeamSchedule';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock('../AdminNavigationHook', () => ({
  useAdminNavigation: () => ({ generateTeamDinnerRoutePath: () => '/route', generateTeamPath: () => '/team' }),
}));
vi.mock('../../common/theme/typography/Tags', () => ({
  SmallTitle: ({ children }) => <span>{children}</span>,
  Span: ({ children }) => <span>{children}</span>,
  Title: ({ children }) => <span>{children}</span>,
}));

afterEach(cleanup);

function renderSchedule({ requiresAccess = true, accessible = true, seats = 6, cancelled = false } = {}) {
  const meal = { id: 'starter', label: 'Starter', time: new Date(2026, 10, 1, 18) };
  const member = { id: 'member', firstnamePart: 'Alex', lastname: 'Example', requiresAccessibleHome: requiresAccess, numSeats: 6, homeAccessible: true };
  const currentTeam = { id: 'current', teamNumber: 1, status: 'OK', meal, teamMembers: [member], hostTeamMember: member };
  const host = { id: 'host', firstnamePart: 'Sam', lastname: 'Example', requiresAccessibleHome: false, homeAccessible: accessible, numSeats: seats };
  const visitedTeam = {
    id: 'visited',
    teamNumber: 2,
    status: cancelled ? 'CANCELLED' : 'OK',
    meal: { ...meal, id: 'main', label: 'Main', time: new Date(2026, 10, 1, 19) },
    teamMembers: [host],
    hostTeamMember: host,
    meetedTeams: [],
  };
  render(
    <TeamSchedule
      adminId="admin"
      numSeatsNeededForHost={6}
      isTeamMeetingPlanLoading={false}
      teamMeetingPlanResult={{ team: currentTeam, hostTeams: [visitedTeam], guestTeams: [] }}
    />,
  );
}

describe('Team schedule accessibility', () => {
  it('marks fulfilled access at the own and visited stops', () => {
    renderSchedule();
    expect(screen.getAllByText('accessibility_route_stop_fulfilled')).toHaveLength(2);
    expect(screen.queryByText('accessibility_route_stop_unfulfilled')).not.toBeInTheDocument();
  });

  it('warns when the visited host does not provide accessible access', () => {
    renderSchedule({ accessible: false });
    expect(screen.getByText('accessibility_route_stop_unfulfilled')).toBeInTheDocument();
  });

  it('warns when the accessible host lacks sufficient seats', () => {
    renderSchedule({ seats: 5 });
    expect(screen.getByText('accessibility_route_stop_unfulfilled')).toBeInTheDocument();
  });

  it('omits all statuses when the current team has no access need', () => {
    renderSchedule({ requiresAccess: false });
    expect(screen.queryByText('accessibility_route_stop_fulfilled')).not.toBeInTheDocument();
    expect(screen.queryByText('accessibility_route_stop_unfulfilled')).not.toBeInTheDocument();
  });

  it('does not add an access warning to a cancelled stop', () => {
    renderSchedule({ cancelled: true, accessible: false });
    expect(screen.queryByText('accessibility_route_stop_unfulfilled')).not.toBeInTheDocument();
  });
});
