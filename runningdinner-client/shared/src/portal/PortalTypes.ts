export type PortalRole = 'PARTICIPANT' | 'ORGANIZER';

/**
 * Mirrors the backend PortalCredentialTO.
 * Per-role credentials returned inside each PortalEventEntry.
 * PARTICIPANT entries carry selfAdminId + participantId + portalToken.
 * ORGANIZER entries carry adminId + adminUrl + portalToken.
 */
export interface PortalCredential {
  role: PortalRole;
  portalToken: string;
  /** PARTICIPANT only */
  selfAdminId?: string;
  /** PARTICIPANT only */
  participantId?: string;
  /** ORGANIZER only */
  adminId?: string;
  /** ORGANIZER only */
  adminUrl?: string;
}

/**
 * Full participant self-service availability info, fetched on demand
 * from GET /participant-portal/v1/{selfAdminId}/{participantId}/self-service-info.
 * Decoupled from PortalEventEntry — not part of the my-events response.
 */
export interface PortalParticipantInfo {
  /** null when the participant has not yet been assigned to a team */
  teamId: string | null;
  /** true when at least one DINNER_ROUTE message has been sent to this participant */
  dinnerRouteAvailable: boolean;
  /** true when at least one TEAM message has been sent to this participant */
  changeTeamHostAvailable: boolean;
}

export interface PortalEventEntry {
  eventName: string;
  eventDate: Date;
  city: string;
  roles: PortalRole[];
  /** Public event page URL, available for all roles */
  publicUrl: string | null;
  /**
   * Per-role credentials map from the backend.
   * Access organizer admin URL via credentials?.ORGANIZER?.adminUrl.
   * Access participant self-service ids via credentials?.PARTICIPANT.
   */
  credentials: Partial<Record<PortalRole, PortalCredential>>;
}

export interface PortalMyEventsResponseTO {
  events: PortalEventEntry[];
}
