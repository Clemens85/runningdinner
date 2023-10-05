import {AnyAction, configureStore, ThunkAction} from "@reduxjs/toolkit";
import {logger} from "redux-logger";
import {combineReducers} from 'redux';
import {adminSlice} from "./AdminSlice";
import {dashboardSlice} from "./DashboardSlice";
import {messagesSlice} from "./MessagesSlice";
import {messageJobDetailsSlice} from "./MessageJobDetailsSlice";
import {paymentOptionsSlice} from "./PaymentOptionsSlice";

export const adminStore = configureStore({
  reducer: combineReducers({
    root: adminSlice,
    dashboard: dashboardSlice,
    messages: messagesSlice,
    messageJobDetails: messageJobDetailsSlice,
    paymentOptions: paymentOptionsSlice
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}).concat(logger)
});

export type AdminStateType = ReturnType<typeof adminStore.getState>;

export type AdminThunk<ReturnType = void> = ThunkAction<ReturnType, AdminStateType, unknown, AnyAction>;