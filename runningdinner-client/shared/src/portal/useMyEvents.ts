import { useQuery } from '@tanstack/react-query';

import { fetchMyEvents } from './PortalService';
import { getStoredPortalToken } from './PortalStorageService';
import { PortalMyEventsResponseTO } from './PortalTypes';

export const MY_EVENTS_QUERY_KEY = ['portalMyEvents'] as const;

export function useMyEvents() {
  const portalToken = getStoredPortalToken();

  return useQuery<PortalMyEventsResponseTO>({
    queryKey: [...MY_EVENTS_QUERY_KEY, portalToken],
    queryFn: () => fetchMyEvents(portalToken!),
    enabled: portalToken !== null,
    placeholderData: { events: [] },
    staleTime: 30_000,
  });
}
