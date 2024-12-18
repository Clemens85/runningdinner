import {RelatedEntityType, RunningDinnerRelated} from "./Base";
import {MessageJobOverview} from "./Message";

export interface Activity extends RunningDinnerRelated {
  activityDate: Date;
  originator: string;
  activityHeadline: string;
  activityMessage: string;
  activityType: ActivityType;
  relatedEntityId: string;
  relatedEntityType: RelatedEntityType;
  // The following properties are just used (and enhanced) for UI control and are not part of backend, but it makes life easier:
  relatedMessageJobOverview?: MessageJobOverview;
  relatedParticipantNotActivated?: boolean;
}

export interface DashboardAdminActivities {
  activities: Activity[];
  checkList: Checklist;
}

export interface Checklist {
  dinnerCreated?: boolean;
  endOfRegistrationDate?: boolean;
  participantMessagesSent?: boolean;
  teamArrangementsCreated?: boolean;
  teamMessagesSent?: boolean;
  dinnerRouteMessagesSent?: boolean;
}

export enum ActivityType {

  PARTICIPANT_SUBSCRIBED = "PARTICIPANT_SUBSCRIBED",

  PARTICIPANT_UNSUBSCRIBED = "PARTICIPANT_UNSUBSCRIBED",

  PARTICIPANT_CHANGED_TEAMHOST = "PARTICIPANT_CHANGED_TEAMHOST",

  DINNER_CREATED = "DINNER_CREATED",

  PARTICIPANT_MAIL_SENT = "PARTICIPANT_MAIL_SENT",

  TEAMARRANGEMENT_MAIL_SENT = "TEAMARRANGEMENT_MAIL_SENT",

  DINNERROUTE_MAIL_SENT = "DINNERROUTE_MAIL_SENT",

  TEAM_ARRANGEMENT_CREATED = "TEAM_ARRANGEMENT_CREATED",

  TEAMS_RECREATED = "TEAMS_RECREATED",

  MEAL_TIMES_UPDATED = "MEAL_TIMES_UPDATED",

  CUSTOM_ADMIN_CHANGE = "CUSTOM_ADMIN_CHANGE",

  MESSAGE_JOB_SENDING_FAILED = "MESSAGE_JOB_SENDING_FAILED",

  DINNER_CANCELLED = "DINNER_CANCELLED"
}

export interface ActivityList {
  activities: Activity[];
  page: number;
  hasMore: boolean;
}