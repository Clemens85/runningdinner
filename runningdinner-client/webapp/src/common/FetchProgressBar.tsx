import { GENERIC_HTTP_ERROR, getAsHttpErrorOrDefault } from "@runningdinner/shared";
import { UseQueryResult } from "@tanstack/react-query";
import { ProgressBar } from "./ProgressBar";

export type FetchProgressBarProps = {
} & Pick<UseQueryResult<unknown, unknown>, "error" | "isPending">;


export function FetchProgressBar(query: FetchProgressBarProps) {
  const {error, isPending} = query;
  const httpFetchError = error ? getAsHttpErrorOrDefault(error, GENERIC_HTTP_ERROR) : undefined;
  return <ProgressBar showLoadingProgress={isPending} fetchError={httpFetchError} />;
}