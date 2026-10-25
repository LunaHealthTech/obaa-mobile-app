import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

const MAX_RETRIES = 2;

// A 4xx answer won't change on retry; 401s are refreshed earlier by the
// apiClient interceptor.
function isClientError(error: unknown) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return status !== undefined && status >= 400 && status < 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && !isClientError(error),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
