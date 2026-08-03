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

export interface HospitalActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  module: string;
}

// ---- Medical Reports ----
// ---- Financial Aid Verifications ----
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

