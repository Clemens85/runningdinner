import { createAsyncThunk, createReducer } from '@reduxjs/toolkit';

import { findMessageJobByAdminIdAndJobIdAsync, findMessageTasksByAdminIdAndJobIdAsync } from '../../';
import { handleFetchLoading, handleFetchRejected, handleFetchSucceeded } from '../../redux';
import { BaseAdminIdProps } from '../../types';
import { AdminStateType, AdminThunk } from './AdminStore';
import { newInitialMessageJobDetailsState } from './StoreTypes';

export interface MessageJobIdAdminIdPayload extends BaseAdminIdProps {
  messageJobId: string;
}

export function fetchMessageJobDetailsData(adminId: string, messageJobId: string): AdminThunk {
  return async (dispatch) => {
    dispatch(fetchMessageTasks({ adminId, messageJobId }));
    dispatch(fetchMessageJob({ adminId, messageJobId }));
  };
}

const fetchMessageJob = createAsyncThunk('fetchMessageJob', async (props: MessageJobIdAdminIdPayload) => {
  const { adminId, messageJobId } = props;
  return await findMessageJobByAdminIdAndJobIdAsync(adminId, messageJobId);
});

const fetchMessageTasks = createAsyncThunk('fetchMessageTasks', async (props: MessageJobIdAdminIdPayload) => {
  const { adminId, messageJobId } = props;
  return await findMessageTasksByAdminIdAndJobIdAsync(adminId, messageJobId);
});

// *** Reducer *** //
export const messageJobDetailsSlice = createReducer(newInitialMessageJobDetailsState, (builder) => {
  builder
    .addCase(fetchMessageTasks.fulfilled, (state, action) => {
      handleFetchSucceeded(state.messageTasks, action.payload);
    })
    .addCase(fetchMessageTasks.pending, (state) => {
      handleFetchLoading(state.messageTasks);
    })
    .addCase(fetchMessageTasks.rejected, (state, action) => {
      handleFetchRejected(state.messageTasks, action);
    })
    .addCase(fetchMessageJob.fulfilled, (state, action) => {
      handleFetchSucceeded(state.messageJob, action.payload);
    })
    .addCase(fetchMessageJob.pending, (state) => {
      handleFetchLoading(state.messageJob);
    })
    .addCase(fetchMessageJob.rejected, (state, action) => {
      handleFetchRejected(state.messageJob, action);
    });
});

// *** Selectors *** //
export const getMessageJobDetailsSelector = (state: AdminStateType) => state.messageJobDetails.messageJob;
export const getMessageTasksSelector = (state: AdminStateType) => state.messageJobDetails.messageTasks;
