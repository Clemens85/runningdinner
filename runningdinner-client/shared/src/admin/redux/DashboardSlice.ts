import {newInitialDashboardState} from "./StoreTypes";
import {createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {
  enhanceAdminActivitiesByDetailsAsync,
  findAdminActivitiesByAdminIdAsync,
} from "../ActivityService";
import { findParticipantRegistrationsByAdminIdAsync, updateParticipantSubscriptionByAdminIdAndIdAsync } from "../ParticipantService";
import {
  DashboardAdminActivities,
  HttpError,
  ParticipantRegistrationInfoList
} from "../../types";

import { AdminStateType, AdminThunk } from "./AdminStore";
import {FetchData, FetchStatus, handleFetchLoading, handleFetchRejected, handleFetchSucceeded} from "../../redux";
import { findEntityById, isArrayEmpty } from "../../Utils";

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

export const fetchNextParticipantRegistrations = createAsyncThunk(
  'fetchNextParticipantRegistrations',
  async ({adminId, initialFetch}: Record<string, any>, thunkAPI) => {
    const currentStoreState = thunkAPI.getState() as AdminStateType;
    const currentPage = (!initialFetch && currentStoreState.dashboard.participantRegistrations.data) ? currentStoreState.dashboard.participantRegistrations.data.page : -1;
    const result: ParticipantRegistrationInfoListWrapper = await findParticipantRegistrationsByAdminIdAsync(adminId, currentPage + 1);
    result.initialFetch = initialFetch;
    return result;
  }
);

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
  .addCase(fetchNextParticipantRegistrations.fulfilled, (state, action) => {
    if (!state.participantRegistrations.data || action.payload.initialFetch) {
      state.participantRegistrations.data = setupInitialParticipantRegistrationInfoList(state.participantRegistrations);
    }
    state.participantRegistrations.data.registrations = state.participantRegistrations.data.registrations.concat(action.payload.registrations || []);
    state.participantRegistrations.data.notActivatedRegistrationsTooOld = action.payload.notActivatedRegistrationsTooOld;
    state.participantRegistrations.data.page = action.payload.page;
    state.participantRegistrations.data.hasMore = action.payload.hasMore;
    state.participantRegistrations.fetchStatus = FetchStatus.SUCCEEDED;
    state.participantRegistrations.fetchError = undefined;
  })
  .addCase(fetchNextParticipantRegistrations.pending, (state) => {
    handleFetchLoading(state.participantRegistrations);
  })
  .addCase(fetchNextParticipantRegistrations.rejected, (state, action) => {
    handleFetchRejected(state.participantRegistrations, action);
  })
  .addCase(updateParticipantSubscription.fulfilled, (state, action) => {
    const activatedParticipant = action.payload;
    const {registrations, notActivatedRegistrationsTooOld} = state.participantRegistrations.data!;
    let matchingParticipant = findEntityById(registrations, activatedParticipant.id);
    if (matchingParticipant) {
      matchingParticipant.activationDate = activatedParticipant.activationDate;
    }
    matchingParticipant = findEntityById(notActivatedRegistrationsTooOld, activatedParticipant.id);
    if (matchingParticipant) {
      matchingParticipant.activationDate = activatedParticipant.activationDate;
    }
  });
});

// *** Selectors *** //
export const getAdminActivitiesFetchSelector = (state: AdminStateType) => state.dashboard.adminActivities;

export const getParticipantRegistrationsFetchSelector = (state: AdminStateType) =>  state.dashboard.participantRegistrations;

export const isParticipantRegistrationsEmpty = (state: AdminStateType) => state.dashboard.participantRegistrations.fetchStatus === FetchStatus.SUCCEEDED &&
                                                                                   isArrayEmpty(state.dashboard.participantRegistrations.data?.registrations);

// *** Helpers *** //
function setupInitialParticipantRegistrationInfoList(participantRegistrationInfoList: FetchData<ParticipantRegistrationInfoList>): ParticipantRegistrationInfoList {
  participantRegistrationInfoList.data = {
    page: -1,
    notActivatedRegistrationsTooOld: [],
    registrations: [],
    hasMore: true
  };
  return participantRegistrationInfoList.data;
}

interface ParticipantRegistrationInfoListWrapper extends ParticipantRegistrationInfoList {
  initialFetch?: boolean;
}