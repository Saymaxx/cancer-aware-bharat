import { useQuery } from '@tanstack/react-query';
import { listEnquiries, listHospitals, listNotifications } from './client';
import { mapApiEnquiry, mapApiHospital, mapApiNotification } from './mappers';

const POLL_INTERVAL_MS = 20000;

/** Enquiries visible to the logged-in staff member. Refetches on an interval
 * and exposes `refetch` so action handlers can force an immediate refresh
 * right after a mutation (approve/reject/assign) succeeds.
 *
 * Previously hand-rolled with useState/useEffect/setInterval: every
 * dashboard instance ran its own independent fetch loop with no caching or
 * dedup between them, and the interval kept polling unconditionally even
 * with the tab in the background. React Query's refetchInterval already
 * pauses while the tab is hidden and refetches on refocus, and dedupes
 * concurrent requests for the same token across components for free.
 */
export function useApiEnquiries(token: string | null) {
  const query = useQuery({
    queryKey: ['enquiries', token],
    queryFn: () => listEnquiries(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    enquiries: (query.data ?? []).map(mapApiEnquiry),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load enquiries' : null,
    refetch: query.refetch,
  };
}

export function useApiNotifications(token: string | null) {
  const query = useQuery({
    queryKey: ['notifications', token],
    queryFn: () => listNotifications(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    // Notifications are non-critical; fail silently rather than blocking the dashboard.
    notifications: (query.data ?? []).map(mapApiNotification),
    refetch: query.refetch,
  };
}

/** Public hospital directory -- used by the patient enquiry form and the
 * Super Admin hospital-assignment picker. */
export function useApiHospitals() {
  const query = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => listHospitals(),
  });

  return {
    hospitals: (query.data ?? []).map(mapApiHospital),
    loading: query.isLoading,
  };
}
