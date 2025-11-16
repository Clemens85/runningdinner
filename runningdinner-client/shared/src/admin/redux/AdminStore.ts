import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import { combineReducers } from 'redux';
import { adminSlice } from './AdminSlice';
import { messagesSlice } from './MessagesSlice';
import { messageJobDetailsSlice } from './MessageJobDetailsSlice';

export const adminStore = configureStore({
  reducer: combineReducers({
    root: adminSlice,
    messages: messagesSlice,
    messageJobDetails: messageJobDetailsSlice,
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(logger),
});

export type AdminStateType = ReturnType<typeof adminStore.getState>;

export type AdminThunk<ReturnType = void> = ThunkAction<ReturnType, AdminStateType, unknown, AnyAction>;
