import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { findWaitingListInfoAsync } from '.';

export function useFindWaitingListInfo(adminId: string, refetchOnMount?: boolean | 'always' | undefined) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findWaitingListInfoAsync(adminId),
    queryKey: ['findWaitingListInfo', adminId],
    refetchOnMount: refetchOnMount,
  });
}
