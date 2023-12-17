import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { findTeamMeetingPlanAsync } from "..";

export function useFindTeamMeetingPlan(adminId: string, teamId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: ['findTeamMeetingPlan', adminId, teamId],
    queryFn: () => findTeamMeetingPlanAsync(adminId, teamId),
    staleTime: 0
  });
}