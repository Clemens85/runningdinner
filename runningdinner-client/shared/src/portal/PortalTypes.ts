import { MealSpecifics } from '../types';

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
 * Team self-service info returned as part of PortalParticipantInfo.
 * Only present when the participant is assigned to a team AND team arrangement mails
 * have been sent to all recipients (signalling the arrangement is fixed).
 */
export interface TeamSelfServiceInfo {
  /** Label of the meal this team is cooking (e.g. "Hauptgang"). */
  mealLabel: string;
  /** Time at which this team cooks / serves their meal (ISO date-time string). */
  mealTime: Date;
  /** Full name of the team partner, null when no partner exists. */
  teamPartnerName: string | null;
  /** Email of the team partner, null when no partner exists. */
  teamPartnerEmail: string | null;
  /** Mobile number of the team partner, null/empty when not provided. */
  teamPartnerMobileNumber: string | null;
  /** Full name of the proposed/current host of this team. */
  hostName: string;
  /** Full URL to the self-service page for managing team hosting. */
  manageTeamHostingUrl: string;
  /** True when the viewing participant is themselves the proposed host of this team. */
  selfIsHost: boolean;
  /** True when the partner was co-registered alongside the viewer (fixed-partner-registration). */
  fixedTeamPartner: boolean;
  /**
   * Dietary restrictions + free-text note of the team partner.
   * Only populated when fixedTeamPartner is false and a partner exists. Null otherwise.
   */
  teamPartnerMealSpecifics: MealSpecifics | null;

  teamPartnerCancelled: boolean;
}

/**
 * Full participant self-service availability info, fetched on demand
 * from GET /participant-portal/v1/{selfAdminId}/{participantId}/self-service-info.
 * Decoupled from PortalEventEntry — not part of the my-events response.
 */
export interface PortalParticipantInfo {
  /**
   * Team self-service info — only populated when the participant is assigned to a team AND
   * team arrangement mails have been sent. Null until both conditions are met.
   */
  teamSelfServiceInfo: TeamSelfServiceInfo | null;
  /** true when at least one DINNER_ROUTE message has been sent to this participant */
  dinnerRouteAvailable: boolean;
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
