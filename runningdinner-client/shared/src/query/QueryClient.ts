import { QueryClient, UseQueryResult } from '@tanstack/react-query';

// Create a client
export function createDefaultQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'always', // We want always an fetch-error, even if the client seems to be offline (which might anywaay be a false indication)
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: Infinity,
      },
    },
  });
}

export function isQuerySucceeded(query: UseQueryResult<unknown, unknown>) {
  if (query.error) {
    return false;
  }
  if (!query.data && query.isFetched) {
    return true;
  }
  return !!query.data;
}

export function isAllQueriesSucceeded(queries: UseQueryResult<unknown, unknown>[]) {
  return queries.every((query) => isQuerySucceeded(query));
}
