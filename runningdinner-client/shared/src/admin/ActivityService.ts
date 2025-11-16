import axios from 'axios';
import { filter } from 'lodash-es';
import { cloneDeep } from 'lodash-es';

import { BackendConfig } from '../BackendConfig';
import { CONSTANTS } from '../Constants';
import { Activity, ActivityList, ActivityType, DashboardAdminActivities, MessageJobOverview } from '../types';
import { findEntityById,isStringNotEmpty } from '../Utils';
import { findMessageJobOverviewByAdminIdAndMessageJobId } from './MessageService';

const messageActivities = [
  CONSTANTS.ACTIVITY.DINNERROUTE_MAIL_SENT,
  CONSTANTS.ACTIVITY.PARTICIPANT_MAIL_SENT,
  CONSTANTS.ACTIVITY.TEAMARRANGEMENT_MAIL_SENT,
  CONSTANTS.ACTIVITY.MESSAGE_JOB_SENDING_FAILED,
];

export async function findAdminActivitiesByAdminIdAsync(adminId: string): Promise<DashboardAdminActivities> {
  const url = BackendConfig.buildUrl(`/activityservice/v1/runningdinner/${adminId}/admin`);
  const response = await axios.get<DashboardAdminActivities>(url);
  return response.data;
}

export async function findAdminActivitiesByAdminIdAndTypesAsync(adminId: string, activityTypes: string[]): Promise<ActivityList> {
  let url = BackendConfig.buildUrl(`/activityservice/v1/runningdinner/${adminId}`);
  url += '?';
  for (let i = 0; i < activityTypes.length; i++) {
    if (i > 0) {
      url += '&';
    }
    url += `type=${activityTypes[i]}`;
  }
  const response = await axios.get<ActivityList>(url);
  return response.data;
}

export function filterActivitiesByType(activities: Activity[], activityTypeToFilterFor: ActivityType) {
  return filter(activities, ['activityType', activityTypeToFilterFor]);
}

export function isMessageActivityContained(activities: Activity[]) {
  for (let i = 0; i < activities.length; i++) {
    if (messageActivities.indexOf(activities[i].activityType) > -1) {
      return true;
    }
  }
  return false;
}
export async function enhanceAdminActivitiesByDetailsAsync(adminId: string, dashboardAdminActivities: DashboardAdminActivities): Promise<DashboardAdminActivities> {
  const asyncFetchDetailsJobs: Record<string, Promise<MessageJobOverview>> = {};
  dashboardAdminActivities.activities.map((activity) => {
    if (isMessageActivityContained([activity]) && isStringNotEmpty(activity.relatedEntityId)) {
      asyncFetchDetailsJobs[activity.id!] = findMessageJobOverviewByAdminIdAndMessageJobId(adminId, activity.relatedEntityId);
    }
  });

  const result = cloneDeep(dashboardAdminActivities);
  for (const id in asyncFetchDetailsJobs) {
    const messageJobOverview = await asyncFetchDetailsJobs[id];
    const activity = findEntityById(result.activities, id);
    activity.relatedMessageJobOverview = messageJobOverview;
  }
  return result;
}
