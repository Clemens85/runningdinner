import { QueryClient } from "@tanstack/react-query";

// Create a client
export function createDefaultQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'always', // We want always an fetch-error, even if the client seems to be offline (which might anywaay be a false indication)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}
