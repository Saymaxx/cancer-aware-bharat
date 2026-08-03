// ============================================================
// Super Admin Dashboard — Types & Static UI Content
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

export interface ReportCard {
  id: string;
  title: string;
  description: string;
  category: string;
  lastGenerated: string;
  icon: string;
}

// ---- Report Templates ----
export const REPORT_CARDS: ReportCard[] = [
  { id: 'RPT-001', title: 'Donation Summary Report', description: 'Complete breakdown of all donations received — by donor type, payment method, and campaign sponsorship.', category: 'Financial', lastGenerated: 'Jul 20, 2026', icon: '💰' },
  { id: 'RPT-002', title: 'Patient Assistance Report', description: 'Patient demographics, diagnosis distribution, financial aid disbursements, and treatment outcomes.', category: 'Healthcare', lastGenerated: 'Jul 18, 2026', icon: '🏥' },
  { id: 'RPT-003', title: 'Campaign Impact Report', description: 'Campaign reach metrics, volunteer participation rates, screening counts, and geographic coverage.', category: 'Operations', lastGenerated: 'Jul 15, 2026', icon: '📊' },
  { id: 'RPT-004', title: 'Hospital Partnership Report', description: 'Partner hospital performance, patient referrals, tie-up application status, and regional coverage gaps.', category: 'Partnerships', lastGenerated: 'Jul 12, 2026', icon: '🤝' },
  { id: 'RPT-005', title: 'Volunteer Performance Report', description: 'Volunteer activity hours, attendance rates, certification status, and regional distribution.', category: 'Human Resources', lastGenerated: 'Jul 10, 2026', icon: '👥' },
  { id: 'RPT-006', title: 'Annual NGO Performance Report', description: 'Comprehensive yearly report covering all operations, financials, impact metrics, and strategic goals.', category: 'Executive', lastGenerated: 'Jun 30, 2026', icon: '📋' },
];

