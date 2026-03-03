export type PortalRole = 'PARTICIPANT' | 'ORGANIZER';

export interface ParticipantPortalCredential {
  role: 'PARTICIPANT';
  /** UUID — matches RunningDinner.selfAdministrationId */
  selfAdminId: string;
  /** UUID — Participant.id */
  participantId: string;
}

export interface OrganizerPortalCredential {
  role: 'ORGANIZER';
  /** RunningDinner.adminId */
  adminId: string;
}

export type PortalCredential = ParticipantPortalCredential | OrganizerPortalCredential;

export interface PortalEventEntry {
  eventName: string;
  /** ISO date string (LocalDate serialized, e.g. "2026-05-15") */
  eventDate: string;
  city: string;
  role: PortalRole;
  /** null for participants; full admin URL for organizers */
  adminUrl: string | null;
}

export interface PortalAccessResponseTO {
  credentials: PortalCredential[];
}

export interface PortalMyEventsResponseTO {
  events: PortalEventEntry[];
}
