import { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { BaseTeam } from './types';
import { getCustomTeamName } from './types/TeamName';
import { getTruncatedText } from './Utils';

export type TeamLabelData = Pick<BaseTeam, 'teamNumber' | 'teamName'>;

/**
 * Central definition of how a team is displayed. Always use TeamLabel / useTeamLabel instead of building team labels by hand.
 */
export enum TeamLabelFormat {
  /** "Team 3 – Die Gourmets" or just "Team 3" if there is no custom name. Default, mainly for admin views. */
  NUMBER_AND_NAME = 'NUMBER_AND_NAME',
  /** "Die Gourmets" or "Team 3" if there is no custom name. */
  NAME_OR_NUMBER = 'NAME_OR_NUMBER',
  /** "Team 3" */
  NUMBER_ONLY = 'NUMBER_ONLY',
}

export type TeamLabelOptions = {
  /** Defaults to {@link TeamLabelFormat.NUMBER_AND_NAME} */
  format?: TeamLabelFormat;
  /**
   * If set, a custom team name longer than this number of characters is shortened with an ellipsis ("..."). The team number is never shortened.
   * Useful for places with limited space.
   */
  maxNameLength?: number;
};

export function useTeamLabel() {
  const { t } = useTranslation('admin');

  const getTeamLabel = useCallback(
    (team: TeamLabelData, options?: TeamLabelOptions): string => {
      const format = options?.format ?? TeamLabelFormat.NUMBER_AND_NAME;
      let teamName = getCustomTeamName(team);
      if (options?.maxNameLength) {
        teamName = getTruncatedText(teamName, options.maxNameLength);
      }
      const numberLabel = t('team', { teamNumber: team.teamNumber });
      switch (format) {
        case TeamLabelFormat.NAME_OR_NUMBER:
          return teamName || numberLabel;
        case TeamLabelFormat.NUMBER_ONLY:
          return numberLabel;
        case TeamLabelFormat.NUMBER_AND_NAME:
        default:
          return teamName ? t('team_with_name', { teamNumber: team.teamNumber, teamName }) : numberLabel;
      }
    },
    [t],
  );

  return { getTeamLabel };
}

export type TeamLabelProps = {
  team: TeamLabelData;
} & TeamLabelOptions;

export function TeamLabel({ team, format, maxNameLength }: TeamLabelProps): ReactNode {
  const { getTeamLabel } = useTeamLabel();
  const label = getTeamLabel(team, { format, maxNameLength });
  if (!maxNameLength) {
    return <>{label}</>;
  }
  const fullLabel = getTeamLabel(team, { format });
  // Show the complete label as native tooltip if it was shortened
  return fullLabel !== label ? <span title={fullLabel}>{label}</span> : <>{label}</>;
}
