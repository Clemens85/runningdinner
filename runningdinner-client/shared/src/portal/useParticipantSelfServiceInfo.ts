import { useQuery } from '@tanstack/react-query';

import { fetchParticipantSelfServiceInfo } from './PortalService';

export function useParticipantSelfServiceInfo(selfAdminId: string, participantId: string, portalToken: string | null) {
  return useQuery({
    queryKey: ['participantSelfServiceInfo', selfAdminId, participantId],
    queryFn: () => fetchParticipantSelfServiceInfo(selfAdminId, participantId, portalToken!),
    enabled: !!(selfAdminId && participantId && portalToken),
    staleTime: 30_000,
    // Always re-fetch when the user returns to this tab (e.g. after changing the team host in the new-tab flow)
    refetchOnWindowFocus: 'always',
  });
}
