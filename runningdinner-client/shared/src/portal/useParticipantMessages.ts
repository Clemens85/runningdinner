import { useQuery } from '@tanstack/react-query';

import { fetchParticipantMessages } from './PortalService';

export function useParticipantMessages(selfAdminId: string, participantId: string, portalToken: string | null) {
  return useQuery({
    queryKey: ['participantMessages', selfAdminId, participantId],
    queryFn: () => fetchParticipantMessages(selfAdminId, participantId, portalToken!),
    enabled: !!(selfAdminId && participantId && portalToken),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
