import axios from "axios";
import filter from "lodash/filter";
import { BackendConfig } from "../BackendConfig";
import {CONSTANTS} from "../Constants";
import {Activity, ActivityList, ActivityType, DashboardAdminActivities, MessageJobOverview} from "../types";
import { findMessageJobOverviewByAdminIdAndMessageJobId } from "./MessageService";
import cloneDeep from "lodash/cloneDeep";
import { isStringNotEmpty, findEntityById } from "../Utils";

const messageActivities = [
  CONSTANTS.ACTIVITY.DINNERROUTE_MAIL_SENT,
  CONSTANTS.ACTIVITY.PARTICIPANT_MAIL_SENT,
  CONSTANTS.ACTIVITY.TEAMARRANGEMENT_MAIL_SENT,
  CONSTANTS.ACTIVITY.MESSAGE_JOB_SENDING_FAILED
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
  for (let i=0; i<activities.length; i++) {
    if (messageActivities.indexOf(activities[i].activityType) > -1) {
      return true;
    }
  }
  return false;
}
export async function findParticipantActivitiesByAdminIdAsync(adminId: string, page: number) : Promise<ActivityList>  {
  const url = BackendConfig.buildUrl(`/activityservice/v1/runningdinner/${adminId}/participant?page=${page}`);
  const response = await axios.get<ActivityList>(url);
  return response.data;
}

export async function enhanceAdminActivitiesByDetailsAsync(adminId: string, dashboardAdminActivities: DashboardAdminActivities): Promise<DashboardAdminActivities> {
  const asyncFetchDetailsJobs: Record<string, Promise<MessageJobOverview>> = {};
  dashboardAdminActivities.activities.map(activity => {
    if (isMessageActivityContained([activity]) && isStringNotEmpty(activity.relatedEntityId)) {
      asyncFetchDetailsJobs[activity.id!] = findMessageJobOverviewByAdminIdAndMessageJobId(adminId, activity.relatedEntityId);
    }
  });

  const result = cloneDeep(dashboardAdminActivities);
  for (let id in asyncFetchDetailsJobs) {
    const messageJobOverview = await asyncFetchDetailsJobs[id];
    const activity = findEntityById(result.activities, id);
    activity.relatedMessageJobOverview = messageJobOverview;
  }
  return result;
}