import {newInitialDashboardState} from "./StoreTypes";
import {createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {
  enhanceAdminActivitiesByDetailsAsync,
  findAdminActivitiesByAdminIdAsync,
  findParticipantActivitiesByAdminIdAsync
} from "../ActivityService";
import { findNotActivatedParticipantsByAdminIdAndIdsAsync, updateParticipantSubscriptionByAdminIdAndIdAsync } from "../ParticipantService";
import {
  ActivityList,
  DashboardAdminActivities,
  HttpError
} from "../../types";

import { AdminStateType, AdminThunk } from "./AdminStore";
import {FetchData, FetchStatus, handleFetchLoading, handleFetchRejected, handleFetchSucceeded} from "../../redux";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";
import { isArrayEmpty } from "../../Utils";

// *** Actions *** //
const fetchAdminActivitiesPending = createAction('fetchAdminActivitiesPending');
const fetchAdminActivitiesRejected = createAction<HttpError>('fetchAdminActivitiesRejected');
const fetchAdminActivitiesSucceeded = createAction<DashboardAdminActivities>('fetchAdminActivitiesSucceeded');

export function fetchAdminActivities(adminId: string) : AdminThunk {
  return async (dispatch) => {
    dispatch(fetchAdminActivitiesPending())
    try {
      const result = await findAdminActivitiesByAdminIdAsync(adminId);
      dispatch(fetchAdminActivitiesSucceeded(result));
      dispatch(fetchAdminActivitiesDetails(adminId, result)); // Trigger loading of details of some single activities which will be enhanced
    } catch (err) {
      dispatch(fetchAdminActivitiesRejected(err as HttpError));
    }
  };
}

function fetchAdminActivitiesDetails(adminId: string, dashboardAdminActivities: DashboardAdminActivities) : AdminThunk {
  return async (dispatch) => {
    dispatch(fetchAdminActivitiesPending()) // Just reuse existing actions due to they match exactly our needs
    try {
      const result = await enhanceAdminActivitiesByDetailsAsync(adminId, dashboardAdminActivities);
      dispatch(fetchAdminActivitiesSucceeded(result));
    } catch (err) {
      dispatch(fetchAdminActivitiesRejected(err as HttpError));
    }
  };
}

export const fetchNextParticipantActivities = createAsyncThunk(
  'fetchNextParticipantActivities',
  async ({adminId, initialFetch}: Record<string, any>, thunkAPI) => {
    const currentStoreState = thunkAPI.getState() as AdminStateType;
    const currentPage = (!initialFetch && currentStoreState.dashboard.participantActivities.data) ? currentStoreState.dashboard.participantActivities.data.page : -1;
    const participantActivities = await findParticipantActivitiesByAdminIdAsync(adminId, currentPage + 1);
    const result = await enhanceParticipantActivitiesByActivationInfo(adminId, participantActivities);
    result.initialFetch = initialFetch;
    return result;
  }
);

async function enhanceParticipantActivitiesByActivationInfo(adminId: string, participantActivities: ActivityList) : Promise<ActivityListWrapper> {
  const result = cloneDeep(participantActivities);
  const participantIds = result.activities.map(activity => activity.relatedEntityId);
  const notActivatedParticipants = await findNotActivatedParticipantsByAdminIdAndIdsAsync(adminId, participantIds);
  notActivatedParticipants.map(notActivatedParticipant => {
    const matchingActivity = find(result.activities, ["relatedEntityId", notActivatedParticipant.id]);
    if (matchingActivity) {
      matchingActivity.relatedParticipantNotActivated = true;
    }
  });
  return result;
}

export const updateParticipantSubscription = createAsyncThunk(
  'updateParticipantSubscription',
  async (props: Record<string, string>, thunkAPI) => {
    const {adminId, participantId} = props;
    try {
      return await updateParticipantSubscriptionByAdminIdAndIdAsync(adminId, participantId);
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);


// *** Reducer *** //
export const dashboardSlice = createReducer(newInitialDashboardState(), builder => {
  builder.addCase(fetchAdminActivitiesSucceeded, (state, action) => {
    handleFetchSucceeded(state.adminActivities, action.payload);
  })
  .addCase(fetchAdminActivitiesPending, (state) => {
    handleFetchLoading(state.adminActivities);
  })
  .addCase(fetchAdminActivitiesRejected, (state, action) => {
    handleFetchRejected(state.adminActivities, action);
  })
  .addCase(fetchNextParticipantActivities.fulfilled, (state, action) => {
    if (!state.participantActivities.data || action.payload.initialFetch) {
      state.participantActivities.data = setupInitialActivityList(state.participantActivities);
    }
    // const existingActivities = state.participantActivities.data?.activities || [];
    state.participantActivities.data.activities = state.participantActivities.data.activities.concat(action.payload.activities || []);
    state.participantActivities.data.page = action.payload.page;
    state.participantActivities.data.hasMore = action.payload.hasMore;
    state.participantActivities.fetchStatus = FetchStatus.SUCCEEDED;
    state.participantActivities.fetchError = undefined;
  })
  .addCase(fetchNextParticipantActivities.pending, (state) => {
    handleFetchLoading(state.participantActivities);
  })
  .addCase(fetchNextParticipantActivities.rejected, (state, action) => {
    handleFetchRejected(state.participantActivities, action);
  })
  .addCase(updateParticipantSubscription.fulfilled, (state, action) => {
    const activatedParticipant = action.payload;
    const {activities} = state.participantActivities.data!;
    const matchingActivity = find(activities, ["relatedEntityId", activatedParticipant.id]);
    if (matchingActivity) {
      matchingActivity.relatedParticipantNotActivated = false;
    }
  });
});

// *** Selectors *** //
export const getAdminActivitiesFetchSelector = (state: AdminStateType) => state.dashboard.adminActivities;
export const getParticipantRegistrationActivitiesFetchSelector = (state: AdminStateType) => state.dashboard.participantActivities;
export const isParticipantRegistrationActivitiesEmpty = (state: AdminStateType) => state.dashboard.participantActivities.fetchStatus === FetchStatus.SUCCEEDED &&
                                                                                   isArrayEmpty(state.dashboard.participantActivities.data?.activities);

// *** Helpers *** //
function setupInitialActivityList(activityList: FetchData<ActivityList>): ActivityList {
  activityList.data = {
    page: -1,
    activities: [],
    hasMore: true
  };
  return activityList.data;
}

interface ActivityListWrapper extends ActivityList {
  initialFetch?: boolean;
}