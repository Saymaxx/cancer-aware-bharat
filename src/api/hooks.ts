import { useQuery } from '@tanstack/react-query';
import { getDatabaseHealth, getIntegrationStatus, getOrgSettings, getStaffMe, listAdmins, listAuditLogs, listBackups, listBlogs, listCampaignRequests, listDonations, listDonationsMonthly, listEnquiries, listEvents, listHospitals, listMyCampaigns, listMyEvents, listMyHospitalDoctors, listMyHospitalReports, listMyNgoReferrals, listMyPatientEnquiries, listMyPatientRecords, listMyVolunteerFeedback, listMyVolunteerHours, listNotifications, listPartnerRequests, listPatientIntakeMonthly, listPatientRecords, listRoles, listVolunteerFeedback, listVolunteerHoursMonthly, listVolunteers } from './client';
import { mapApiAdmin, mapApiAuditLog, mapApiBlog, mapApiCampaignRequest, mapApiCustomRole, mapApiEnquiry, mapApiEvent, mapApiHospital, mapApiNotification } from './mappers';

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

/** A hospital's own doctor roster (Hospital Dashboard, self-service). */
export function useHospitalDoctors(token: string | null) {
  const query = useQuery({
    queryKey: ['hospital-doctors-mine', token],
    queryFn: () => listMyHospitalDoctors(token as string),
    enabled: !!token,
  });

  return {
    doctors: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load doctors' : null,
    refetch: query.refetch,
  };
}

/** NGO patient referrals sent to this hospital (Hospital Dashboard, self-service). */
export function useNgoReferrals(token: string | null) {
  const query = useQuery({
    queryKey: ['ngo-referrals-mine', token],
    queryFn: () => listMyNgoReferrals(token as string),
    enabled: !!token,
  });

  return {
    referrals: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load referrals' : null,
    refetch: query.refetch,
  };
}

/** Patients assigned to the logged-in hospital (Hospital Dashboard,
 * self-service) -- distinct from usePatientRecords, which is Admin's
 * cross-hospital case-record manager. */
export function useMyPatientRecords(token: string | null) {
  const query = useQuery({
    queryKey: ['patient-records-mine', token],
    queryFn: () => listMyPatientRecords(token as string),
    enabled: !!token,
  });

  return {
    patientRecords: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load patient records' : null,
    refetch: query.refetch,
  };
}

/** Medical report documents uploaded for the logged-in hospital's own
 * patients (Hospital Dashboard, self-service). */
export function useMyHospitalReports(token: string | null) {
  const query = useQuery({
    queryKey: ['hospital-reports-mine', token],
    queryFn: () => listMyHospitalReports(token as string),
    enabled: !!token,
  });

  return {
    reports: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load medical reports' : null,
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

/** A logged-in volunteer's own submitted feedback + any admin responses. */
export function useMyVolunteerFeedback(token: string | null) {
  const query = useQuery({
    queryKey: ['my-volunteer-feedback', token],
    queryFn: () => listMyVolunteerFeedback(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    feedback: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load your feedback' : null,
    refetch: query.refetch,
  };
}

/** A logged-in volunteer's own logged hours. */
export function useMyVolunteerHours(token: string | null) {
  const query = useQuery({
    queryKey: ['my-volunteer-hours', token],
    queryFn: () => listMyVolunteerHours(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    hoursLogs: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load your hours' : null,
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

/** Awareness drives co-hosted with the logged-in hospital (Hospital
 * Dashboard, self-service) -- a filtered subset of useEvents' public list. */
export function useMyEvents(token: string | null) {
  const query = useQuery({
    queryKey: ['events-mine', token],
    queryFn: () => listMyEvents(token as string),
    enabled: !!token,
  });

  return {
    events: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load campaigns' : null,
    refetch: query.refetch,
  };
}

/** The logged-in volunteer's own campaign enrollments (Volunteer Dashboard
 * Campaigns tab / Overview) -- each row embeds the full Event. */
export function useMyCampaigns(token: string | null) {
  const query = useQuery({
    queryKey: ['campaigns-mine', token],
    queryFn: () => listMyCampaigns(token as string),
    enabled: !!token,
  });

  return {
    campaigns: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load your campaigns' : null,
    refetch: query.refetch,
  };
}

/** Custom RBAC roles (SuperAdmin Roles & Permissions tab) -- persistence
 * only, per the confirmed scope decision. Superadmin-only endpoint. */
export function useRoles(token: string | null) {
  const query = useQuery({
    queryKey: ['roles', token],
    queryFn: () => listRoles(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    roles: (query.data ?? []).map(mapApiCustomRole),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load roles' : null,
    refetch: query.refetch,
  };
}

/** Real monthly aggregates for the SuperAdmin Analytics tab. Superadmin-
 * only endpoints. */
export function useDonationsMonthly(token: string | null) {
  const query = useQuery({
    queryKey: ['analytics-donations-monthly', token],
    queryFn: () => listDonationsMonthly(token as string),
    enabled: !!token,
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load donation analytics' : null,
  };
}

export function usePatientIntakeMonthly(token: string | null) {
  const query = useQuery({
    queryKey: ['analytics-patient-intake-monthly', token],
    queryFn: () => listPatientIntakeMonthly(token as string),
    enabled: !!token,
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load patient intake analytics' : null,
  };
}

export function useVolunteerHoursMonthly(token: string | null) {
  const query = useQuery({
    queryKey: ['analytics-volunteer-hours-monthly', token],
    queryFn: () => listVolunteerHoursMonthly(token as string),
    enabled: !!token,
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load volunteer hours analytics' : null,
  };
}

/** Regional Admin accounts (SuperAdmin Admin Management tab). Superadmin-
 * only endpoint -- never lists other Super Admins. */
export function useAdmins(token: string | null) {
  const query = useQuery({
    queryKey: ['admins', token],
    queryFn: () => listAdmins(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    admins: (query.data ?? []).map(mapApiAdmin),
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load admin accounts' : null,
    refetch: query.refetch,
  };
}

/** Real database size/table/record/uptime stats (SuperAdmin Database Backup
 * tab). Superadmin-only endpoint. */
export function useDatabaseHealth(token: string | null) {
  const query = useQuery({
    queryKey: ['database-health', token],
    queryFn: () => getDatabaseHealth(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    health: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load database health' : null,
  };
}

/** Real backup history (logical JSON dumps written by POST /database/backups).
 * Superadmin-only endpoint. */
export function useBackups(token: string | null) {
  const query = useQuery({
    queryKey: ['backups', token],
    queryFn: () => listBackups(token as string),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    backups: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load backup history' : null,
    refetch: query.refetch,
  };
}

/** Real single-row NGO settings (SuperAdmin System Settings tab).
 * Superadmin-only endpoint. */
export function useOrgSettings(token: string | null) {
  const query = useQuery({
    queryKey: ['org-settings', token],
    queryFn: () => getOrgSettings(token as string),
    enabled: !!token,
  });

  return {
    settings: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message || 'Failed to load organization settings' : null,
    refetch: query.refetch,
  };
}

/** Real email/payment-gateway configuration status (SuperAdmin System
 * Settings tab). Superadmin-only endpoint. */
export function useIntegrationStatus(token: string | null) {
  const query = useQuery({
    queryKey: ['integration-status', token],
    queryFn: () => getIntegrationStatus(token as string),
    enabled: !!token,
  });

  return {
    status: query.data ?? null,
    loading: query.isLoading,
  };
}

/** The logged-in staff member's own profile (SuperAdmin/Admin Profile tab).
 * Works for both admin and superadmin -- unlike /admins, which never lists
 * Super Admin accounts. */
export function useStaffMe(token: string | null) {
  const query = useQuery({
    queryKey: ['staff-me', token],
    queryFn: () => getStaffMe(token as string),
    enabled: !!token,
  });

  return {
    me: query.data ?? null,
    loading: query.isLoading,
    refetch: query.refetch,
  };
}
