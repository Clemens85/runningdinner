import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { findWaitingListInfoAsync } from '.';

export function useFindWaitingListInfo(adminId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findWaitingListInfoAsync(adminId),
    queryKey: ['findWaitingListInfo', adminId],
  });
}
