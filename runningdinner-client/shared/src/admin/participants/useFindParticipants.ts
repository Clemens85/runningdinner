import { useQuery } from "@tanstack/react-query";
import { findParticipantsAsync } from "..";

export function useFindParticipants(adminId: string) {

  return useQuery({
    keepPreviousData: true,
    queryFn: () => findParticipantsAsync(adminId),
    queryKey: ['findParticipants', adminId],
  });
}