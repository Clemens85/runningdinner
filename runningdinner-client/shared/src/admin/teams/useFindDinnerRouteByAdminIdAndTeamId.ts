import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { findDinnerRouteByAdminIdAndTeamIdAsync } from "../dinnerroute";

export function useFindDinnerRouteByAdminIdAndTeamId(adminId: string, teamId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findDinnerRouteByAdminIdAndTeamIdAsync(adminId, teamId),
    queryKey: ['findDinnerRouteByAdminIdAndTeamId', adminId, teamId],
  });
}