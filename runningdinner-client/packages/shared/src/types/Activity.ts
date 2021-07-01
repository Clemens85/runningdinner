import {RelatedEntityType, RunningDinnerRelated} from "./Base";
import {MessageJob, MessageJobOverview} from "@runningdinner/shared";

export interface Activity extends RunningDinnerRelated {
  activityDate: Date;
  originator: string;
  activityHeadline: string;
  activityMessage: string;
  activityType: ActivityType;
  relatedEntityId: string;
  relatedEntityType: RelatedEntityType;
  messageJobOverview?: MessageJobOverview;
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