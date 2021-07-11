import {configureStore, getDefaultMiddleware, ThunkAction, Action} from "@reduxjs/toolkit";
import {logger} from "redux-logger";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import { combineReducers } from 'redux';
import {adminSlice} from "./AdminSlice";
import {dashboardSlice} from "./DashboardSlice";
import {messagesSlice} from "./MessagesSlice";

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false // I want to use Dates in Redux for now (no persistence of store needed for now...)
})
const middleware = [...customizedMiddleware, logger];

export const adminStore = configureStore({
  reducer: combineReducers({
    root: adminSlice,
    dashboard: dashboardSlice,
    messages: messagesSlice,
  }),
  middleware
});

export type AdminStateType = ReturnType<typeof adminStore.getState>;

export const useAdminSelector: TypedUseSelectorHook<AdminStateType> = useSelector

export type AdminThunk = ThunkAction<void, AdminStateType, null, Action<string>>;