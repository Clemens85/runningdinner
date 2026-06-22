export type PortalRole = 'PARTICIPANT' | 'ORGANIZER';

export interface PortalEventEntry {
  eventName: string;
  eventDate: Date;
  city: string;
  role: PortalRole;
  /** null for participants; full admin URL for organizers */
  adminUrl: string | null;
  /** Public event page URL, available for all roles */
  publicUrl: string | null;
}

export interface PortalMyEventsResponseTO {
  events: PortalEventEntry[];
}
