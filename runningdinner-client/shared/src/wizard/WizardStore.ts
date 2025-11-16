import { configureStore, getDefaultMiddleware, ThunkAction, Action } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import { wizardSlice } from './WizardSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false, // I want to use Dates in Redux for now (no persistence of store needed for now...)
});
const middleware = [...customizedMiddleware, logger];

export const wizardStore = configureStore({ reducer: wizardSlice, middleware });

export type WizardRootState = ReturnType<typeof wizardStore.getState>;

export type WizardDispatch = typeof wizardStore.dispatch;
export const useWizardDispatch = () => useDispatch<WizardDispatch>();
export const useWizardSelector: TypedUseSelectorHook<WizardRootState> = useSelector;
export type WizardThunk = ThunkAction<void, WizardRootState, null, Action<string>>;
