import { useQuery } from '@tanstack/react-query';

import { fetchMyEvents } from './PortalService';
import { getStoredPortalTokens } from './PortalStorageService';

export const MY_EVENTS_QUERY_KEY = ['portalMyEvents'] as const;

type UseMyEventsProps = {
  enabled?: boolean | undefined;
};

export function useMyEvents({ enabled = true }: UseMyEventsProps = {}) {
  const portalTokens = getStoredPortalTokens() || [];

  return useQuery({
    queryKey: [...MY_EVENTS_QUERY_KEY, portalTokens.slice().sort().join(',')],
    queryFn: () => fetchMyEvents(portalTokens),
    staleTime: 30_000,
    enabled: enabled,
  });
}
