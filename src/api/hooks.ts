import { useQuery } from '@tanstack/react-query';
import { listAuditLogs, listBlogs, listCampaignRequests, listDonations, listEnquiries, listEvents, listHospitals, listMyPatientEnquiries, listNotifications, listPartnerRequests, listPatientRecords, listVolunteerFeedback, listVolunteers } from './client';
import { mapApiAuditLog, mapApiBlog, mapApiCampaignRequest, mapApiEnquiry, mapApiEvent, mapApiHospital, mapApiNotification } from './mappers';

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

/** A logged-in patient's own enquiries (patient_id match or phone match to
 * older/guest submissions -- see GET /patients/me/enquiries). Same
 * refetch-on-interval behavior as useApiEnquiries. */
export function useMyPatientEnquiries(token: string | null) {
  const query = useQuery({
    queryKey: ['patient-enquiries', token],
    queryFn: () => listMyPatientEnquiries(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    enquiries: (query.data ?? []).map(mapApiEnquiry),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load your enquiries' : null,
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

/** Hospital partner requests visible to admin/superadmin. Returned raw
 * (not mapped) -- AdminDashboard and SuperAdminDashboard each project this
 * into their own pre-existing local display shape. */
export function usePartnerRequests(token: string | null) {
  const query = useQuery({
    queryKey: ['partner-requests', token],
    queryFn: () => listPartnerRequests(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    partnerRequests: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load hospital partner requests' : null,
    refetch: query.refetch,
  };
}

/** Volunteers visible to admin/superadmin, including their approval status.
 * Returned raw -- AdminDashboard projects this into its own local display shape. */
export function useVolunteers(token: string | null) {
  const query = useQuery({
    queryKey: ['volunteers', token],
    queryFn: () => listVolunteers(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    volunteers: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load volunteers' : null,
    refetch: query.refetch,
  };
}

/** Admin-managed patient case records (Patients Manager) -- distinct from
 * useMyPatientEnquiries, which is a logged-in patient's own enquiries. */
export function usePatientRecords(token: string | null) {
  const query = useQuery({
    queryKey: ['patient-records', token],
    queryFn: () => listPatientRecords(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    patientRecords: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load patient records' : null,
    refetch: query.refetch,
  };
}

/** Donation ledger entries (Donations Audit). */
export function useDonations(token: string | null) {
  const query = useQuery({
    queryKey: ['donations', token],
    queryFn: () => listDonations(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    donations: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load donations' : null,
    refetch: query.refetch,
  };
}

/** Volunteer feedback entries (admin review side only -- no submission UI
 * exists yet for volunteers to leave their own feedback). */
export function useVolunteerFeedback(token: string | null) {
  const query = useQuery({
    queryKey: ['volunteer-feedback', token],
    queryFn: () => listVolunteerFeedback(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    feedback: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load volunteer feedback' : null,
    refetch: query.refetch,
  };
}

/** Organization requests to host a campaign (Campaign Requests inbox). No
 * public submission form exists yet -- admin review side only. */
export function useCampaignRequests(token: string | null) {
  const query = useQuery({
    queryKey: ['campaign-requests', token],
    queryFn: () => listCampaignRequests(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    campaignRequests: (query.data ?? []).map(mapApiCampaignRequest),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load campaign requests' : null,
    refetch: query.refetch,
  };
}

/** Real account/security event log (SuperAdmin Audit Logs tab).
 * Superadmin-only endpoint. */
export function useAuditLogs(token: string | null) {
  const query = useQuery({
    queryKey: ['audit-logs', token],
    queryFn: () => listAuditLogs(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    auditLogs: (query.data ?? []).map(mapApiAuditLog),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load audit logs' : null,
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

/** Public blog articles -- used by both the public Blogs page and the
 * admin/superadmin publisher tabs. */
export function useBlogs() {
  const query = useQuery({
    queryKey: ['blogs'],
    queryFn: () => listBlogs(),
  });

  return {
    blogs: (query.data ?? []).map(mapApiBlog),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load blog articles' : null,
    refetch: query.refetch,
  };
}

/** Public events/campaigns -- used by the public Events page, the homepage
 * camps carousel, and the Campaigns Scheduler tabs. */
export function useEvents() {
  const query = useQuery({
    queryKey: ['events'],
    queryFn: () => listEvents(),
  });

  return {
    events: (query.data ?? []).map(mapApiEvent),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load events' : null,
    refetch: query.refetch,
  };
}
