export type PortalRole = 'PARTICIPANT' | 'ORGANIZER';

export interface PortalEventEntry {
  eventName: string;
  /** ISO date string (LocalDate serialized, e.g. "2026-05-15") */
  eventDate: string;
  city: string;
  role: PortalRole;
  /** null for participants; full admin URL for organizers */
  adminUrl: string | null;
}

export interface PortalMyEventsResponseTO {
  events: PortalEventEntry[];
}
