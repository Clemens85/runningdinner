import { useQuery } from "@tanstack/react-query";
import { findDinnerRouteByAdminIdAndTeamIdAsync } from "..";

export function useFindDinnerRouteByAdminIdAndTeamId(adminId: string, teamId: string) {
  return useQuery({
    keepPreviousData: true,
    queryFn: () => findDinnerRouteByAdminIdAndTeamIdAsync(adminId, teamId),
    queryKey: ['findDinnerRouteByAdminIdAndTeamId', adminId, teamId],
  });
}