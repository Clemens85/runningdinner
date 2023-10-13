import {createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {newInitialPaymentOptionsState} from "./StoreTypes";
import {findPaymentOptionsAsync} from "../PaymentOptionsService";
import {handleFetchLoading, handleFetchRejected, handleFetchSucceeded} from "../../redux";
import {AdminStateType} from "./AdminStore";
import {PaymentOptions} from "../../types";

export const fetchPaymentOptions = createAsyncThunk(
  'fetchPaymentOptions',
  async (adminId: string) => {
    return await findPaymentOptionsAsync(adminId);
  }
);

export const updatePaymentOptions = createAction<PaymentOptions | undefined>('addPaymentOptions');

export const paymentOptionsSlice = createReducer(newInitialPaymentOptionsState(), builder => {
  builder.addCase(fetchPaymentOptions.fulfilled, (state, action) => {
    handleFetchSucceeded(state.paymentOptions, action.payload);
  }).addCase(fetchPaymentOptions.rejected, (state, action) => {
    handleFetchRejected(state.paymentOptions, action.payload);
  }).addCase(fetchPaymentOptions.pending, (state) => {
    handleFetchLoading(state.paymentOptions);
  }).addCase(updatePaymentOptions, (state, action) => {
    // Set as if it were loaded from backend
    handleFetchSucceeded(state.paymentOptions, action.payload);
  });
});

export const getPaymentOptionsFetchSelector = (state: AdminStateType) => state.paymentOptions.paymentOptions;