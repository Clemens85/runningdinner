import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import { exchangeEntityInList, Team } from '../..';
import { findTeamsAsync } from '..';

export function useFindTeams(adminId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findTeamsAsync(adminId),
    queryKey: ['findTeams', adminId],
    refetchOnMount: 'always',
  });
}

export function useUpdateFindTeamsQueryData(adminId: string) {
  const queryClient = useQueryClient();

  function updateTeams(updatedTeams: Team[]) {
    queryClient.setQueryData(['findTeams', adminId], updatedTeams);
  }

  function exchangeTeams(teams: Team[]) {
    let allTeams = queryClient.getQueryData<Team[]>(['findTeams', adminId]);
    for (let i = 0; i < teams.length; i++) {
      const affectedTeam = teams[i];
      allTeams = exchangeEntityInList(allTeams, affectedTeam);
    }
    updateTeams(allTeams || []);
    return allTeams;
  }

  /**
   * Meeting plans and dinner routes contain (copies of) other teams, so they must be reloaded when a team's data (e.g. its name) changed
   */
  function invalidateTeamDependentQueries() {
    queryClient.invalidateQueries({ queryKey: ['findTeamMeetingPlan', adminId] });
    queryClient.invalidateQueries({ queryKey: ['findDinnerRouteByAdminIdAndTeamId', adminId] });
  }

  return {
    updateTeams,
    exchangeTeams,
    invalidateTeamDependentQueries,
  };
}
