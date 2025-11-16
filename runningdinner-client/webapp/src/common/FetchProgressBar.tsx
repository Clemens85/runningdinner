import { GENERIC_HTTP_ERROR, getAsHttpErrorOrDefault } from '@runningdinner/shared';
import { UseQueryResult } from '@tanstack/react-query';
import { ProgressBar } from './ProgressBar';

export type FetchProgressBarProps = {} & Pick<UseQueryResult<unknown, unknown>, 'error' | 'isPending'>;
export function FetchProgressBar(query: FetchProgressBarProps) {
  const { error, isPending } = query;
  const httpFetchError = error ? getAsHttpErrorOrDefault(error, GENERIC_HTTP_ERROR) : undefined;
  return <ProgressBar showLoadingProgress={isPending} fetchError={httpFetchError} />;
}

export type FetchProgressBarMultipleQueriesProps = {
  queries: FetchProgressBarProps[];
};

export function FetchProgressBarMultipleQueries({ queries }: FetchProgressBarMultipleQueriesProps) {
  const isAnyPending = queries.some((query) => query.isPending);
  const queriesWithError = queries.filter((query) => query.error);
  const httpFetchError = queriesWithError.length > 0 ? getAsHttpErrorOrDefault(queriesWithError[0].error, GENERIC_HTTP_ERROR) : undefined;
  return <ProgressBar showLoadingProgress={isAnyPending} fetchError={httpFetchError} />;
}
