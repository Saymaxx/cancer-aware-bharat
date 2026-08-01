import React, { useState, useMemo } from 'react';
import {
  Users, Building2, Calendar, Heart, Settings, LogOut, Bell, DollarSign,
  BookOpen, Terminal, CheckCircle2, User, Clipboard, Menu,
  Stethoscope, Crown, UserCog, Layers, PieChart, LayoutDashboard, Megaphone,
  Database, ShieldCheck, FileText,
} from 'lucide-react';
import { useApiEnquiries, useApiNotifications, useApiHospitals, useBlogs, usePartnerRequests } from '../api/hooks';
import { assignHospital, ApiError, approvePartnerRequest, broadcastNotification, createBlog, deleteBlog, getStaffSession, rejectPartnerRequest, type NotificationAudience } from '../api/client';
import EnquiryTimelineModal from './EnquiryTimelineModal';
import { PatientEnquiry, Hospital } from '../types';
import { useToast } from './common/Toast';
import DashboardSidebar from './common/DashboardSidebar';
import { useSidebarState } from '../hooks/useSidebarState';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { csvCell, downloadCsv } from '../utils/csvExport';

import {
  INITIAL_ADMIN_ACCOUNTS,
  INITIAL_AUDIT_LOGS, INITIAL_CUSTOM_ROLES,
  INITIAL_BACKUP_RECORDS, INITIAL_SENT_NOTIFICATIONS,
  type SuperAdminAccount, type HospitalApplication, type AuditLogEntry,
  type CustomRole, type SentNotification
} from '../superAdminDashboardData';

import {
  INITIAL_PATIENTS, INITIAL_ADMIN_VOLUNTEERS, INITIAL_ADMIN_DONATIONS,
  type Patient, type AdminVolunteer, type AdminDonation
} from '../adminDashboardData';

import OverviewTab from './superadmin-dashboard/OverviewTab';
import EnquiryAssignmentsTab from './superadmin-dashboard/EnquiryAssignmentsTab';
import AdminsTab from './superadmin-dashboard/AdminsTab';
import HospitalsTab from './superadmin-dashboard/HospitalsTab';
import PatientsTab from './superadmin-dashboard/PatientsTab';
import VolunteersTab from './superadmin-dashboard/VolunteersTab';
import CampaignsTab from './superadmin-dashboard/CampaignsTab';
import DonationsTab from './superadmin-dashboard/DonationsTab';
import SuperAdminBlogsTab from './superadmin-dashboard/SuperAdminBlogsTab';
import ReportsTab from './superadmin-dashboard/ReportsTab';
import AnalyticsTab from './superadmin-dashboard/AnalyticsTab';
import AuditTab from './superadmin-dashboard/AuditTab';
import NotificationsTab from './superadmin-dashboard/NotificationsTab';
import SettingsTab from './superadmin-dashboard/SettingsTab';
import RolesTab from './superadmin-dashboard/RolesTab';
import DatabaseTab from './superadmin-dashboard/DatabaseTab';
import SecurityTab from './superadmin-dashboard/SecurityTab';
import ProfileTab from './superadmin-dashboard/ProfileTab';
import {
  AdminAccountModal, AdminCredentialsModal, ApproveHospitalModal, RejectHospitalModal,
  HospitalApprovedModal, CustomRoleModal, AssignHospitalModal,
} from './superadmin-dashboard/Modals';

// ===========================
// Super Admin Dashboard
// ===========================

export default function SuperAdminDashboard({ onPageChange, onLogout }: { onPageChange?: (page: string) => void; onLogout: () => void }) {
  const toast = useToast();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, toggleSidebar } = useSidebarState();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Real-time Patient Enquiries & Notifications from the backend API
  const apiToken = useMemo(() => getStaffSession()?.accessToken || null, []);
  const { enquiries, refetch: refetchEnquiries } = useApiEnquiries(apiToken);
  const { notifications: superAdminNotifications } = useApiNotifications(apiToken);
  const pendingHospitalAssignmentCount = useMemo(() => {
    return enquiries.filter(e =>
      e.status === 'Approved by Admin' ||
      e.status === 'Pending Hospital Assignment' ||
      e.status === 'Declined by Hospital'
    ).length;
  }, [enquiries]);

  // Assignment Modal & Filter states
  const [assigningEnquiry, setAssigningEnquiry] = useState<PatientEnquiry | null>(null);
  const [selectedHospitalForAssign, setSelectedHospitalForAssign] = useState<string>('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [hospSearchTerm, setHospSearchTerm] = useState('');
  const [hospCityFilter, setHospCityFilter] = useState('All');
  const [hospStateFilter, setHospStateFilter] = useState('All');
  const [hospSpecialtyFilter, setHospSpecialtyFilter] = useState('All');
  const [hospTypeFilter, setHospTypeFilter] = useState('All');
  const [timelineEnquiry, setTimelineEnquiry] = useState<PatientEnquiry | null>(null);
  const [superAdminEnquiryFilter, setSuperAdminEnquiryFilter] = useState('All');

  useEscapeKey(() => {
    setShowAdminModal(false);
    setAssigningEnquiry(null);
    setTimelineEnquiry(null);
    setShowHospitalDetail(null);
    setShowRejectDialog(null);
    setShowApprovalResult(null);
    setShowApproveModal(null);
    setCreatedAdminCredentials(null);
  });

  const handleExportAssignmentsCSV = () => {
    if (superAdminFilteredEnquiries.length === 0) {
      toast.info('No Enquiries', 'There are no enquiries to export.');
      return;
    }
    const headers = ['Enquiry ID', 'Reference Number', 'Patient Name', 'Age', 'Gender', 'Phone', 'City', 'Reason', 'Priority', 'Assigned Facility', 'Status', 'Date'];
    const rows = superAdminFilteredEnquiries.map(e => [
      e.enquiryId,
      e.referenceNumber,
      csvCell(e.patientName),
      e.age,
      e.gender,
      e.phone,
      csvCell(e.city),
      csvCell(e.reason),
      e.priority,
      csvCell(e.assignedHospitalName || e.preferredHospitalName || 'Pending Assignment'),
      csvCell(e.status),
      e.date
    ]);
    downloadCsv(headers, rows, 'CAB_SuperAdmin_Hospital_Assignments');
    toast.success('Export Complete', 'Hospital assignments CSV downloaded successfully.');
  };

  // Registered Hospitals for assignment -- live directory from the backend
  const { hospitals: allRegisteredHospitals } = useApiHospitals();

  const filteredHospitalsForAssignment = useMemo(() => {
    return allRegisteredHospitals.filter(h => {
      if (!h) return false;
      const sTerm = (hospSearchTerm || '').toLowerCase();
      const matchSearch = (h.name || '').toLowerCase().includes(sTerm) || (h.city || '').toLowerCase().includes(sTerm);
      const matchCity = hospCityFilter === 'All' || h.city === hospCityFilter;
      const matchState = hospStateFilter === 'All' || h.state === hospStateFilter;
      const matchType = hospTypeFilter === 'All' || h.type === hospTypeFilter;
      const matchSpec = hospSpecialtyFilter === 'All' || (h.specialties || []).some(s => (s || '').toLowerCase().includes((hospSpecialtyFilter || '').toLowerCase()));
      return matchSearch && matchCity && matchState && matchType && matchSpec;
    });
  }, [allRegisteredHospitals, hospSearchTerm, hospCityFilter, hospStateFilter, hospTypeFilter, hospSpecialtyFilter]);



  // Data state
  const [admins, setAdmins] = useState<SuperAdminAccount[]>(() => {
    const stored = localStorage.getItem('aware_bharat_staff_accounts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = [...parsed];
        INITIAL_ADMIN_ACCOUNTS.forEach(init => {
          if (!merged.some(m => m.id === init.id)) {
            merged.push(init);
          }
        });
        return merged;
      } catch (e) { console.error('Failed to parse staff accounts', e); }
    }
    return INITIAL_ADMIN_ACCOUNTS;
  });

  const { partnerRequests, refetch: refetchPartnerRequests } = usePartnerRequests(apiToken);
  const { blogs, refetch: refetchBlogs } = useBlogs();
  // 'Info Requested' has no backend status of its own (no request-info
  // endpoint exists) -- kept as a local-only overlay, same as
  // AdminDashboard's documentVerified gate.
  const [locallyRequestedInfoIds, setLocallyRequestedInfoIds] = useState<Set<string>>(new Set());
  const hospitals: HospitalApplication[] = useMemo(() => partnerRequests.map(pr => {
    const status: HospitalApplication['status'] =
      pr.status === 'Approved' ? 'Approved' :
      pr.status === 'Rejected' ? 'Rejected' :
      pr.status === 'Recommended' ? 'Recommended by Admin' :
      locallyRequestedInfoIds.has(pr.id) ? 'Info Requested' :
      'Pending Review';
    return {
      id: pr.id,
      name: pr.hospitalName,
      city: pr.city,
      state: '',
      address: '',
      contactEmail: pr.email,
      contactPhone: pr.phone,
      website: '',
      appliedDate: new Date(pr.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      nabhAccredited: false,
      bedCount: 0,
      specialties: pr.specialties ? pr.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      documents: [],
      recommendedBy: (pr.status === 'Recommended' || pr.status === 'Approved') ? 'Regional Admin' : null,
      recommendationNotes: pr.status === 'Recommended' ? (pr.decisionNotes || null) : null,
      status,
      rejectionReason: pr.status === 'Rejected' ? (pr.decisionNotes || undefined) : undefined,
      // Shown once via the one-time showApprovalResult modal instead of
      // persisted on the row -- the real temp password is never stored
      // anywhere after that response.
      generatedCredentials: undefined,
    };
  }), [partnerRequests, locallyRequestedInfoIds]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const stored = localStorage.getItem('aware_bharat_audit_logs');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_AUDIT_LOGS;
  });
  const [roles, setRoles] = useState<CustomRole[]>(() => {
    const stored = localStorage.getItem('aware_bharat_custom_roles');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_CUSTOM_ROLES;
  });
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>(() => {
    const stored = localStorage.getItem('aware_bharat_superadmin_sent_notifications');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_SENT_NOTIFICATIONS;
  });
  const [backupRecords, setBackupRecords] = useState(() => {
    const stored = localStorage.getItem('aware_bharat_backup_records');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_BACKUP_RECORDS;
  });

  // Cross-Platform Unified Data States
  const [patients, setPatients] = useState<Patient[]>(() => {
    const stored = localStorage.getItem('aware_bharat_patients');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_PATIENTS;
  });
  const [volunteers, setVolunteers] = useState<AdminVolunteer[]>(() => {
    const stored = localStorage.getItem('aware_bharat_volunteers');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_ADMIN_VOLUNTEERS;
  });
  const [campaigns, setCampaigns] = useState<any[]>(() => {
    const stored = localStorage.getItem('aware_bharat_campaigns');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'camp-1', title: 'Free Oral Cancer Screening Drive', date: 'Sat, 26 Jul 2026', type: 'Screening Camp', loc: 'Lions Club, Dwarka', vols: '22 / 30 assigned', status: 'Active' },
      { id: 'camp-2', title: 'Community Blood Donation Camp', date: 'Sun, 27 Jul 2026', type: 'Blood Donation', loc: 'City Hospital, Mumbai', vols: '18 / 20 assigned', status: 'Active' },
      { id: 'camp-3', title: 'Women\'s Breast Health Awareness', date: 'Wed, 30 Jul 2026', type: 'Awareness Drive', loc: 'Sector 12 Center, Noida', vols: '7 / 15 assigned', status: 'Upcoming' },
    ];
  });
  const [donations, setDonations] = useState<AdminDonation[]>(() => {
    const stored = localStorage.getItem('aware_bharat_donations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_ADMIN_DONATIONS;
  });
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All');

  const superAdminFilteredEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      if (!e) return false;
      const isApprovedOrInPipeline =
        e.status === 'Approved by Admin' ||
        e.status === 'Pending Hospital Assignment' ||
        e.status === 'Assigned to Hospital' ||
        e.status === 'Declined by Hospital' ||
        e.status === 'Appointment Confirmed';

      if (!isApprovedOrInPipeline) return false;

      const sTerm = (searchTerm || '').toLowerCase();
      const matchSearch =
        (e.enquiryId || '').toLowerCase().includes(sTerm) ||
        (e.patientName || '').toLowerCase().includes(sTerm) ||
        (e.city || '').toLowerCase().includes(sTerm);

      const matchFilter =
        superAdminEnquiryFilter === 'All' ||
        (superAdminEnquiryFilter === 'Pending Assignment' && (e.status === 'Approved by Admin' || e.status === 'Pending Hospital Assignment' || e.status === 'Declined by Hospital')) ||
        e.status === superAdminEnquiryFilter;

      return matchSearch && matchFilter;
    });
  }, [enquiries, searchTerm, superAdminEnquiryFilter]);
  const [auditFilter, setAuditFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Modal states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SuperAdminAccount | null>(null);
  const [showHospitalDetail, setShowHospitalDetail] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [showApprovalResult, setShowApprovalResult] = useState<{ email: string; password: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [approveRegion, setApproveRegion] = useState('');
  const [approveStateValue, setApproveStateValue] = useState('');
  const [approveType, setApproveType] = useState('');
  const [approveAddress, setApproveAddress] = useState('');
  const [approveLat, setApproveLat] = useState('');
  const [approveLng, setApproveLng] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  // Admin form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('Regional Admin');
  const [formRegion, setFormRegion] = useState('');
  const [formPassword, setFormPassword] = useState('adminpassword');
  const [formPasscode, setFormPasscode] = useState('12345');
  const [createdAdminCredentials, setCreatedAdminCredentials] = useState<SuperAdminAccount | null>(null);

  // Custom Role Modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  // Blog Notice form state
  const [newBlogCategory, setNewBlogCategory] = useState<'Prevention' | 'Nutrition' | 'Survivors' | 'Research'>('Prevention');
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogSummary, setNewBlogSummary] = useState('');

  // Notification form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifAudience, setNotifAudience] = useState('All Users');

  // Profile state
  const [profileName, setProfileName] = useState(() => {
    const stored = localStorage.getItem('aware_bharat_superadmin_profile');
    if (stored) {
      try { return JSON.parse(stored).profileName; } catch (e) {}
    }
    return 'Board Administrator';
  });
  const [profileEmail] = useState('board@awarebharat.org');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // ---- Admin CRUD ----
  const openAdminForm = (admin: SuperAdminAccount | null = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormName(admin.name);
      setFormEmail(admin.email);
      setFormPhone(admin.phone || '');
      setFormRole(admin.role);
      setFormRegion(admin.region);
      setFormPassword(admin.password || 'adminpassword');
      setFormPasscode(admin.passcode || '12345');
    } else {
      setEditingAdmin(null);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormRole('Regional Admin');
      setFormRegion('');
      setFormPassword('adminpassword');
      setFormPasscode('12345');
    }
    setShowAdminModal(true);
  };

  const saveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formRegion || !formPassword || !formPasscode) return;
    const rolePerms = roles.find(r => r.name === formRole)?.permissions || ['dashboard.view'];

    let targetAccount: SuperAdminAccount | null = null;

    setAdmins(prev => {
      let updated: SuperAdminAccount[];
      if (editingAdmin) {
        targetAccount = {
          ...editingAdmin,
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          region: formRegion,
          password: formPassword,
          passcode: formPasscode,
        };
        updated = prev.map(a => a.id === editingAdmin.id ? targetAccount! : a);
        showToast(`Admin "${formName}" updated successfully.`);
      } else {
        const newAdmin: SuperAdminAccount = {
          id: 'ADM-' + String(prev.length + 1).padStart(3, '0'),
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          region: formRegion,
          status: 'Active',
          permissions: rolePerms,
          lastLogin: 'Never',
          createdDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
          password: formPassword,
          passcode: formPasscode,
        };
        targetAccount = newAdmin;
        updated = [...prev, newAdmin];
        showToast(`Admin "${formName}" created with credentials!`);
      }
      localStorage.setItem('aware_bharat_staff_accounts', JSON.stringify(updated));
      return updated;
    });

    setShowAdminModal(false);
    if (!editingAdmin && targetAccount) {
      setCreatedAdminCredentials(targetAccount);
    }
  };

  const toggleAdminStatus = (id: string) => {
    setAdmins(prev => {
      const updated = prev.map(a => {
        if (a.id !== id) return a;
        const newStatus = a.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`Admin "${a.name}" ${newStatus === 'Active' ? 'activated' : 'suspended'}.`);
        return { ...a, status: newStatus as 'Active' | 'Suspended' };
      });
      localStorage.setItem('aware_bharat_staff_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAdmin = (id: string) => {
    const admin = admins.find(a => a.id === id);
    if (admin && window.confirm(`Permanently delete admin "${admin.name}"? This action cannot be undone.`)) {
      setAdmins(prev => {
        const updated = prev.filter(a => a.id !== id);
        localStorage.setItem('aware_bharat_staff_accounts', JSON.stringify(updated));
        return updated;
      });
      showToast(`Admin "${admin.name}" has been deleted.`);
    }
  };

  const logAuditEntry = (action: string, target: string, severity: 'Info' | 'Warning' | 'Critical' = 'Info') => {
    const newEntry: AuditLogEntry = {
      id: 'LOG-' + Date.now(),
      timestamp: new Date().toLocaleString('en-IN'),
      actor: profileName,
      actorRole: 'Super Admin',
      action,
      target,
      ipAddress: '192.168.1.100',
      severity,
      module: 'SuperAdmin'
    };
    setAuditLogs(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('aware_bharat_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // ---- Hospital Approvals ----
  // Approving needs region/state/type/address/lat/lng -- fields the partner
  // request never collected -- so this opens a form instead of acting
  // immediately; handleApproveSubmit below does the real API call.
  const approveHospital = (id: string) => {
    setApproveRegion(''); setApproveStateValue(''); setApproveType(''); setApproveAddress('');
    setApproveLat(''); setApproveLng(''); setApproveNotes('');
    setShowApproveModal(id);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApproveModal || !apiToken) return;
    setApproveSubmitting(true);
    try {
      const result = await approvePartnerRequest(showApproveModal, apiToken, {
        region: approveRegion,
        state: approveStateValue,
        type: approveType,
        address: approveAddress,
        lat: parseFloat(approveLat),
        lng: parseFloat(approveLng),
        notes: approveNotes || undefined,
      });
      logAuditEntry('Hospital Application Approved', `Hospital: ${result.hospital.name}`, 'Info');
      setShowApprovalResult({ email: result.loginEmail, password: result.tempPassword });
      setShowApproveModal(null);
      showToast('Hospital application approved and credentials generated!');
      refetchPartnerRequests();
    } catch (err) {
      toast.error('Approval Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    } finally {
      setApproveSubmitting(false);
    }
  };

  const rejectHospital = async (id: string) => {
    if (!rejectReason.trim() || !apiToken) return;
    try {
      await rejectPartnerRequest(id, apiToken, rejectReason);
      logAuditEntry('Hospital Application Rejected', `Hospital ID: ${id} (${rejectReason})`, 'Warning');
      setShowRejectDialog(null);
      setRejectReason('');
      showToast('Hospital application rejected.');
      refetchPartnerRequests();
    } catch (err) {
      toast.error('Rejection Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const requestMoreInfo = (id: string) => {
    setLocallyRequestedInfoIds(prev => new Set(prev).add(id));
    logAuditEntry('Hospital Info Requested', `Hospital ID: ${id}`, 'Info');
    showToast('Additional information requested from hospital.');
  };

  // ---- Notifications ----
  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage || !apiToken) return;

    try {
      const result = await broadcastNotification(apiToken, notifAudience as NotificationAudience, notifTitle, notifMessage);

      const newNotif: SentNotification = {
        id: 'NOTIF-S' + (sentNotifications.length + 1),
        title: notifTitle, message: notifMessage, audience: notifAudience,
        sentAt: new Date().toLocaleString('en-IN'), sentBy: 'board@awarebharat.org',
        recipientCount: result.recipientCount,
      };
      setSentNotifications(prev => {
        const updated = [newNotif, ...prev];
        localStorage.setItem('aware_bharat_superadmin_sent_notifications', JSON.stringify(updated));
        return updated;
      });
      logAuditEntry(`Broadcast Notification Dispatched (${notifAudience})`, notifTitle, 'Info');
      setNotifTitle('');
      setNotifMessage('');
      showToast(`Notification broadcast to ${result.recipientCount} recipient(s) in ${notifAudience}!`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Blog Publishing ----
  const handlePublishBlogBySuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogSummary.trim() || !apiToken) return;

    try {
      const created = await createBlog(apiToken, {
        title: newBlogTitle,
        summary: newBlogSummary,
        content: newBlogSummary + '\n\nOfficial directive published by Super Admin Executive Board.',
        category: newBlogCategory,
        author: 'Executive Board',
        role: 'Super Admin',
        date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '3 min read',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        tags: [newBlogCategory, 'Official Directive', 'Executive'],
      });
      await refetchBlogs();
      logAuditEntry(`Blog Notice Published ("${newBlogTitle}")`, 'Portal News', 'Info');
      setNewBlogTitle('');
      setNewBlogSummary('');
      toast.success('Notice Published', `"${created.title}" is live on Portal News.`);
    } catch (err) {
      toast.error('Publish Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleDeleteBlogBySuperAdmin = async (id: string) => {
    if (!apiToken || !window.confirm('Are you sure you want to unpublish this article?')) return;
    try {
      await deleteBlog(id, apiToken);
      await refetchBlogs();
      logAuditEntry(`Blog Article Deleted (ID: ${id})`, 'Portal News', 'Warning');
      toast.info('Blog Article Removed');
    } catch (err) {
      toast.error('Delete Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Roles Management ----
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: CustomRole = {
      id: 'role-' + Date.now(),
      name: newRoleName,
      description: newRoleDescription || 'Custom Administrative Role',
      permissions: ['dashboard.view', 'reports.view'],
      assignedCount: 0,
      isSystem: false,
      createdDate: new Date().toLocaleDateString('en-IN')
    };

    setRoles(prev => {
      const updated = [...prev, newRole];
      localStorage.setItem('aware_bharat_custom_roles', JSON.stringify(updated));
      return updated;
    });
    logAuditEntry(`Custom Role Created (${newRoleName})`, 'RBAC System', 'Info');
    setNewRoleName('');
    setNewRoleDescription('');
    setShowRoleModal(false);
    toast.success('Role Created', `Custom role "${newRoleName}" saved.`);
  };

  // ---- Backup Trigger ----
  const handleCreateBackupNow = () => {
    const newRecord = {
      id: 'BK-' + Date.now(),
      timestamp: new Date().toLocaleString('en-IN'),
      type: 'Full' as const,
      size: '48.6 MB',
      duration: '3m 12s',
      status: 'Completed' as const,
      initiatedBy: profileName
    };
    setBackupRecords(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('aware_bharat_backup_records', JSON.stringify(updated));
      return updated;
    });
    logAuditEntry('Database Full Backup Initiated', 'PostgreSQL Primary Cluster', 'Info');
    toast.success('Backup Completed', 'Full database snapshot saved successfully.');
  };

  // ---- CSV Exports ----
  const handleExportPatientsCSV = () => {
    if (patients.length === 0) {
      toast.info('No Patients', 'There are no patient records to export.');
      return;
    }
    const headers = ['Patient Code', 'Full Name', 'Age', 'Gender', 'Primary Diagnosis', 'Clinic Partner', 'Financial Aid Status', 'Aid Amount'];
    const rows = patients.map(p => [
      p.id,
      csvCell(p.name),
      p.age,
      p.gender,
      csvCell(p.diagnosis),
      csvCell(p.hospitalName),
      p.financialAidStatus,
      p.financialAidAmount || 0
    ]);
    downloadCsv(headers, rows, 'CAB_SuperAdmin_Patients');
    toast.success('Export Complete', 'Patients CSV downloaded successfully.');
  };

  const handleExportVolunteersCSV = () => {
    if (volunteers.length === 0) {
      toast.info('No Volunteers', 'There are no volunteer records to export.');
      return;
    }
    const headers = ['Volunteer ID', 'Full Name', 'Email', 'Phone', 'Domain', 'Registered Date', 'Hours Logged', 'Attendance Rate', 'Status'];
    const rows = volunteers.map(v => [
      v.id,
      csvCell(v.name),
      v.email,
      v.phone,
      csvCell(v.domain),
      v.registeredDate,
      v.hoursLogged,
      v.attendanceRate + '%',
      v.status
    ]);
    downloadCsv(headers, rows, 'CAB_SuperAdmin_Volunteers');
    toast.success('Export Complete', 'Volunteers CSV downloaded successfully.');
  };

  const handleExportCampaignsCSV = () => {
    if (campaigns.length === 0) {
      toast.info('No Campaigns', 'There are no active campaigns to export.');
      return;
    }
    const headers = ['Campaign ID', 'Title', 'Date', 'Type', 'Location', 'Assigned Volunteers', 'Status'];
    const rows = campaigns.map(c => [
      c.id,
      csvCell(c.title),
      c.date,
      c.type,
      csvCell(c.loc),
      csvCell(c.vols),
      c.status || 'Active'
    ]);
    downloadCsv(headers, rows, 'CAB_SuperAdmin_Campaigns');
    toast.success('Export Complete', 'Campaigns CSV downloaded successfully.');
  };

  const handleExportDonationsCSV = () => {
    if (donations.length === 0) {
      toast.info('No Ledger Entries', 'There are no donation records to export.');
      return;
    }
    const headers = ['Receipt ID', 'Donor Entity', 'Entity Type', 'Inflow Amount (INR)', 'Audit Date', 'Inflow Channel', 'Tax Exemption Status'];
    const rows = donations.map(d => [
      d.id,
      csvCell(d.donorName),
      d.donorType,
      d.amount,
      d.date,
      d.paymentMethod,
      d.receiptSent ? 'Sent (80G)' : 'Pending'
    ]);
    downloadCsv(headers, rows, 'CAB_SuperAdmin_Donations_Ledger');
    toast.success('Export Complete', 'Donations ledger CSV downloaded successfully.');
  };

  const handleExportAuditLogsCSV = () => {
    if (auditLogs.length === 0) {
      toast.info('No Audit Logs', 'There are no audit log entries to export.');
      return;
    }
    const headers = ['Log ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Target', 'IP Address', 'Severity'];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      csvCell(l.actor),
      l.actorRole,
      csvCell(l.action),
      csvCell(l.target),
      l.ipAddress,
      l.severity
    ]);
    downloadCsv(headers, rows, 'CAB_SuperAdmin_Audit_Logs');
    toast.success('Export Complete', 'Audit logs CSV downloaded successfully.');
  };

  // ---- Filters ----
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      // 2-TIER WORKFLOW ENFORCEMENT:
      // Applications only reach Super Admin after Regional Admin recommendation or Super Admin action.
      // Raw applications with status 'Pending Review' or 'Pending Tie-up' remain strictly in Regional Admin queue.
      const isRecommendedOrProcessed = h.status === 'Recommended by Admin' || (h.status as string) === 'Recommended to Super Admin' || h.status === 'Approved' || h.status === 'Rejected' || h.status === 'Info Requested';
      if (!isRecommendedOrProcessed && hospitalFilter !== 'Pending Review') return false;

      const matchSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = hospitalFilter === 'All' ? isRecommendedOrProcessed : h.status === hospitalFilter;
      return matchSearch && matchFilter;
    });
  }, [hospitals, searchTerm, hospitalFilter]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(l => {
      const matchSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.actor.toLowerCase().includes(searchTerm.toLowerCase()) || l.target.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = auditFilter === 'All' || l.severity === auditFilter || l.module === auditFilter;
      return matchSearch && matchFilter;
    });
  }, [auditLogs, searchTerm, auditFilter]);

  // ---- Sidebar Items ----
  const sidebarItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'enquiry-assignments', label: 'Pending Hospital Assignment', icon: Stethoscope, badge: pendingHospitalAssignmentCount },
    { id: 'admins', label: 'Admin Management', icon: UserCog },
    { id: 'hospitals', label: 'Hospital Approvals', icon: Building2 },
    { id: 'patients', label: 'Patients', icon: Heart },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: Calendar },
    { id: 'donations', label: 'Donations Audit', icon: DollarSign },
    { id: 'blogs', label: 'Blog & Content', icon: BookOpen },
    { id: 'events', label: 'Events', icon: Megaphone },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'analytics', label: 'Global Analytics', icon: PieChart },
    { id: 'audit', label: 'Audit Logs', icon: Clipboard },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'roles', label: 'Roles & Permissions', icon: Layers },
    { id: 'database', label: 'Database Backup', icon: Database },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const unreadSuperAdminNotifCount = useMemo(() => superAdminNotifications.filter(n => !n.read).length, [superAdminNotifications]);

  // Severity badge
  const severityBadge = (s: string) => {
    switch (s) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'Warning': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const hospitalStatusBadge = (s: string) => {
    switch (s) {
      case 'Approved': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'Recommended by Admin': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-200';
      case 'Info Requested': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">

      <DashboardSidebar
        items={sidebarItems}
        activeTab={activeTab}
        onSelect={(id) => {
          setActiveTab(id);
          setSearchTerm('');
          setMobileSidebarOpen(false);
        }}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        bgClass="bg-[#1a1042]"
        brandIcon={Crown}
        brandIconWrapperClass="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
        brandLabel="Super Admin Console"
        brandLabelClass="text-base"
        activeAccentBorderClass="border-purple-400"
        navItemPaddingClass="p-2.5 text-[13px]"
        navIconSizeClass="w-4.5 h-4.5"
        navIconMarginClass="mr-3"
        // No badgeClass: this dashboard has never rendered nav badge pills,
        // even though one sidebarItems entry does carry a badge count --
        // preserved as-is rather than silently changing behavior.
      />

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8f7ff]">

        {/* Header */}
        <header className="bg-white border-b border-purple-100/50 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              title="Toggle Menu"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 lg:hidden" />
              <Terminal className="w-5 h-5 hidden lg:block" />
            </button>
            <h2 className="font-headline-lg text-base sm:text-lg font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> SUPER-ADMIN-NODE
            </span>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'notifications' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadSuperAdminNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadSuperAdminNotifCount}
                </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">SA</div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
              title="Secure Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-[fadeInUp_0.3s_ease-out]">
            <CheckCircle2 className="w-4 h-4 text-slate-400" /> {toastMessage}
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

          {/* ===== TAB: EXECUTIVE DASHBOARD ===== */}
          {activeTab === 'dashboard' && (
            <OverviewTab
              hospitals={hospitals}
              admins={admins}
              setActiveTab={setActiveTab}
            />
          )}

          {/* ===== TAB: PENDING HOSPITAL ASSIGNMENT (STEPS 3 & 4) ===== */}
          {activeTab === 'enquiry-assignments' && (
            <EnquiryAssignmentsTab
              pendingHospitalAssignmentCount={pendingHospitalAssignmentCount}
              enquiries={enquiries}
              superAdminEnquiryFilter={superAdminEnquiryFilter}
              setSuperAdminEnquiryFilter={setSuperAdminEnquiryFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleExportAssignmentsCSV={handleExportAssignmentsCSV}
              superAdminFilteredEnquiries={superAdminFilteredEnquiries}
              allRegisteredHospitals={allRegisteredHospitals}
              setAssigningEnquiry={setAssigningEnquiry}
              setSelectedHospitalForAssign={setSelectedHospitalForAssign}
              setAssignRemarks={setAssignRemarks}
              setTimelineEnquiry={setTimelineEnquiry}
            />
          )}

          {/* ===== TAB: ADMIN MANAGEMENT ===== */}
          {activeTab === 'admins' && (
            <AdminsTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              admins={admins}
              openAdminForm={openAdminForm}
              setCreatedAdminCredentials={setCreatedAdminCredentials}
              toggleAdminStatus={toggleAdminStatus}
              deleteAdmin={deleteAdmin}
            />
          )}

          {/* ===== TAB: HOSPITAL APPROVALS ===== */}
          {activeTab === 'hospitals' && (
            <HospitalsTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              hospitalFilter={hospitalFilter}
              setHospitalFilter={setHospitalFilter}
              filteredHospitals={filteredHospitals}
              hospitalStatusBadge={hospitalStatusBadge}
              approveHospital={approveHospital}
              setShowRejectDialog={setShowRejectDialog}
              requestMoreInfo={requestMoreInfo}
            />
          )}

          {/* ===== TAB: PATIENTS ===== */}
          {activeTab === 'patients' && (
            <PatientsTab
              patients={patients}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleExportPatientsCSV={handleExportPatientsCSV}
            />
          )}

          {/* ===== TAB: VOLUNTEERS ===== */}
          {activeTab === 'volunteers' && (
            <VolunteersTab
              volunteers={volunteers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleExportVolunteersCSV={handleExportVolunteersCSV}
            />
          )}

          {/* ===== TAB: CAMPAIGNS ===== */}
          {activeTab === 'campaigns' && (
            <CampaignsTab
              campaigns={campaigns}
              handleExportCampaignsCSV={handleExportCampaignsCSV}
            />
          )}

          {/* ===== TAB: DONATIONS AUDIT ===== */}
          {activeTab === 'donations' && (
            <DonationsTab
              donations={donations}
              handleExportDonationsCSV={handleExportDonationsCSV}
            />
          )}

          {/* ===== TAB: BLOGS ===== */}
          {activeTab === 'blogs' && (
            <SuperAdminBlogsTab
              newBlogCategory={newBlogCategory}
              setNewBlogCategory={setNewBlogCategory}
              newBlogTitle={newBlogTitle}
              setNewBlogTitle={setNewBlogTitle}
              newBlogSummary={newBlogSummary}
              setNewBlogSummary={setNewBlogSummary}
              handlePublishBlogBySuperAdmin={handlePublishBlogBySuperAdmin}
              blogs={blogs}
              handleDeleteBlogBySuperAdmin={handleDeleteBlogBySuperAdmin}
            />
          )}

          {/* ===== TAB: EVENTS ===== */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs text-center text-slate-500 animate-[fadeInUp_0.4s_ease-out]">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">Events are scheduled and managed by Campaign Managers.</p>
              <p className="text-xs mt-1">Upcoming events and their impact metrics are available in Reports.</p>
            </div>
          )}

          {/* ===== TAB: REPORTS & EXPORT ===== */}
          {activeTab === 'reports' && (
            <ReportsTab showToast={showToast} />
          )}

          {/* ===== TAB: GLOBAL ANALYTICS ===== */}
          {activeTab === 'analytics' && (
            <AnalyticsTab />
          )}

          {/* ===== TAB: AUDIT LOGS ===== */}
          {activeTab === 'audit' && (
            <AuditTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              auditFilter={auditFilter}
              setAuditFilter={setAuditFilter}
              handleExportAuditLogsCSV={handleExportAuditLogsCSV}
              filteredLogs={filteredLogs}
              severityBadge={severityBadge}
            />
          )}

          {/* ===== TAB: NOTIFICATION CENTER ===== */}
          {activeTab === 'notifications' && (
            <NotificationsTab
              sendNotification={sendNotification}
              notifTitle={notifTitle}
              setNotifTitle={setNotifTitle}
              notifMessage={notifMessage}
              setNotifMessage={setNotifMessage}
              notifAudience={notifAudience}
              setNotifAudience={setNotifAudience}
              superAdminNotifications={superAdminNotifications}
            />
          )}

          {/* ===== TAB: SYSTEM SETTINGS ===== */}
          {activeTab === 'settings' && (
            <SettingsTab />
          )}

          {/* ===== TAB: ROLES & PERMISSIONS ===== */}
          {activeTab === 'roles' && (
            <RolesTab
              roles={roles}
              setShowRoleModal={setShowRoleModal}
            />
          )}

          {/* ===== TAB: DATABASE BACKUP ===== */}
          {activeTab === 'database' && (
            <DatabaseTab
              backupRecords={backupRecords}
              handleCreateBackupNow={handleCreateBackupNow}
              showToast={showToast}
            />
          )}

          {/* ===== TAB: SECURITY CENTER ===== */}
          {activeTab === 'security' && (
            <SecurityTab />
          )}

          {/* ===== TAB: PROFILE ===== */}
          {activeTab === 'profile' && (
            <ProfileTab
              profileName={profileName}
              setProfileName={setProfileName}
              profileEmail={profileEmail}
              showToast={showToast}
              onLogout={onLogout}
            />
          )}

        </div>
      </main>

      {/* Admin Create/Edit Modal */}
      {showAdminModal && (
        <AdminAccountModal
          editingAdmin={editingAdmin}
          onClose={() => setShowAdminModal(false)}
          formName={formName}
          setFormName={setFormName}
          formEmail={formEmail}
          setFormEmail={setFormEmail}
          formPhone={formPhone}
          setFormPhone={setFormPhone}
          formRole={formRole}
          setFormRole={setFormRole}
          roles={roles}
          formRegion={formRegion}
          setFormRegion={setFormRegion}
          formPassword={formPassword}
          setFormPassword={setFormPassword}
          formPasscode={formPasscode}
          setFormPasscode={setFormPasscode}
          onSubmit={saveAdmin}
        />
      )}

      {/* Created Admin Credentials Summary Modal */}
      {createdAdminCredentials && (
        <AdminCredentialsModal
          credentials={createdAdminCredentials}
          onClose={() => setCreatedAdminCredentials(null)}
          showToast={showToast}
        />
      )}

      {/* Approve Hospital Form */}
      {showApproveModal && (
        <ApproveHospitalModal
          hospitalName={hospitals.find(h => h.id === showApproveModal)?.name || ''}
          onClose={() => setShowApproveModal(null)}
          region={approveRegion}
          setRegion={setApproveRegion}
          stateValue={approveStateValue}
          setStateValue={setApproveStateValue}
          hospitalType={approveType}
          setHospitalType={setApproveType}
          address={approveAddress}
          setAddress={setApproveAddress}
          lat={approveLat}
          setLat={setApproveLat}
          lng={approveLng}
          setLng={setApproveLng}
          notes={approveNotes}
          setNotes={setApproveNotes}
          onSubmit={handleApproveSubmit}
          submitting={approveSubmitting}
        />
      )}

      {/* Reject Hospital Dialog */}
      {showRejectDialog && (
        <RejectHospitalModal
          onClose={() => setShowRejectDialog(null)}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onConfirm={() => rejectHospital(showRejectDialog)}
        />
      )}

      {/* Hospital Approval Credentials Modal */}
      {showApprovalResult && (
        <HospitalApprovedModal
          result={showApprovalResult}
          onClose={() => setShowApprovalResult(null)}
        />
      )}

      {/* Add Custom Role Modal */}
      {showRoleModal && (
        <CustomRoleModal
          onClose={() => setShowRoleModal(false)}
          newRoleName={newRoleName}
          setNewRoleName={setNewRoleName}
          newRoleDescription={newRoleDescription}
          setNewRoleDescription={setNewRoleDescription}
          onSubmit={handleAddRole}
        />
      )}

      {/* Super Admin Hospital Assignment Modal (Step 4) */}
      {assigningEnquiry && (
        <AssignHospitalModal
          enquiry={assigningEnquiry}
          onClose={() => setAssigningEnquiry(null)}
          hospSearchTerm={hospSearchTerm}
          setHospSearchTerm={setHospSearchTerm}
          hospCityFilter={hospCityFilter}
          setHospCityFilter={setHospCityFilter}
          hospSpecialtyFilter={hospSpecialtyFilter}
          setHospSpecialtyFilter={setHospSpecialtyFilter}
          hospTypeFilter={hospTypeFilter}
          setHospTypeFilter={setHospTypeFilter}
          allRegisteredHospitals={allRegisteredHospitals}
          filteredHospitalsForAssignment={filteredHospitalsForAssignment}
          selectedHospitalForAssign={selectedHospitalForAssign}
          setSelectedHospitalForAssign={setSelectedHospitalForAssign}
          assignRemarks={assignRemarks}
          setAssignRemarks={setAssignRemarks}
          onAssign={async () => {
            if (!selectedHospitalForAssign || !apiToken) return;
            const targetHosp = allRegisteredHospitals.find(h => h.id === selectedHospitalForAssign);
            const targetName = targetHosp?.name || 'Partner Hospital';
            try {
              await assignHospital(assigningEnquiry.id, apiToken, selectedHospitalForAssign, assignRemarks || undefined);
              toast.success('Hospital Assigned', `Patient ${assigningEnquiry.patientName} assigned to ${targetName}.`);
              setAssigningEnquiry(null);
              setAssignRemarks('');
              setSelectedHospitalForAssign('');
              refetchEnquiries();
            } catch (err) {
              toast.error('Assignment Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
            }
          }}
        />
      )}

      {/* Timeline Modal */}
      <EnquiryTimelineModal
        enquiry={timelineEnquiry}
        isOpen={!!timelineEnquiry}
        onClose={() => setTimelineEnquiry(null)}
        apiToken={apiToken}
      />

    </div>
  );
}
