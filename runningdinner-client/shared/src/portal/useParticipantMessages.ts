import { useQuery } from '@tanstack/react-query';

import { fetchParticipantMessages } from './PortalService';
import { PortalCredential } from './PortalTypes.ts';

export function useParticipantMessages(portalCredential: PortalCredential) {
  const { selfAdminId, participantId, portalToken } = portalCredential;
  return useQuery({
    queryKey: ['participantMessages', selfAdminId, participantId],
    queryFn: () => fetchParticipantMessages(portalCredential),
    enabled: !!(selfAdminId && participantId && portalToken),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
