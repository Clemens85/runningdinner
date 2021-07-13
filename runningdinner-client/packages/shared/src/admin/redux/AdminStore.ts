import {AnyAction, configureStore, ThunkAction} from "@reduxjs/toolkit";
import {logger} from "redux-logger";
import {combineReducers} from 'redux';
import {adminSlice} from "./AdminSlice";
import {dashboardSlice} from "./DashboardSlice";
import {messagesSlice} from "./MessagesSlice";

export const adminStore = configureStore({
  reducer: combineReducers({
    root: adminSlice,
    dashboard: dashboardSlice,
    messages: messagesSlice,
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}).concat(logger)
});

export type AdminStateType = ReturnType<typeof adminStore.getState>;

export type AdminThunk<ReturnType = void> = ThunkAction<ReturnType, AdminStateType, unknown, AnyAction>;