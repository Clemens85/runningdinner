import axios from "axios";
import filter from "lodash/filter";
import { BackendConfig } from "../BackendConfig";
import {CONSTANTS} from "../Constants";
import {Activity, ActivityType, DashboardAdminActivities } from "../types";

const messageActivities = [
  CONSTANTS.ACTIVITY.DINNERROUTE_MAIL_SENT,
  CONSTANTS.ACTIVITY.PARTICIPANT_MAIL_SENT,
  CONSTANTS.ACTIVITY.TEAMARRANGEMENT_MAIL_SENT
];

export async function findAdminActivitiesByAdminIdAsync(adminId: string): Promise<DashboardAdminActivities> {
  const url = BackendConfig.buildUrl(`/activityservice/v1/runningdinner/${adminId}/admin`);
  const response = await axios.get<DashboardAdminActivities>(url);
  return response.data;
}

export function filterActivitiesByType(activities: Activity[], activityTypeToFilterFor: ActivityType) {
  return filter(activities, ["activityType", activityTypeToFilterFor]);
}

export function isMessageActivityContained(activities: Activity[]) {
  for (var i=0; i<activities.length; i++) {
    if (messageActivities.indexOf(activities[i].activityType) > -1) {
      return true;
    }
  }
  return false;
}