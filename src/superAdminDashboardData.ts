// ============================================================
// Super Admin Dashboard — Mock Data
// ============================================================

// ---- Types ----

export interface SuperAdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  region: string;
  status: 'Active' | 'Suspended' | 'Deactivated';
  permissions: string[];
  lastLogin: string;
  createdDate: string;
  phone: string;
  password?: string;
  passcode?: string;
}

export interface HospitalApplication {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  appliedDate: string;
  nabhAccredited: boolean;
  bedCount: number;
  specialties: string[];
  documents: { name: string; verified: boolean }[];
  recommendedBy: string | null;
  recommendationNotes: string | null;
  status: 'Pending Review' | 'Recommended by Admin' | 'Approved' | 'Rejected' | 'Info Requested';
  rejectionReason?: string;
  generatedCredentials?: { email: string; tempPassword: string };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
  module: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  assignedCount: number;
  createdDate: string;
  isSystem: boolean;
}

export interface ActiveSession {
  id: string;
  user: string;
  role: string;
  device: string;
  browser: string;
  ipAddress: string;
  lastActivity: string;
  location: string;
  status: 'Active' | 'Idle';
}

export interface FailedLoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  timestamp: string;
  reason: string;
  blocked: boolean;
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  size: string;
  duration: string;
  status: 'Completed' | 'Failed' | 'In Progress';
  type: 'Full' | 'Incremental';
  initiatedBy: string;
}

export interface SentNotification {
  id: string;
  title: string;
  message: string;
  audience: string;
  sentAt: string;
  sentBy: string;
  recipientCount: number;
}

export interface ReportCard {
  id: string;
  title: string;
  description: string;
  category: string;
  lastGenerated: string;
  icon: string;
}

// ---- All Available Permissions ----
export const ALL_PERMISSIONS = [
  'dashboard.view', 'patients.view', 'patients.edit', 'patients.delete', 'patients.financial_aid',
  'volunteers.view', 'volunteers.approve', 'volunteers.suspend',
  'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete',
  'hospitals.view', 'hospitals.recommend', 'hospitals.approve', 'hospitals.reject',
  'donations.view', 'donations.audit', 'donations.export',
  'blogs.view', 'blogs.create', 'blogs.edit', 'blogs.delete',
  'events.view', 'events.create', 'events.manage',
  'reports.view', 'reports.export',
  'analytics.view',
  'audit_logs.view',
  'notifications.send', 'notifications.broadcast',
  'settings.view', 'settings.edit',
  'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
  'admins.view', 'admins.create', 'admins.edit', 'admins.delete', 'admins.reset_password',
  'database.backup', 'database.restore',
  'security.view', 'security.manage',
];

// ---- KPI Metrics ----
export const SUPER_ADMIN_KPI = {
  totalPatients: 1420,
  totalVolunteers: 2400,
  totalUsers: 4250,
  partnerHospitals: 4,
  pendingTieups: 3,
  activeCampaigns: 6,
  totalDonations: 840500,
  financialAidCases: 12,
  awarenessPrograms: 18,
  adminAccounts: 3,
  systemHealthScore: 97.2,
  monthlyGrowthRate: 8.5,
};

// ---- Admin Accounts ----
export const INITIAL_ADMIN_ACCOUNTS: SuperAdminAccount[] = [
  {
    id: 'ADM-001', name: 'Dr. Ramesh Sharma', email: 'dwarka@awarebharat.org', role: 'Regional Admin',
    region: 'North India — Delhi NCR', status: 'Active',
    permissions: ['dashboard.view', 'patients.view', 'patients.edit', 'volunteers.view', 'volunteers.approve', 'campaigns.view', 'campaigns.create', 'hospitals.view', 'hospitals.recommend', 'donations.view', 'blogs.view', 'blogs.create', 'events.view', 'notifications.send'],
    lastLogin: 'Jul 22, 2026 — 09:15 AM', createdDate: 'Jan 15, 2026', phone: '+91 98765 43210',
    password: 'adminpassword', passcode: '12345',
  },
  {
    id: 'ADM-002', name: 'Meera Iyer', email: 'mumbai@awarebharat.org', role: 'Regional Admin',
    region: 'West India — Mumbai & Pune', status: 'Active',
    permissions: ['dashboard.view', 'patients.view', 'patients.edit', 'volunteers.view', 'volunteers.approve', 'campaigns.view', 'campaigns.create', 'hospitals.view', 'hospitals.recommend', 'donations.view'],
    lastLogin: 'Jul 21, 2026 — 03:42 PM', createdDate: 'Mar 05, 2026', phone: '+91 99112 87654',
    password: 'adminpassword', passcode: '12345',
  },
  {
    id: 'ADM-003', name: 'Anjali Deshmukh', email: 'south@awarebharat.org', role: 'Campaign Manager',
    region: 'South India — Chennai & Bengaluru', status: 'Suspended',
    permissions: ['dashboard.view', 'campaigns.view', 'campaigns.create', 'campaigns.edit', 'events.view', 'events.create'],
    lastLogin: 'Jul 10, 2026 — 11:20 AM', createdDate: 'Apr 18, 2026', phone: '+91 98301 45678',
    password: 'adminpassword', passcode: '12345',
  },
];

// ---- Hospital Applications ----
export const INITIAL_HOSPITAL_APPLICATIONS: HospitalApplication[] = [
  {
    id: 'HOSP-APP-001', name: 'Max Super Speciality Hospital', city: 'Saket, New Delhi', state: 'Delhi',
    address: 'Press Enclave Road, Saket, New Delhi — 110017',
    contactEmail: 'admin@maxhealthcare.com', contactPhone: '+91 11 2651 5050', website: 'www.maxhealthcare.in',
    appliedDate: 'Jul 10, 2026', nabhAccredited: true, bedCount: 500,
    specialties: ['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology', 'Bone Marrow Transplant'],
    documents: [
      { name: 'NABH Accreditation Certificate', verified: true },
      { name: 'Hospital Registration License', verified: true },
      { name: 'Fire Safety Certificate', verified: true },
      { name: 'Oncology Department Report', verified: false },
    ],
    recommendedBy: 'Dr. Ramesh Sharma (ADM-001)',
    recommendationNotes: 'All primary documents verified. Oncology department has 12 dedicated beds and 3 senior oncologists. Highly recommended for partnership. Pending verification of latest annual oncology report.',
    status: 'Recommended by Admin',
  },
  {
    id: 'HOSP-APP-002', name: 'Fortis Oncology Center', city: 'Gurugram', state: 'Haryana',
    address: 'Sector 44, Gurugram, Haryana — 122002',
    contactEmail: 'info@fortishospitals.com', contactPhone: '+91 124 496 2200', website: 'www.fortishealthcare.com',
    appliedDate: 'Jul 18, 2026', nabhAccredited: true, bedCount: 350,
    specialties: ['Medical Oncology', 'Radiation Therapy', 'Palliative Care'],
    documents: [
      { name: 'NABH Accreditation Certificate', verified: true },
      { name: 'Hospital Registration License', verified: false },
      { name: 'Oncology Equipment Inventory', verified: false },
    ],
    recommendedBy: null, recommendationNotes: null, status: 'Pending Review',
  },
  {
    id: 'HOSP-APP-003', name: 'Apollo Proton Cancer Centre', city: 'Chennai', state: 'Tamil Nadu',
    address: 'No. 4/661, Dr. Vikram Sarabhai Instronic Estate, Chennai — 600096',
    contactEmail: 'proton@apollohospitals.com', contactPhone: '+91 44 3333 4444', website: 'www.apolloproton.com',
    appliedDate: 'Jul 15, 2026', nabhAccredited: true, bedCount: 150,
    specialties: ['Proton Beam Therapy', 'Pediatric Oncology', 'Head & Neck Oncology', 'Breast Oncology'],
    documents: [
      { name: 'NABH Accreditation Certificate', verified: true },
      { name: 'Hospital Registration License', verified: true },
      { name: 'Proton Therapy Equipment Certificate', verified: true },
      { name: 'Cancer Registry Data Report', verified: true },
    ],
    recommendedBy: null, recommendationNotes: null, status: 'Pending Review',
  },
  {
    id: 'HOSP-APP-004', name: 'Rajiv Gandhi Cancer Institute', city: 'Rohini, New Delhi', state: 'Delhi',
    address: 'D Block, Sector 5, Rohini, New Delhi — 110085',
    contactEmail: 'admin@rgcirc.org', contactPhone: '+91 11 4702 2222', website: 'www.rgcirc.org',
    appliedDate: 'Jun 28, 2026', nabhAccredited: true, bedCount: 300,
    specialties: ['Medical Oncology', 'Surgical Oncology', 'Hemato-Oncology', 'Nuclear Medicine'],
    documents: [
      { name: 'NABH Accreditation Certificate', verified: true },
      { name: 'Hospital Registration License', verified: true },
      { name: 'Oncology Department Report', verified: true },
      { name: 'Annual Report 2025', verified: true },
    ],
    recommendedBy: 'Dr. Ramesh Sharma (ADM-001)',
    recommendationNotes: 'Premier cancer institute. Fully verified. Strong recommendation for immediate partnership activation.',
    status: 'Approved',
    generatedCredentials: { email: 'rgci@awarebharat.org', tempPassword: 'RGCI-CAB-2026-TEMP' },
  },
];

// ---- Audit Logs ----
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'LOG-001', timestamp: 'Jul 22, 2026 — 09:15 AM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'Login Success', target: 'System Authentication', ipAddress: '103.25.148.22', severity: 'Info', module: 'Auth' },
  { id: 'LOG-002', timestamp: 'Jul 22, 2026 — 09:10 AM', actor: 'dwarka@awarebharat.org', actorRole: 'Regional Admin', action: 'Login Success', target: 'Admin Portal', ipAddress: '49.36.201.15', severity: 'Info', module: 'Auth' },
  { id: 'LOG-003', timestamp: 'Jul 21, 2026 — 04:30 PM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'Hospital Application Approved', target: 'Rajiv Gandhi Cancer Institute (HOSP-APP-004)', ipAddress: '103.25.148.22', severity: 'Critical', module: 'Hospitals' },
  { id: 'LOG-004', timestamp: 'Jul 21, 2026 — 03:45 PM', actor: 'dwarka@awarebharat.org', actorRole: 'Regional Admin', action: 'Hospital Recommended to Super Admin', target: 'Max Super Speciality Hospital (HOSP-APP-001)', ipAddress: '49.36.201.15', severity: 'Warning', module: 'Hospitals' },
  { id: 'LOG-005', timestamp: 'Jul 21, 2026 — 02:20 PM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'Admin Account Suspended', target: 'Anjali Deshmukh (ADM-003)', ipAddress: '103.25.148.22', severity: 'Critical', module: 'Admin Mgmt' },
  { id: 'LOG-006', timestamp: 'Jul 20, 2026 — 11:00 AM', actor: 'dwarka@awarebharat.org', actorRole: 'Regional Admin', action: 'Volunteer Approved', target: 'Rahul Verma (VOL-001)', ipAddress: '49.36.201.15', severity: 'Info', module: 'Volunteers' },
  { id: 'LOG-007', timestamp: 'Jul 20, 2026 — 10:30 AM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'Database Backup Created', target: 'Full Backup — 2.4 GB', ipAddress: '103.25.148.22', severity: 'Info', module: 'Database' },
  { id: 'LOG-008', timestamp: 'Jul 19, 2026 — 09:00 PM', actor: 'unknown@attackdomain.net', actorRole: 'Unknown', action: 'Failed Login Attempt (3x)', target: 'Super Admin Portal', ipAddress: '185.143.223.71', severity: 'Critical', module: 'Security' },
  { id: 'LOG-009', timestamp: 'Jul 19, 2026 — 04:15 PM', actor: 'mumbai@awarebharat.org', actorRole: 'Regional Admin', action: 'Patient Record Updated', target: 'Priya Sharma (PAT-002) — Status changed to Recovered', ipAddress: '103.86.99.44', severity: 'Info', module: 'Patients' },
  { id: 'LOG-010', timestamp: 'Jul 19, 2026 — 02:00 PM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'Role Permissions Updated', target: 'Campaign Manager Role — Added events.create', ipAddress: '103.25.148.22', severity: 'Warning', module: 'Roles' },
  { id: 'LOG-011', timestamp: 'Jul 18, 2026 — 11:30 AM', actor: 'dwarka@awarebharat.org', actorRole: 'Regional Admin', action: 'Campaign Scheduled', target: 'Free Oral Cancer Screening Drive — Jul 26', ipAddress: '49.36.201.15', severity: 'Info', module: 'Campaigns' },
  { id: 'LOG-012', timestamp: 'Jul 18, 2026 — 09:45 AM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'System Settings Updated', target: 'Notification Email Configuration', ipAddress: '103.25.148.22', severity: 'Warning', module: 'Settings' },
  { id: 'LOG-013', timestamp: 'Jul 17, 2026 — 03:00 PM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'Admin Account Created', target: 'Anjali Deshmukh (ADM-003) — Campaign Manager', ipAddress: '103.25.148.22', severity: 'Critical', module: 'Admin Mgmt' },
  { id: 'LOG-014', timestamp: 'Jul 16, 2026 — 01:00 PM', actor: 'mumbai@awarebharat.org', actorRole: 'Regional Admin', action: 'Donation Receipt Sent', target: 'Ananya Mehta — ₹25,000 (DON-001)', ipAddress: '103.86.99.44', severity: 'Info', module: 'Donations' },
  { id: 'LOG-015', timestamp: 'Jul 15, 2026 — 10:00 AM', actor: 'board@awarebharat.org', actorRole: 'Super Admin', action: 'Password Policy Updated', target: 'Minimum length changed from 8 to 12 characters', ipAddress: '103.25.148.22', severity: 'Warning', module: 'Security' },
];

// ---- Custom Roles ----
export const INITIAL_CUSTOM_ROLES: CustomRole[] = [
  {
    id: 'ROLE-001', name: 'Regional Admin', description: 'Full regional management access — patients, volunteers, campaigns, hospital recommendations',
    permissions: ['dashboard.view', 'patients.view', 'patients.edit', 'volunteers.view', 'volunteers.approve', 'campaigns.view', 'campaigns.create', 'campaigns.edit', 'hospitals.view', 'hospitals.recommend', 'donations.view', 'blogs.view', 'blogs.create', 'events.view', 'notifications.send'],
    assignedCount: 2, createdDate: 'Jan 10, 2026', isSystem: true,
  },
  {
    id: 'ROLE-002', name: 'Campaign Manager', description: 'Campaign creation and event management with limited volunteer oversight',
    permissions: ['dashboard.view', 'campaigns.view', 'campaigns.create', 'campaigns.edit', 'events.view', 'events.create', 'events.manage'],
    assignedCount: 1, createdDate: 'Mar 20, 2026', isSystem: false,
  },
  {
    id: 'ROLE-003', name: 'Finance Manager', description: 'Full access to donations audit, financial aid processing, and report export',
    permissions: ['dashboard.view', 'donations.view', 'donations.audit', 'donations.export', 'patients.financial_aid', 'reports.view', 'reports.export'],
    assignedCount: 0, createdDate: 'Apr 05, 2026', isSystem: false,
  },
  {
    id: 'ROLE-004', name: 'Hospital Coordinator', description: 'Hospital partnership management and document verification',
    permissions: ['dashboard.view', 'hospitals.view', 'hospitals.recommend', 'patients.view'],
    assignedCount: 0, createdDate: 'May 12, 2026', isSystem: false,
  },
];

// ---- Active Sessions ----
export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  { id: 'SESS-001', user: 'board@awarebharat.org', role: 'Super Admin', device: 'Windows 11 — Desktop', browser: 'Chrome 127', ipAddress: '103.25.148.22', lastActivity: '2 minutes ago', location: 'New Delhi, India', status: 'Active' },
  { id: 'SESS-002', user: 'dwarka@awarebharat.org', role: 'Regional Admin', device: 'macOS 15 — Laptop', browser: 'Safari 20', ipAddress: '49.36.201.15', lastActivity: '15 minutes ago', location: 'Dwarka, New Delhi', status: 'Active' },
  { id: 'SESS-003', user: 'mumbai@awarebharat.org', role: 'Regional Admin', device: 'Android 15 — Mobile', browser: 'Chrome Mobile', ipAddress: '103.86.99.44', lastActivity: '1 hour ago', location: 'Mumbai, India', status: 'Idle' },
];

// ---- Failed Login Attempts ----
export const INITIAL_FAILED_LOGINS: FailedLoginAttempt[] = [
  { id: 'FAIL-001', email: 'unknown@attackdomain.net', ipAddress: '185.143.223.71', timestamp: 'Jul 19, 2026 — 09:00 PM', reason: 'Invalid credentials (3 attempts)', blocked: true },
  { id: 'FAIL-002', email: 'board@awarebharat.org', ipAddress: '103.25.148.22', timestamp: 'Jul 18, 2026 — 08:55 AM', reason: 'Invalid MFA token', blocked: false },
  { id: 'FAIL-003', email: 'test@example.com', ipAddress: '72.14.201.50', timestamp: 'Jul 17, 2026 — 11:30 PM', reason: 'Account does not exist', blocked: true },
  { id: 'FAIL-004', email: 'south@awarebharat.org', ipAddress: '59.93.12.88', timestamp: 'Jul 16, 2026 — 02:15 PM', reason: 'Account suspended', blocked: false },
];

// ---- Backup Records ----
export const INITIAL_BACKUP_RECORDS: BackupRecord[] = [
  { id: 'BKP-001', timestamp: 'Jul 20, 2026 — 10:30 AM', size: '2.4 GB', duration: '4 min 12 sec', status: 'Completed', type: 'Full', initiatedBy: 'board@awarebharat.org' },
  { id: 'BKP-002', timestamp: 'Jul 15, 2026 — 02:00 AM', size: '340 MB', duration: '58 sec', status: 'Completed', type: 'Incremental', initiatedBy: 'System (Auto)' },
  { id: 'BKP-003', timestamp: 'Jul 10, 2026 — 02:00 AM', size: '2.3 GB', duration: '4 min 05 sec', status: 'Completed', type: 'Full', initiatedBy: 'System (Auto)' },
  { id: 'BKP-004', timestamp: 'Jul 05, 2026 — 02:00 AM', size: '280 MB', duration: '45 sec', status: 'Completed', type: 'Incremental', initiatedBy: 'System (Auto)' },
  { id: 'BKP-005', timestamp: 'Jul 01, 2026 — 02:00 AM', size: '2.2 GB', duration: '3 min 50 sec', status: 'Failed', type: 'Full', initiatedBy: 'System (Auto)' },
];

// ---- Sent Notifications ----
export const INITIAL_SENT_NOTIFICATIONS: SentNotification[] = [
  { id: 'NOTIF-S1', title: 'System Maintenance Notice', message: 'Platform will undergo scheduled maintenance on Jul 25, 2026 from 2:00 AM to 5:00 AM IST.', audience: 'All Users', sentAt: 'Jul 20, 2026 — 04:00 PM', sentBy: 'board@awarebharat.org', recipientCount: 4250 },
  { id: 'NOTIF-S2', title: 'New Campaign Alert', message: 'Free Oral Cancer Screening Drive scheduled for Jul 26 in Dwarka. Volunteers needed!', audience: 'Volunteers', sentAt: 'Jul 19, 2026 — 10:00 AM', sentBy: 'board@awarebharat.org', recipientCount: 2400 },
  { id: 'NOTIF-S3', title: 'Hospital Partnership Update', message: 'Rajiv Gandhi Cancer Institute has been approved as a CAB Partner Hospital.', audience: 'Admins', sentAt: 'Jul 21, 2026 — 05:00 PM', sentBy: 'board@awarebharat.org', recipientCount: 3 },
];

// ---- Report Templates ----
export const REPORT_CARDS: ReportCard[] = [
  { id: 'RPT-001', title: 'Donation Summary Report', description: 'Complete breakdown of all donations received — by donor type, payment method, and campaign sponsorship.', category: 'Financial', lastGenerated: 'Jul 20, 2026', icon: '💰' },
  { id: 'RPT-002', title: 'Patient Assistance Report', description: 'Patient demographics, diagnosis distribution, financial aid disbursements, and treatment outcomes.', category: 'Healthcare', lastGenerated: 'Jul 18, 2026', icon: '🏥' },
  { id: 'RPT-003', title: 'Campaign Impact Report', description: 'Campaign reach metrics, volunteer participation rates, screening counts, and geographic coverage.', category: 'Operations', lastGenerated: 'Jul 15, 2026', icon: '📊' },
  { id: 'RPT-004', title: 'Hospital Partnership Report', description: 'Partner hospital performance, patient referrals, tie-up application status, and regional coverage gaps.', category: 'Partnerships', lastGenerated: 'Jul 12, 2026', icon: '🤝' },
  { id: 'RPT-005', title: 'Volunteer Performance Report', description: 'Volunteer activity hours, attendance rates, certification status, and regional distribution.', category: 'Human Resources', lastGenerated: 'Jul 10, 2026', icon: '👥' },
  { id: 'RPT-006', title: 'Annual NGO Performance Report', description: 'Comprehensive yearly report covering all operations, financials, impact metrics, and strategic goals.', category: 'Executive', lastGenerated: 'Jun 30, 2026', icon: '📋' },
];

// ---- Monthly Analytics Data ----
export const MONTHLY_DONATION_TREND = [
  { month: 'Jan', amount: 120000 },
  { month: 'Feb', amount: 95000 },
  { month: 'Mar', amount: 150000 },
  { month: 'Apr', amount: 180000 },
  { month: 'May', amount: 130000 },
  { month: 'Jun', amount: 210000 },
  { month: 'Jul', amount: 165000 },
];

export const MONTHLY_PATIENT_INTAKE = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 150 },
  { month: 'Mar', count: 210 },
  { month: 'Apr', count: 190 },
  { month: 'May', count: 240 },
  { month: 'Jun', count: 310 },
  { month: 'Jul', count: 200 },
];

export const MONTHLY_VOLUNTEER_HOURS = [
  { month: 'Jan', hours: 480 },
  { month: 'Feb', hours: 520 },
  { month: 'Mar', hours: 610 },
  { month: 'Apr', hours: 580 },
  { month: 'May', hours: 700 },
  { month: 'Jun', hours: 850 },
  { month: 'Jul', hours: 720 },
];

// ---- Database Health ----
export const DATABASE_HEALTH = {
  totalSize: '2.8 GB',
  tablesCount: 42,
  totalRecords: 128450,
  lastBackup: 'Jul 20, 2026 — 10:30 AM',
  uptime: '99.97%',
  avgQueryTime: '12ms',
  activeConnections: 8,
  maxConnections: 100,
};

// ---- System Settings ----
export const SYSTEM_SETTINGS = {
  ngoName: 'Cancer Aware Bharat Trust',
  tagline: 'Early Detection Saves Lives',
  registrationNo: 'NGO-DL-2024-0892',
  address: 'B-42, Sector 12, Dwarka, New Delhi — 110078',
  phone: '+91 11 4567 8901',
  email: 'info@awarebharat.org',
  website: 'www.cancerawarebharat.org',
  smtpHost: 'smtp.awarebharat.org',
  smtpPort: 587,
  smtpEmail: 'noreply@awarebharat.org',
  paymentGateway: 'Razorpay',
  apiKeyMasked: 'rzp_live_••••••••7k3M',
  secretKeyMasked: '••••••••••••••••Xp9q',
};
