// Thin fetch wrapper around the FastAPI backend. Field names on the wire are
// already camelCase (see backend/app/schemas/base.py), so responses need no
// case conversion -- just shape mapping, done in mappers.ts.

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const STAFF_SESSION_KEY = 'aware_bharat_logged_in_staff';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> | undefined) };
  const isFormData = options.body instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch { /* non-JSON error body */ }
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

export function uploadEnquiryReport(enquiryId: string, file: File): Promise<ApiUploadedReport> {
  const form = new FormData();
  form.append('file', file);
  return request<ApiUploadedReport>(`/enquiries/${enquiryId}/reports`, { method: 'POST', body: form });
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

// ---------------- Hospitals ----------------

export function listHospitals(): Promise<ApiHospital[]> {
  return request<ApiHospital[]>('/hospitals');
}

// ---------------- Notifications ----------------

export function listNotifications(token: string): Promise<ApiNotification[]> {
  return request<ApiNotification[]>('/notifications', {}, token);
}
