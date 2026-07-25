export interface Hospital {
  id: string;
  name: string;
  logo: string;
  type: 'Center of Excellence' | 'Community Partner';
  region: 'north' | 'south' | 'east' | 'west';
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

export interface Event {
  id: string;
  title: string;
  type: 'Blood Donation' | 'Screening Camp' | 'Workshop' | 'Awareness';
  image: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  registeredCount: number;
  capacity: number;
}

export interface BlogArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  category: 'Prevention' | 'Nutrition' | 'Survivors' | 'Research';
  image: string;
  tags: string[];
}

export interface VolunteerRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  availableDays: string[];
  motivation: string;
  date: string;
  volunteerId: string;
}

export type EnquiryStatus =
  | 'Pending Admin Review'
  | 'Rejected by Admin'
  | 'Approved by Admin'
  | 'Pending Hospital Assignment'
  | 'Assigned to Hospital'
  | 'Declined by Hospital'
  | 'Accepted by Hospital'
  | 'Appointment Confirmed'
  | 'Completed';

export interface TimelineEvent {
  id: string;
  stage: string;
  description: string;
  timestamp: string;
  actor?: string;
  remarks?: string;
}

export interface AppointmentDetails {
  appointmentId: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  status: 'Appointment Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface UploadedReport {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface PatientEnquiry {
  id: string;
  enquiryId: string;
  referenceNumber: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  city: string;
  state?: string;
  preferredLocation?: string;
  reason: string; // Inquiry stream/reason
  cancerType?: string;
  symptoms?: string;
  notes?: string;
  uploadedReports?: UploadedReport[];
  hospitalId?: string; // Target or Assigned hospital ID
  preferredHospitalName?: string;
  assignedHospitalName?: string;
  preferredDate?: string;
  status: EnquiryStatus;
  priority: 'Normal' | 'Urgent' | 'Critical';

  // Workflow Decision Tracking
  adminDecision?: {
    decidedBy: string;
    decidedAt: string;
    action: 'Approve' | 'Reject';
    remarks?: string;
  };
  superAdminAssignment?: {
    assignedBy: string;
    assignedAt: string;
    hospitalId: string;
    hospitalName: string;
    remarks?: string;
  };
  hospitalDecision?: {
    decidedBy: string;
    decidedAt: string;
    action: 'Accept' | 'Decline';
    remarks?: string;
  };
  appointment?: AppointmentDetails;

  timeline: TimelineEvent[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalPartnerRequest {
  id: string;
  hospitalName: string;
  contactName: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  specialties: string;
  motivation: string;
  date: string;
  status: 'Pending' | 'Approved';
}

export interface AppNotification {
  id: string;
  targetRole: 'admin' | 'superadmin' | 'hospital' | 'patient' | 'volunteer';
  targetHospitalId?: string;
  title: string;
  message: string;
  enquiryId?: string;
  timestamp: string;
  read: boolean;
}
