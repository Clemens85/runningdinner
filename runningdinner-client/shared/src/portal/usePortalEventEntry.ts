import { PortalEventEntry } from './PortalTypes';
import { useMyEvents } from './useMyEvents';

export interface PortalEventEntryResult {
  event: PortalEventEntry | null;
  portalToken: string | null;
  /** True while the fallback my-events fetch is in flight (only relevant on direct URL access) */
  isLoading: boolean;
}

/**
 * Resolves a PortalEventEntry and its portal token for a given participant.
 *
 * Fast path: uses the event from React Router navigation state — no extra network request.
 * This is the normal case when navigating within the app (e.g. from MyEventsPage).
 *
 * Fallback path: re-fetches my-events from the backend and finds the matching entry
 * by selfAdminId + participantId. This handles direct URL access (bookmarks, hard refresh,
 * shared links) where navigation state is absent.
 */
export function usePortalEventEntry(selfAdminId: string, participantId: string, stateEvent: PortalEventEntry | null): PortalEventEntryResult {
  const needsFallback = !stateEvent;

  // Only fires when stateEvent is absent; React Query caches the result so
  // navigating back from MyEventsPage makes this essentially free.
  const { data: myEventsData, isLoading } = useMyEvents({ enabled: needsFallback });

  if (!needsFallback) {
    return {
      event: stateEvent,
      portalToken: stateEvent!.credentials?.PARTICIPANT?.portalToken ?? null,
      isLoading: false,
    };
  }

  const myEvents = myEventsData?.events || [];
  const matchedEvent = myEvents.find((e) => isMatchingSelfAdminIdAndParticipantId(e, selfAdminId, participantId)) ?? null;

  return {
    event: matchedEvent,
    portalToken: matchedEvent?.credentials?.PARTICIPANT?.portalToken ?? null,
    isLoading,
  };
}

function isMatchingSelfAdminIdAndParticipantId(event: PortalEventEntry, selfAdminId: string, participantId: string) {
  return event.credentials?.PARTICIPANT?.selfAdminId === selfAdminId && event.credentials?.PARTICIPANT?.participantId === participantId;
}
