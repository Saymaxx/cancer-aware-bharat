// ============================================================
// Hospital Partner Dashboard — Mock Data & Interfaces
// ============================================================

export interface HospitalKpiMetrics {
  totalReferredPatients: number;
  patientsUnderTreatment: number;
  completedTreatments: number;
  upcomingAwarenessCamps: number;
  assignedDoctorsCount: number;
  pendingMedicalReports: number;
  financialAidRequestsCount: number;
  partnershipStatus: 'Active Partner' | 'Under Audit' | 'Renewal Pending';
}

export interface AssignedPatient {
  id: string;
  ngoRefId: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  diagnosis: string;
  cancerStage: string;
  treatmentStatus: 'Under Review' | 'Under Treatment' | 'Completed' | 'Referred' | 'Emergency';
  assignedDoctor: string;
  admissionDate: string;
  city: string;
  phone: string;
  reportsCount: number;
  prescriptionUploaded: boolean;
  remarks: string;
  estimatedCost: number | null;
}

export interface NgoReferral {
  id: string;
  patientName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  referralDate: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  cancerType: string;
  recommendedDepartment: string;
  referredByNgoAgent: string;
  status: 'Pending Action' | 'Accepted' | 'Declined';
  declineReason?: string;
}

export interface HospitalCampaign {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  expectedScreenings: number;
  assignedDoctors: string[];
  volunteerCount: number;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  category: string;
}

export interface HospitalReport {
  id: string;
  patientId: string;
  patientName: string;
  reportType: 'Prescription' | 'Lab Test' | 'Biopsy' | 'CT/MRI Scan' | 'Discharge Summary';
  uploadDate: string;
  uploadedByDoctor: string;
  fileSize: string;
  fileName: string;
}

export interface HospitalDoctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  phone: string;
  email: string;
  availability: 'Available' | 'In Surgery' | 'On Leave';
  assignedPatientsCount: number;
}

export interface FinancialAidVerification {
  id: string;
  patientName: string;
  ngoCaseId: string;
  requestDate: string;
  estimatedCost: number;
  verifiedAmount: number;
  status: 'Pending Verification' | 'Cost Verified' | 'Aid Disbursed' | 'Rejected';
  department: string;
  notes: string;
}

export interface HospitalNotification {
  id: string;
  title: string;
  message: string;
  type: 'patient' | 'campaign' | 'announcement' | 'financial' | 'reminder';
  timestamp: string;
  read: boolean;
}

export interface HospitalActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  module: string;
}

// ---- Initial Mock KPI Metrics ----
export const INITIAL_HOSPITAL_KPI: HospitalKpiMetrics = {
  totalReferredPatients: 142,
  patientsUnderTreatment: 38,
  completedTreatments: 94,
  upcomingAwarenessCamps: 3,
  assignedDoctorsCount: 8,
  pendingMedicalReports: 5,
  financialAidRequestsCount: 4,
  partnershipStatus: 'Active Partner',
};

// ---- Medical Reports ----
// ---- Financial Aid Verifications ----
// ---- Notifications ----
export const INITIAL_HOSPITAL_NOTIFICATIONS: HospitalNotification[] = [
  { id: 'NOTIF-H1', title: 'New NGO Patient Assigned', message: 'Patient Amitabh Sen (Esophageal Adenocarcinoma) referred by CAB Delhi node for urgent oncology review.', type: 'patient', timestamp: '10 mins ago', read: false },
  { id: 'NOTIF-H2', title: 'Campaign Staffing Invitation', message: 'Lions Club Screening Camp scheduled for Jul 26 requires 2 senior oncologists on site.', type: 'campaign', timestamp: '1 hour ago', read: false },
  { id: 'NOTIF-H3', title: 'Financial Aid Verification Approved', message: 'CAB Trust approved ₹1,50,000 subsidy for Sunita Devi (PAT-2026-8941).', type: 'financial', timestamp: '3 hours ago', read: true },
  { id: 'NOTIF-H4', title: 'CAB Trust Admin Announcement', message: 'Q3 Partner Hospital Coordination Summit scheduled for Aug 10, 2026 via VC.', type: 'announcement', timestamp: 'Yesterday', read: true },
];

// ---- Hospital Profile Metadata ----
export const INITIAL_HOSPITAL_PROFILE = {
  name: 'Rajiv Gandhi Cancer Institute & Research Centre',
  shortName: 'RGCI',
  licenseNo: 'REG-DEL-2024-8902',
  nabhNo: 'NABH-HOSP-2025-0412',
  accreditationStatus: 'NABH & NABL Accredited Center of Excellence',
  address: 'D Block, Sector 5, Rohini, New Delhi — 110085',
  city: 'New Delhi',
  state: 'Delhi',
  phone: '+91 11 4702 2222',
  emergencyPhone: '+91 11 4702 2200',
  email: 'rgci@awarebharat.org',
  website: 'www.rgcirc.org',
  bedCount: 300,
  oncologyBeds: 120,
  icuBeds: 35,
  workingHours: '24x7 Emergency Services • OPD: 08:30 AM - 05:00 PM',
  departments: [
    'Surgical Oncology', 'Medical Oncology', 'Radiation Oncology',
    'Gynecological Oncology', 'Pediatric Oncology', 'Neuro-Oncology',
    'Nuclear Medicine & PET-CT', 'Palliative & Supportive Care'
  ],
  facilities: [
    'TrueBeam STx Radiation System', 'PET-CT & SPECT Scanner', 'Dedicated Chemotherapy Daycare (40 Beds)',
    'Blood Bank & Component Separator', 'Bone Marrow Transplant Unit', 'Robotic Surgery Suite'
  ]
};

// ---- Activity Log ----
export const INITIAL_HOSPITAL_ACTIVITY_LOG: HospitalActivityLog[] = [
  { id: 'LOG-H01', timestamp: 'Jul 22, 2026 — 10:30 AM', action: 'Prescription Uploaded', user: 'Dr. Siddharth Roy', module: 'Patient Management' },
  { id: 'LOG-H02', timestamp: 'Jul 22, 2026 — 09:15 AM', action: 'Hospital Partner Login Success', user: 'rgci@awarebharat.org', module: 'Authentication' },
  { id: 'LOG-H03', timestamp: 'Jul 21, 2026 — 04:20 PM', action: 'Financial Aid Estimate Verified (₹1,50,000)', user: 'Hospital Admin', module: 'Financial Aid' },
  { id: 'LOG-H04', timestamp: 'Jul 21, 2026 — 02:10 PM', action: 'Referral Accepted (Prakash Chandra)', user: 'Dr. Meenakshi Sundaram', module: 'Referrals' },
  { id: 'LOG-H05', timestamp: 'Jul 20, 2026 — 11:45 AM', action: 'Doctor Assigned to Campaign (Lions Club Camp)', user: 'Dr. Sunita Agarwal', module: 'Campaigns' },
];

// ---- Analytics Chart Datasets ----
export const MONTHLY_PATIENTS_TREATED = [
  { month: 'Jan', count: 14 },
  { month: 'Feb', count: 18 },
  { month: 'Mar', count: 22 },
  { month: 'Apr', count: 19 },
  { month: 'May', count: 26 },
  { month: 'Jun', count: 32 },
  { month: 'Jul', count: 28 },
];

export const MONTHLY_REFERRAL_TREND = [
  { month: 'Jan', referrals: 10, accepted: 9 },
  { month: 'Feb', referrals: 15, accepted: 14 },
  { month: 'Mar', referrals: 20, accepted: 18 },
  { month: 'Apr', referrals: 18, accepted: 16 },
  { month: 'May', referrals: 24, accepted: 22 },
  { month: 'Jun', referrals: 30, accepted: 28 },
  { month: 'Jul', referrals: 25, accepted: 24 },
];

export const DEPARTMENT_DISTRIBUTION = [
  { department: 'Surgical Oncology', count: 42, percentage: 35 },
  { department: 'Radiation Oncology', count: 36, percentage: 30 },
  { department: 'Medical Oncology', count: 24, percentage: 20 },
  { department: 'Gynec Oncology', count: 12, percentage: 10 },
  { department: 'Others', count: 6, percentage: 5 },
];
