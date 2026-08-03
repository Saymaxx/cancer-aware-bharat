// ============================================================
// Super Admin Dashboard — Mock Data
// ============================================================

// ---- Types ----

export interface SuperAdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  customRoleId: string | null;
  region: string;
  status: 'Active' | 'Suspended' | 'Deactivated';
  permissions: string[];
  lastLogin: string;
  createdDate: string;
  phone: string;
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
export const MONTHLY_PATIENT_INTAKE = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 150 },
  { month: 'Mar', count: 210 },
  { month: 'Apr', count: 190 },
  { month: 'May', count: 240 },
  { month: 'Jun', count: 310 },
  { month: 'Jul', count: 200 },
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
