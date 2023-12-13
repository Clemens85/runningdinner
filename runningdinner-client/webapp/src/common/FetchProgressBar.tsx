import { GENERIC_HTTP_ERROR, getAsHttpErrorOrDefault } from "@runningdinner/shared";
import { UseQueryResult } from "@tanstack/react-query";
import { ProgressBar } from "./ProgressBar";

export function FetchProgressBar(query: UseQueryResult<unknown, unknown>) {
  const {error, isFetching} = query;
  const httpFetchError = error ? getAsHttpErrorOrDefault(error, GENERIC_HTTP_ERROR) : undefined;
  return <ProgressBar showLoadingProgress={isFetching} fetchError={httpFetchError} />;
}