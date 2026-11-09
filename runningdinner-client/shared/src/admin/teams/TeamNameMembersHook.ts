import { useTeamLabel } from '../../TeamLabel';
import { Team } from '../../types';
import { getFullnameList } from '../ParticipantService';

export function useTeamNameMembers(team?: Team) {
  const { getTeamLabel } = useTeamLabel();

  function getTeamNameMembers(team: Team): string {
    const teamLabel = getTeamLabel(team);
    const teamMembers = getFullnameList(team.teamMembers);
    return `${teamLabel} (${teamMembers})`;
  }

  const teamNameMembers = team ? getTeamNameMembers(team) : undefined;

  return { teamNameMembers, getTeamNameMembers };
}
