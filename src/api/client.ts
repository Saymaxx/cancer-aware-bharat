// Thin fetch wrapper around the FastAPI backend. Field names on the wire are
// already camelCase (see backend/app/schemas/base.py), so responses need no
// case conversion -- just shape mapping, done in mappers.ts.

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
// The backend now mounts every route at both its original unprefixed path
// and /v1 (see backend/app/main.py) -- /v1 is the new canonical path, kept
// unprefixed too only so nothing external breaks during the transition.
const API_PREFIX = '/v1';

const STAFF_SESSION_KEY = 'aware_bharat_logged_in_staff';
const HOSPITAL_SESSION_KEY = 'aware_bharat_logged_in_hospital';
const VOLUNTEER_SESSION_KEY = 'aware_bharat_logged_in_volunteer';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Every dashboard used to catch API errors independently and show a
// generic "Unable to reach the server" -- a session-expired/revoked 401
// was indistinguishable from a network outage, and nothing ever redirected
// back to login. This runs once, centrally, for any authenticated request
// that comes back 401.
function handleUnauthorized() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) {
    localStorage.removeItem(STAFF_SESSION_KEY);
    if (path !== '/admin') window.location.href = '/admin';
  } else if (path.startsWith('/superadmin')) {
    localStorage.removeItem(STAFF_SESSION_KEY);
    if (path !== '/superadmin') window.location.href = '/superadmin';
  } else if (path.startsWith('/hospital')) {
    localStorage.removeItem(HOSPITAL_SESSION_KEY);
    if (path !== '/hospital/login') window.location.href = '/hospital/login';
  } else if (path.startsWith('/volunteer')) {
    localStorage.removeItem(VOLUNTEER_SESSION_KEY);
    if (path !== '/volunteer/login') window.location.href = '/volunteer/login';
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> | undefined) };
  const isFormData = options.body instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch { /* non-JSON error body */ }
    // Only for requests that were actually authenticated -- a bare login
    // attempt also 401s on wrong credentials, and that must never trigger
    // a "session expired" redirect.
    if (res.status === 401 && token) {
      handleUnauthorized();
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------- Staff (admin/superadmin) session ----------------

export interface StaffSession {
  role: 'admin' | 'superadmin';
  email: string;
  name: string;
  accessToken: string;
  lastAccess: string;
  sessionKey: string;
}

export function getStaffSession(): StaffSession | null {
  const raw = localStorage.getItem(STAFF_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStaffSession(session: StaffSession) {
  localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
}

// ---------------- Hospital session ----------------

export interface HospitalSession {
  name: string;
  email: string;
  accessToken: string;
  sessionKey: string;
  loginTime: string;
}

export function getHospitalSession(): HospitalSession | null {
  const raw = localStorage.getItem(HOSPITAL_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setHospitalSession(session: HospitalSession) {
  localStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));
}

// ---------------- Volunteer session ----------------

export interface VolunteerSession {
  fullName: string;
  email: string;
  volunteerId: string;
  city: string;
  domain: string;
  accessToken: string;
}

export function getVolunteerSession(): VolunteerSession | null {
  const raw = localStorage.getItem(VOLUNTEER_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setVolunteerSession(session: VolunteerSession) {
  localStorage.setItem(VOLUNTEER_SESSION_KEY, JSON.stringify(session));
}

// ---------------- Auth ----------------

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  role: string;
  name: string;
}

export async function loginStaff(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginHospital(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/hospital/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginVolunteer(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/volunteer/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface RegisterVolunteerPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  area?: string;
  motivation?: string;
}

export interface ApiVolunteer {
  id: string;
  volunteerId: string;
  name: string;
  email: string;
  phone: string;
  area: string | null;
  availableDays: string[];
  motivation: string | null;
  createdAt: string;
}

export function registerVolunteer(payload: RegisterVolunteerPayload): Promise<ApiVolunteer> {
  return request<ApiVolunteer>('/auth/volunteer/register', { method: 'POST', body: JSON.stringify(payload) });
}

export function getMyVolunteerProfile(token: string): Promise<ApiVolunteer> {
  return request<ApiVolunteer>('/volunteers/me', {}, token);
}

// Revokes the token server-side (see backend/app/routers/auth.py logout).
// Best-effort: callers still clear localStorage and navigate away even if
// this fails (e.g. the token already expired), since the user's intent to
// leave shouldn't be blocked by a network hiccup.
export async function logout(token: string): Promise<void> {
  try {
    await request<void>('/auth/logout', { method: 'POST' }, token);
  } catch {
    /* already logged out / expired / offline -- nothing more to do */
  }
}

// ---------------- Raw API shapes (camelCase, as returned by FastAPI) ----------------

export interface ApiUploadedReport {
  id: string;
  name: string;
  size: string | null;
  type: string | null;
  url: string;
  uploadedAt: string;
}

export interface ApiTimelineEvent {
  id: string;
  stage: string;
  description: string;
  actor: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface ApiAppointment {
  id: string;
  appointmentId: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  status: string;
  createdAt: string;
}

export interface ApiPatientEnquiry {
  id: string;
  enquiryId: string;
  referenceNumber: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
  state: string | null;
  preferredLocation: string | null;
  reason: string;
  cancerType: string | null;
  symptoms: string | null;
  notes: string | null;
  hospitalId: string | null;
  preferredHospitalName: string | null;
  assignedHospitalName: string | null;
  preferredDate: string | null;
  status: string;
  priority: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  uploadedReports: ApiUploadedReport[];
  timeline: ApiTimelineEvent[];
  appointment: ApiAppointment | null;
  // Flat decision fields -- reassembled into nested objects by mapApiEnquiry()
  adminDecidedBy?: string | null;
  adminDecidedAt?: string | null;
  adminAction?: string | null;
  adminRemarks?: string | null;
  superAdminAssignedBy?: string | null;
  superAdminAssignedAt?: string | null;
  superAdminRemarks?: string | null;
  hospitalDecidedBy?: string | null;
  hospitalDecidedAt?: string | null;
  hospitalAction?: string | null;
  hospitalRemarks?: string | null;
}

export interface ApiHospital {
  id: string;
  name: string;
  logo: string | null;
  type: string;
  region: string;
  city: string;
  state: string;
  specialties: string[];
  phone: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
}

export interface ApiNotification {
  id: string;
  targetRole: string;
  targetHospitalId: string | null;
  title: string;
  message: string;
  enquiryId: string | null;
  read: boolean;
  createdAt: string;
}

// ---------------- Enquiries ----------------

export interface SubmitEnquiryPayload {
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  city: string;
  state?: string;
  preferredLocation?: string;
  reason: string;
  cancerType?: string;
  symptoms?: string;
  notes?: string;
  preferredHospitalId?: string;
  preferredDate?: string;
}

export function submitEnquiry(payload: SubmitEnquiryPayload): Promise<ApiPatientEnquiry> {
  return request<ApiPatientEnquiry>('/enquiries', { method: 'POST', body: JSON.stringify(payload) });
}

export function uploadEnquiryReport(enquiryId: string, file: File, phone: string): Promise<ApiUploadedReport> {
  const form = new FormData();
  form.append('file', file);
  form.append('phone', phone);
  return request<ApiUploadedReport>(`/enquiries/${enquiryId}/reports`, { method: 'POST', body: form });
}

// The download route requires a Bearer token, so a plain <a href> can't hit
// it directly (and putting the token in the URL as a query param is exactly
// the kind of thing that must never happen). Fetches the file as a blob
// with the auth header, then triggers the save the same way a normal link
// would.
export async function downloadEnquiryReport(enquiryId: string, reportId: string, token: string, filename: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/enquiries/${enquiryId}/reports/${reportId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch { /* non-JSON error body */ }
    if (res.status === 401) handleUnauthorized();
    throw new ApiError(res.status, detail);
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export function listEnquiries(token: string): Promise<ApiPatientEnquiry[]> {
  return request<ApiPatientEnquiry[]>('/enquiries', {}, token);
}

export function adminApproveEnquiry(id: string, token: string, remarks?: string): Promise<ApiPatientEnquiry> {
  return request<ApiPatientEnquiry>(`/enquiries/${id}/admin-approve`, {
    method: 'POST',
    body: JSON.stringify({ remarks }),
  }, token);
}

export function adminRejectEnquiry(id: string, token: string, rejectionReason: string): Promise<ApiPatientEnquiry> {
  return request<ApiPatientEnquiry>(`/enquiries/${id}/admin-reject`, {
    method: 'POST',
    body: JSON.stringify({ rejectionReason }),
  }, token);
}

export function assignHospital(id: string, token: string, hospitalId: string, remarks?: string): Promise<ApiPatientEnquiry> {
  return request<ApiPatientEnquiry>(`/enquiries/${id}/assign-hospital`, {
    method: 'POST',
    body: JSON.stringify({ hospitalId, remarks }),
  }, token);
}

export function hospitalAcceptEnquiry(
  id: string,
  token: string,
  appointmentDate: string,
  appointmentTime: string,
  doctorName: string,
  remarks?: string,
): Promise<ApiPatientEnquiry> {
  return request<ApiPatientEnquiry>(`/enquiries/${id}/hospital-accept`, {
    method: 'POST',
    body: JSON.stringify({ appointmentDate, appointmentTime, doctorName, remarks }),
  }, token);
}

export function hospitalDeclineEnquiry(id: string, token: string, declineReason: string): Promise<ApiPatientEnquiry> {
  return request<ApiPatientEnquiry>(`/enquiries/${id}/hospital-decline`, {
    method: 'POST',
    body: JSON.stringify({ declineReason }),
  }, token);
}

export function completeEnquiryTreatment(id: string, token: string, remarks?: string): Promise<ApiPatientEnquiry> {
  return request<ApiPatientEnquiry>(`/enquiries/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ remarks }),
  }, token);
}

// ---------------- Hospitals ----------------

export function listHospitals(): Promise<ApiHospital[]> {
  return request<ApiHospital[]>('/hospitals');
}

// ---------------- Notifications ----------------

export function listNotifications(token: string): Promise<ApiNotification[]> {
  return request<ApiNotification[]>('/notifications', {}, token);
}
