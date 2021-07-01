import {newInitialDashboardState} from "./StoreTypes";
import {createAction, createReducer} from "@reduxjs/toolkit";
import {enhanceAdminActivitiesByDetailsAsync, findAdminActivitiesByAdminIdAsync} from "../ActivityService";
import {
  AdminStateType,
  AdminThunk,
  DashboardAdminActivities,
  HttpError,
} from "@runningdinner/shared";
import {handleFetchLoading, handleFetchRejected, handleFetchSucceeded} from "../../redux/FetchHelpers";

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
      dispatch(fetchAdminActivitiesRejected(err));
    }
  };
}

export function fetchAdminActivitiesDetails(adminId: string, dashboardAdminActivities: DashboardAdminActivities) : AdminThunk {
  return async (dispatch) => {
    dispatch(fetchAdminActivitiesPending()) // Just reuse existing actions due to they match exactly our needs
    try {
      const result = await enhanceAdminActivitiesByDetailsAsync(adminId, dashboardAdminActivities);
      dispatch(fetchAdminActivitiesSucceeded(result));
    } catch (err) {
      dispatch(fetchAdminActivitiesRejected(err));
    }
  };
}

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
  });
});

// *** Selectors *** //
export const getAdminActivitiesFetchSelector = (state: AdminStateType) => state.dashboard.adminActivities;