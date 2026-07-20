import { useQuery } from '@tanstack/react-query';

import { fetchParticipantSelfServiceInfo } from './PortalService';
import { PortalCredential } from './PortalTypes.ts';

export function useParticipantSelfServiceInfo(portalCredential: PortalCredential) {
  const { selfAdminId, participantId, portalToken } = portalCredential;
  return useQuery({
    queryKey: ['participantSelfServiceInfo', selfAdminId, participantId],
    queryFn: () => fetchParticipantSelfServiceInfo(portalCredential),
    enabled: !!(selfAdminId && participantId && portalToken),
    staleTime: 30_000,
    // Always re-fetch when the user returns to this tab (e.g. after changing the team host in the new-tab flow)
    refetchOnWindowFocus: 'always',
  });
}
