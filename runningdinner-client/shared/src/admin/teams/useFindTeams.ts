import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { findTeamsAsync } from "..";
import { Team, exchangeEntityInList } from "../..";

export function useFindTeams(adminId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findTeamsAsync(adminId),
    queryKey: ['findTeams', adminId],
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

  return {
    updateTeams,
    exchangeTeams
  }
}