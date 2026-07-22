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
  status: 'Upcoming' | 'In Progress' | 'Completed';
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

// ---- Assigned NGO Patients ----
export const INITIAL_ASSIGNED_PATIENTS: AssignedPatient[] = [
  {
    id: 'HOSP-PAT-001', ngoRefId: 'PAT-2026-8941', name: 'Sunita Devi', age: 48, gender: 'Female',
    diagnosis: 'Invasive Ductal Carcinoma (Breast Cancer)', cancerStage: 'Stage IIB',
    treatmentStatus: 'Under Treatment', assignedDoctor: 'Dr. Siddharth Roy (Surgical Oncology)',
    admissionDate: 'Jul 12, 2026', city: 'Rohini, New Delhi', phone: '+91 98112 34567',
    reportsCount: 4, prescriptionUploaded: true, remarks: 'Cycle 3 chemotherapy scheduled for Jul 26. Tolerating well.',
  },
  {
    id: 'HOSP-PAT-002', ngoRefId: 'PAT-2026-9120', name: 'Rajesh Kumar', age: 54, gender: 'Male',
    diagnosis: 'Squamous Cell Carcinoma (Oral Cavity)', cancerStage: 'Stage III',
    treatmentStatus: 'Under Treatment', assignedDoctor: 'Dr. Meenakshi Sundaram (Head & Neck)',
    admissionDate: 'Jul 15, 2026', city: 'Dwarka, New Delhi', phone: '+91 99543 21098',
    reportsCount: 3, prescriptionUploaded: true, remarks: 'Post-operative radiation planning in progress.',
  },
  {
    id: 'HOSP-PAT-003', ngoRefId: 'PAT-2026-7782', name: 'Ananya Mehta', age: 36, gender: 'Female',
    diagnosis: 'High-Grade Cervical Intraepithelial Neoplasia', cancerStage: 'Stage I',
    treatmentStatus: 'Completed', assignedDoctor: 'Dr. Sunita Agarwal (GynecOncology)',
    admissionDate: 'Jun 20, 2026', city: 'Saket, New Delhi', phone: '+91 98765 12345',
    reportsCount: 5, prescriptionUploaded: true, remarks: 'Cryotherapy treatment successful. Biopsy clear on follow-up.',
  },
  {
    id: 'HOSP-PAT-004', ngoRefId: 'PAT-2026-9430', name: 'Harpreet Singh', age: 62, gender: 'Male',
    diagnosis: 'Non-Small Cell Lung Carcinoma', cancerStage: 'Stage IIIA',
    treatmentStatus: 'Under Review', assignedDoctor: 'Dr. Vikram Malhotra (Radiation)',
    admissionDate: 'Jul 20, 2026', city: 'Gurugram, Haryana', phone: '+91 97188 54321',
    reportsCount: 2, prescriptionUploaded: false, remarks: 'PET-CT scan evaluation scheduled for Jul 24.',
  },
  {
    id: 'HOSP-PAT-005', ngoRefId: 'PAT-2026-9551', name: 'Kamla Bai', age: 50, gender: 'Female',
    diagnosis: 'Metastatic Ovarian Adenocarcinoma', cancerStage: 'Stage IV',
    treatmentStatus: 'Emergency', assignedDoctor: 'Dr. Siddharth Roy (Surgical Oncology)',
    admissionDate: 'Jul 21, 2026', city: 'Faridabad, Haryana', phone: '+91 98990 11223',
    reportsCount: 2, prescriptionUploaded: true, remarks: 'Admitted to ICU following severe dyspnea. Palliative paracentesis performed.',
  },
];

// ---- NGO Patient Referrals ----
export const INITIAL_NGO_REFERRALS: NgoReferral[] = [
  {
    id: 'REF-2026-081', patientName: 'Amitabh Sen', age: 58, gender: 'Male',
    referralDate: 'Jul 21, 2026', priority: 'Critical', cancerType: 'Esophageal Adenocarcinoma',
    recommendedDepartment: 'Gastrointestinal Oncology', referredByNgoAgent: 'Dr. Ramesh Sharma (Delhi Node)',
    status: 'Pending Action',
  },
  {
    id: 'REF-2026-082', patientName: 'Geeta Sharma', age: 42, gender: 'Female',
    referralDate: 'Jul 20, 2026', priority: 'Urgent', cancerType: 'Invasive Lobular Carcinoma',
    recommendedDepartment: 'Breast Services', referredByNgoAgent: 'Meera Iyer (Mumbai Node)',
    status: 'Pending Action',
  },
  {
    id: 'REF-2026-083', patientName: 'Prakash Chandra', age: 65, gender: 'Male',
    referralDate: 'Jul 18, 2026', priority: 'Normal', cancerType: 'Prostate Adenocarcinoma',
    recommendedDepartment: 'Uro Oncology', referredByNgoAgent: 'Dr. Ramesh Sharma (Delhi Node)',
    status: 'Accepted',
  },
];

// ---- Hospital Awareness Campaigns ----
export const INITIAL_HOSPITAL_CAMPAIGNS: HospitalCampaign[] = [
  {
    id: 'CAMP-H01', title: 'Lions Club Mega Early Screening Camp', date: 'Sun, 26 Jul 2026',
    time: '09:00 AM - 04:00 PM', venue: 'Lions Community Grounds, Sector 10, Dwarka',
    city: 'New Delhi', expectedScreenings: 350,
    assignedDoctors: ['Dr. Siddharth Roy', 'Dr. Sunita Agarwal'], volunteerCount: 15,
    status: 'Upcoming', category: 'Screening Camp',
  },
  {
    id: 'CAMP-H02', title: 'Mammography & Cervical Awareness Drive', date: 'Sat, 01 Aug 2026',
    time: '10:00 AM - 03:00 PM', venue: 'Rotary Club Hall, Saket',
    city: 'New Delhi', expectedScreenings: 200,
    assignedDoctors: ['Dr. Sunita Agarwal'], volunteerCount: 10,
    status: 'Upcoming', category: 'Mobile Mammography',
  },
  {
    id: 'CAMP-H03', title: 'Oral Cancer Detection & Tobacco Workshop', date: 'Sun, 12 Jul 2026',
    time: '09:00 AM - 02:00 PM', venue: 'Civil Lines Community Center',
    city: 'Old Delhi', expectedScreenings: 280,
    assignedDoctors: ['Dr. Meenakshi Sundaram'], volunteerCount: 12,
    status: 'Completed', category: 'Oral Screening',
  },
];

// ---- Medical Reports ----
export const INITIAL_MEDICAL_REPORTS: HospitalReport[] = [
  { id: 'RPT-H01', patientId: 'HOSP-PAT-001', patientName: 'Sunita Devi', reportType: 'Biopsy', uploadDate: 'Jul 14, 2026', uploadedByDoctor: 'Dr. Siddharth Roy', fileSize: '2.4 MB', fileName: 'Biopsy_Histopathology_SunitaDevi.pdf' },
  { id: 'RPT-H02', patientId: 'HOSP-PAT-001', patientName: 'Sunita Devi', reportType: 'CT/MRI Scan', uploadDate: 'Jul 16, 2026', uploadedByDoctor: 'Dr. Vikram Malhotra', fileSize: '14.8 MB', fileName: 'Contrast_CT_Chest_Sunita.pdf' },
  { id: 'RPT-H03', patientId: 'HOSP-PAT-002', patientName: 'Rajesh Kumar', reportType: 'Lab Test', uploadDate: 'Jul 17, 2026', uploadedByDoctor: 'Dr. Meenakshi Sundaram', fileSize: '850 KB', fileName: 'CBC_LFT_KFT_Rajesh.pdf' },
  { id: 'RPT-H04', patientId: 'HOSP-PAT-003', patientName: 'Ananya Mehta', reportType: 'Discharge Summary', uploadDate: 'Jun 22, 2026', uploadedByDoctor: 'Dr. Sunita Agarwal', fileSize: '1.2 MB', fileName: 'Discharge_Summary_Ananya.pdf' },
];

// ---- Hospital Doctor Directory ----
export const INITIAL_HOSPITAL_DOCTORS: HospitalDoctor[] = [
  { id: 'DOC-001', name: 'Dr. Siddharth Roy', specialty: 'Surgical Oncology', qualification: 'MS, MCh (Surgical Oncology) AIIMS', experienceYears: 18, phone: '+91 98111 22334', email: 'sroy@rgcirc.org', availability: 'Available', assignedPatientsCount: 12 },
  { id: 'DOC-002', name: 'Dr. Sunita Agarwal', specialty: 'Gynecological Oncology', qualification: 'MD, DNB, Fellow GynecOncology', experienceYears: 14, phone: '+91 98222 33445', email: 'sagarwal@rgcirc.org', availability: 'Available', assignedPatientsCount: 9 },
  { id: 'DOC-003', name: 'Dr. Vikram Malhotra', specialty: 'Radiation Oncology', qualification: 'MD (Radiation), DNB', experienceYears: 16, phone: '+91 98333 44556', email: 'vmalhotra@rgcirc.org', availability: 'In Surgery', assignedPatientsCount: 15 },
  { id: 'DOC-004', name: 'Dr. Meenakshi Sundaram', specialty: 'Head & Neck Surgical Oncology', qualification: 'MS, MCh, FACS', experienceYears: 20, phone: '+91 98444 55667', email: 'msundaram@rgcirc.org', availability: 'Available', assignedPatientsCount: 11 },
  { id: 'DOC-005', name: 'Dr. Aniruddh Gupta', specialty: 'Medical Oncology & Hematology', qualification: 'MD, DM (Medical Oncology)', experienceYears: 12, phone: '+91 98555 66778', email: 'agupta@rgcirc.org', availability: 'On Leave', assignedPatientsCount: 6 },
];

// ---- Financial Aid Verifications ----
export const INITIAL_FINANCIAL_VERIFICATIONS: FinancialAidVerification[] = [
  { id: 'FA-VER-001', patientName: 'Sunita Devi', ngoCaseId: 'PAT-2026-8941', requestDate: 'Jul 13, 2026', estimatedCost: 180000, verifiedAmount: 150000, status: 'Cost Verified', department: 'Surgical Oncology', notes: '6 cycles Paclitaxel + Carboplatin. Cost estimation verified as per NGO subsidized rate card.' },
  { id: 'FA-VER-002', patientName: 'Kamla Bai', ngoCaseId: 'PAT-2026-9551', requestDate: 'Jul 21, 2026', estimatedCost: 220000, verifiedAmount: 0, status: 'Pending Verification', department: 'ICU & Emergency', notes: 'Emergency ICU stabilization and palliative paracentesis cost estimate awaiting clinical audit approval.' },
  { id: 'FA-VER-003', patientName: 'Rajesh Kumar', ngoCaseId: 'PAT-2026-9120', requestDate: 'Jul 16, 2026', estimatedCost: 140000, verifiedAmount: 140000, status: 'Aid Disbursed', department: 'Radiation Oncology', notes: 'IMRT Radiation therapy 30 fractions. Full aid approved and credited by CAB Trust.' },
];

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
