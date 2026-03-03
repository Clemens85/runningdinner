import { useQuery } from '@tanstack/react-query';

import { fetchMyEvents } from './PortalService';
import { getStoredCredentials } from './PortalStorageService';
import { PortalMyEventsResponseTO } from './PortalTypes';

export const MY_EVENTS_QUERY_KEY = ['portalMyEvents'] as const;

export function useMyEvents() {
  const credentials = getStoredCredentials();

  return useQuery<PortalMyEventsResponseTO>({
    queryKey: [...MY_EVENTS_QUERY_KEY, credentials],
    queryFn: () => fetchMyEvents(credentials),
    enabled: credentials.length > 0,
    placeholderData: { events: [] },
    // cached events are still valid until credentials change
    staleTime: 30_000,
  });
}
