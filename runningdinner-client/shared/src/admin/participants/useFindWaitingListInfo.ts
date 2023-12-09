import { useQuery } from "@tanstack/react-query";
import { findWaitingListInfoAsync } from ".";

export function useFindWaitingListInfo(adminId: string) {

  return useQuery({
    keepPreviousData: true,
    queryFn: () => findWaitingListInfoAsync(adminId),
    queryKey: ['findWaitingListInfo', adminId],
  });
}