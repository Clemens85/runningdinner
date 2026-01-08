import { createAction, createAsyncThunk, createReducer } from '@reduxjs/toolkit';

import { FetchData, FetchStatus, handleFetchLoading, handleFetchRejected, handleFetchSucceeded } from '../../redux';
import { HttpError, RunningDinner } from '../../types';
import { findRunningDinnerAsync } from '..';
import { AdminStateType } from './AdminStore';
import { newInitialAdminState } from './StoreTypes';

// *** Actions *** //
export const fetchRunningDinner = createAsyncThunk('fetchRunningDinner', async (adminId: string) => {
  return await findRunningDinnerAsync(adminId);
});
export const setUpdatedRunningDinner = createAction<RunningDinner>('setUpdatedRunningDinner');

// *** Reducer *** //
export const adminSlice = createReducer(newInitialAdminState(), (builder) => {
  builder
    .addCase(fetchRunningDinner.fulfilled, (state, action) => {
      handleFetchSucceeded(state.runningDinner, action.payload);
    })
    .addCase(fetchRunningDinner.pending, (state) => {
      handleFetchLoading(state.runningDinner);
    })
    .addCase(fetchRunningDinner.rejected, (state, action) => {
      handleFetchRejected(state.runningDinner, action);
    })
    .addCase(setUpdatedRunningDinner, (state, action) => {
      state.runningDinner.data = action.payload;
    });
});

// *** Selectors *** //
export const getRunningDinnerMandatorySelector = (state: AdminStateType): RunningDinner => {
  if (!state.root.runningDinner.data) {
    throw new Error('Selector may only be called after running dinner was successfully loaded!');
  }
  return state.root.runningDinner.data;
};

export const getRunningDinnerFetchSelector = (state: AdminStateType) => state.root.runningDinner;

export const isFetchingDataSelector = (state: AdminStateType) => {
  const loadingItems = getFetchDataItems(state).filter((item) => item?.fetchStatus === FetchStatus.LOADING);
  return loadingItems.length > 0;
};

export const getFetchDataErrorSelector = (state: AdminStateType): HttpError | undefined => {
  const errorItems = getFetchDataItems(state).filter((item) => item?.fetchError !== undefined && item?.fetchError !== null);
  return errorItems.length > 0 ? errorItems[0].fetchError : undefined;
};

// *** Helpers *** //
const getFetchDataItems = (state: AdminStateType): FetchData<any>[] => {
  return [state.root.runningDinner, state.messages.recipients, state.messageJobDetails.messageTasks, state.messageJobDetails.messageJob];
};
