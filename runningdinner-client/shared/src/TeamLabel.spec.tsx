import { cleanup, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TeamLabel, TeamLabelFormat, useTeamLabel } from './TeamLabel';

// Translations are mocked to render "key[param=value,...]" so that the tests do not depend on the translation texts
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params
        ? `${key}[${Object.entries(params)
            .map(([k, v]) => `${k}=${v}`)
            .join(',')}]`
        : key,
  }),
}));

afterEach(cleanup);

const TEAM_WITHOUT_NAME = { teamNumber: 3 };
const TEAM_WITH_NAME = { teamNumber: 3, teamName: 'Die Gourmets' };

describe('useTeamLabel', () => {
  function getLabel(team: { teamNumber: number; teamName?: string }, format?: TeamLabelFormat) {
    const { result } = renderHook(() => useTeamLabel());
    return result.current.getTeamLabel(team, { format });
  }

  it('uses number and name by default', () => {
    expect(getLabel(TEAM_WITH_NAME)).toBe('team_with_name[teamNumber=3,teamName=Die Gourmets]');
    expect(getLabel(TEAM_WITHOUT_NAME)).toBe('team[teamNumber=3]');
  });

  it('NAME_OR_NUMBER falls back to the number', () => {
    expect(getLabel(TEAM_WITH_NAME, TeamLabelFormat.NAME_OR_NUMBER)).toBe('Die Gourmets');
    expect(getLabel(TEAM_WITHOUT_NAME, TeamLabelFormat.NAME_OR_NUMBER)).toBe('team[teamNumber=3]');
  });

  it('NUMBER_ONLY ignores the custom name', () => {
    expect(getLabel(TEAM_WITH_NAME, TeamLabelFormat.NUMBER_ONLY)).toBe('team[teamNumber=3]');
  });
});

describe('useTeamLabel maxNameLength', () => {
  const LONG_NAME_TEAM = { teamNumber: 3, teamName: 'Die allerbesten Gourmets der ganzen Stadt' };

  function getLabel(team: { teamNumber: number; teamName?: string }, format: TeamLabelFormat, maxNameLength?: number) {
    const { result } = renderHook(() => useTeamLabel());
    return result.current.getTeamLabel(team, { format, maxNameLength });
  }

  it('shortens only the name', () => {
    expect(getLabel(LONG_NAME_TEAM, TeamLabelFormat.NAME_OR_NUMBER, 20)).toBe('Die allerbesten G...');
    expect(getLabel(LONG_NAME_TEAM, TeamLabelFormat.NUMBER_AND_NAME, 20)).toBe('team_with_name[teamNumber=3,teamName=Die allerbesten G...]');
  });

  it('keeps short names and names without limit', () => {
    expect(getLabel(TEAM_WITH_NAME, TeamLabelFormat.NAME_OR_NUMBER, 20)).toBe('Die Gourmets');
    expect(getLabel(LONG_NAME_TEAM, TeamLabelFormat.NAME_OR_NUMBER)).toBe('Die allerbesten Gourmets der ganzen Stadt');
  });

  it('never shortens the team number', () => {
    expect(getLabel(LONG_NAME_TEAM, TeamLabelFormat.NUMBER_ONLY, 5)).toBe('team[teamNumber=3]');
  });
});

describe('TeamLabel', () => {
  it('shows the full label as tooltip if the name was shortened', () => {
    render(<TeamLabel team={{ teamNumber: 3, teamName: 'Die allerbesten Gourmets der ganzen Stadt' }} format={TeamLabelFormat.NAME_OR_NUMBER} maxNameLength={20} />);
    expect(screen.getByText('Die allerbesten G...')).toHaveAttribute('title', 'Die allerbesten Gourmets der ganzen Stadt');
  });

  it('renders the label', () => {
    render(<TeamLabel team={TEAM_WITH_NAME} format={TeamLabelFormat.NAME_OR_NUMBER} />);
    expect(screen.getByText('Die Gourmets')).toBeInTheDocument();
  });
});
