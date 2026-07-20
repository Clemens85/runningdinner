import { PortalEventEntry } from '@runningdinner/shared';
import { useNavigate } from 'react-router-dom';

export function useEventCardClickHandler() {
  const navigate = useNavigate();

  return function getCardClickHandler(event: PortalEventEntry) {
    const participantCred = event.credentials?.PARTICIPANT;
    if (event.roles.includes('PARTICIPANT') && participantCred?.selfAdminId && participantCred?.participantId) {
      return () => navigate(`event/${participantCred.selfAdminId}/${participantCred.participantId}`, { state: { event } });
    }
    const adminUrl = event.credentials?.ORGANIZER?.adminUrl;
    if (event.roles.includes('ORGANIZER') && adminUrl) {
      return () => window.open(adminUrl, '_blank', 'noopener,noreferrer');
    }
    return undefined;
  };
}
