import {getAsHttpErrorOrDefault, HttpError} from "@runningdinner/shared";

export enum FetchStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED"
}

export interface FetchData<T> {
  fetchStatus: FetchStatus;
  fetchError?: HttpError;
  data?: T;
}

export function handleFetchSucceeded<T>(fetchData: FetchData<T>, payload: T) {
  fetchData.data = payload;
  fetchData.fetchStatus = FetchStatus.SUCCEEDED;
  fetchData.fetchError = mapFetchErrorState(FetchStatus.SUCCEEDED);
}

export function handleFetchLoading<T>(fetchData: FetchData<T>) {
  fetchData.fetchStatus = FetchStatus.LOADING;
  fetchData.fetchError = mapFetchErrorState(FetchStatus.LOADING);
}

export function handleFetchRejected<T>(fetchData: FetchData<T>, action?: any) {
  fetchData.fetchStatus = FetchStatus.FAILED;
  fetchData.fetchError = mapFetchErrorState(FetchStatus.FAILED, action);
}

export const GENERIC_HTTP_ERROR: HttpError = { // Will trigger a generic error message (-> useNotificationHttpError)
  response: {
    status: 500,
    data: {}
  }
}

function mapFetchErrorState(fetchStatus: FetchStatus, action?: any): HttpError | undefined {
  let result = undefined;
  if (fetchStatus === FetchStatus.FAILED) {
    result = getAsHttpErrorOrDefault(action?.payload, GENERIC_HTTP_ERROR)
    // @ts-ignore
    console.log(`Fetch error: ${JSON.stringify(action)}`);
  }
  return result;
}

export const INITIAL_FETCH_DATA = {
  fetchStatus: FetchStatus.IDLE,
}