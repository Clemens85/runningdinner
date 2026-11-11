/**
 * Custom team names are validated and normalized exclusively in the backend (TeamNameUtil.java).
 * Validation errors are shown at the form field via the backend issue handling.
 */
type HasTeamName = { teamName?: string | null };

export function hasCustomTeamName(team?: HasTeamName | null): boolean {
  return !!team?.teamName && team.teamName.trim().length > 0;
}

/**
 * @returns The custom team name or an empty string if the team has none
 */
export function getCustomTeamName(team?: HasTeamName | null): string {
  return hasCustomTeamName(team) ? team!.teamName!.trim() : '';
}
