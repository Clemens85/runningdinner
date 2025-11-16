import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { logger } from 'redux-logger';

import { adminSlice } from './AdminSlice';
import { messageJobDetailsSlice } from './MessageJobDetailsSlice';
import { messagesSlice } from './MessagesSlice';

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
