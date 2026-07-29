import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

// React Query's default retry (3 attempts, exponential backoff) is meant for
// transient failures -- a network blip, a momentary 5xx. A 401/403 is not
// transient: handleUnauthorized() in client.ts already fires and starts
// navigating away on the very first one, so retrying it 3 more times before
// the query settles only burns extra requests against endpoints that are
// themselves rate-limited, and does so on every dashboard's 20s poll for as
// long as the stale/revoked token stays cached.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return false;
        return failureCount < 3;
      },
    },
  },
});
