import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { logger } from 'redux-logger';

import { wizardSlice } from './WizardSlice';

export const wizardStore = configureStore({
  reducer: wizardSlice,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // I want to use Dates in Redux for now (no persistence of store needed for now...)
    }).concat(logger as any),
});

export type WizardRootState = ReturnType<typeof wizardStore.getState>;

export type WizardDispatch = typeof wizardStore.dispatch;
export const useWizardDispatch = () => useDispatch<WizardDispatch>();
export const useWizardSelector: TypedUseSelectorHook<WizardRootState> = useSelector;
export type WizardThunk = ThunkAction<void, WizardRootState, null, Action<string>>;
