import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';

import { selfAdminSlice } from './SelfAdminSlice';

export const selfAdminStore = configureStore({
  reducer: selfAdminSlice,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(logger as any),
});

export type SelfAdminStateType = ReturnType<typeof selfAdminStore.getState>;

export type SelfAdminThunk<ReturnType = void> = ThunkAction<ReturnType, SelfAdminStateType, unknown, AnyAction>;
