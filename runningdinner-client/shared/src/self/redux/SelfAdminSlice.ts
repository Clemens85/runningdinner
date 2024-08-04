import {createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {FetchData, FetchStatus, handleFetchLoading, handleFetchRejected, handleFetchSucceeded} from "../../redux";
import {SelfAdminStateType} from "./SelfAdminStore";
import { newInitialSelfAdminState } from "./SelfAdminState";
import {findSelfAdminDinnerRoute, findSelfAdminSessionDataAsync, findSelfAdminTeam} from "../SelfAdminService";
import {HttpError, SelfAdminBaseParams, SelfAdminTeamParams} from "../../types";

// *** Actions *** //
export const fetchSelfAdminSessionData = createAsyncThunk(
  'fetchSelfAdminSessionData',
  async (selfAdminRequestParams: SelfAdminBaseParams) => {
    return await findSelfAdminSessionDataAsync(selfAdminRequestParams);
  }
);

export const fetchSelfAdminTeam = createAsyncThunk(
  'fetchSelfAdminTeam',
  async (selfAdminRequestParams: SelfAdminTeamParams) => {
    return await findSelfAdminTeam(selfAdminRequestParams);
  }
);

export const fetchSelfAdminDinnerRoute = createAsyncThunk(
  'fetchSelfAdminDinnerRoute',
  async (selfAdminRequestParams: SelfAdminTeamParams) => {
    return await findSelfAdminDinnerRoute(selfAdminRequestParams);
  }
);

// *** Reducer *** //
export const selfAdminSlice = createReducer(newInitialSelfAdminState(), builder => {
  builder.addCase(fetchSelfAdminSessionData.fulfilled, (state, action) => {
    handleFetchSucceeded(state.selfAdminSessionData, action.payload);
  }).addCase(fetchSelfAdminSessionData.rejected, (state, action) => {
    handleFetchRejected(state.selfAdminSessionData, action.payload);
  }).addCase(fetchSelfAdminSessionData.pending, (state) => {
    handleFetchLoading(state.selfAdminSessionData);
  })

  .addCase(fetchSelfAdminTeam.fulfilled, (state, action) => {
    handleFetchSucceeded(state.selfAdminTeam, action.payload);
  }).addCase(fetchSelfAdminTeam.rejected, (state, action) => {
    handleFetchRejected(state.selfAdminTeam, action.payload);
  }).addCase(fetchSelfAdminTeam.pending, (state) => {
    handleFetchLoading(state.selfAdminTeam);
  })

  .addCase(fetchSelfAdminDinnerRoute.fulfilled, (state, action) => {
      handleFetchSucceeded(state.selfAdminDinnerRoute, action.payload);
  }).addCase(fetchSelfAdminDinnerRoute.rejected, (state, action) => {
    handleFetchRejected(state.selfAdminDinnerRoute, action.payload);
  }).addCase(fetchSelfAdminDinnerRoute.pending, (state) => {
    handleFetchLoading(state.selfAdminDinnerRoute);
  });
});

// *** Selectors *** //
export const getSelfAdminTeamFetchSelector = (state: SelfAdminStateType) => state.selfAdminTeam;
export const getSelfAdminDinnerRouteFetchSelector = (state: SelfAdminStateType) => state.selfAdminDinnerRoute;
export const getSelfAdminSessionDataFetchSelector = (state: SelfAdminStateType) => state.selfAdminSessionData;
export const getLanguageOfDinnerSelfAdmin = (state: SelfAdminStateType) => {
  const result = state.selfAdminSessionData.data?.languageCode;
  return result ? result : "de";
}

export const getMealsOfDinnerSelfAdmin = (state: SelfAdminStateType) => {
  const result = state.selfAdminSessionData.data?.meals;
  return result ? result : [];
}

export const isFetchingSelfAdminDataSelector = (state: SelfAdminStateType) => {
  const loadingItems = getFetchDataItems(state)
    .filter(item => item.fetchStatus === FetchStatus.LOADING);
  return loadingItems.length > 0;
};

export const getSelfAdminFetchDataErrorSelector = (state: SelfAdminStateType): HttpError | undefined => {
  const errorItems = getFetchDataItems(state)
    .filter(item => item.fetchError !== undefined && item.fetchError !== null);
  return errorItems.length > 0 ? errorItems[0].fetchError : undefined;
}

// *** Helpers *** //
const getFetchDataItems = (state: SelfAdminStateType): FetchData<any>[] => {
  return [
    state.selfAdminSessionData,
    state.selfAdminTeam,
    state.selfAdminDinnerRoute
  ];
};