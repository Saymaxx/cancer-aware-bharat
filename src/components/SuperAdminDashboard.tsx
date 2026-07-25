import React, { useState, useMemo } from 'react';
import {
  BarChart3, Users, UserCheck, Building2, Calendar, Heart, Shield, ShieldAlert,
  Settings, LogOut, Bell, Search, Filter, Plus, Edit2, Trash2, Check, X,
  TrendingUp, DollarSign, BookOpen, MessageSquare, AlertCircle, AlertTriangle,
  Award, Terminal, CheckCircle2, User, Key, Eye, EyeOff, Download, FileText,
  Database, Server, Lock, RefreshCw, Activity, Zap, Globe, Mail, ChevronDown,
  ChevronRight, Copy, ToggleLeft, ToggleRight, FileCheck, Clipboard, Send,
  Clock, MapPin, Smartphone, Monitor, Wifi, WifiOff, HardDrive, ShieldCheck,
  Crown, Fingerprint, KeyRound, UserPlus, UserMinus, UserCog, Layers,
  PieChart, LayoutDashboard, Megaphone, FolderArchive, Menu, Stethoscope
} from 'lucide-react';
import { enquiryStore, useEnquiries, useNotifications } from '../enquiryStore';
import EnquiryTimelineModal from './EnquiryTimelineModal';
import { INITIAL_HOSPITALS, INITIAL_BLOGS } from '../data';
import { PatientEnquiry, Hospital, BlogArticle } from '../types';
import { useToast } from './common/Toast';
import StatusBadge from './common/StatusBadge';

import {
  SUPER_ADMIN_KPI, INITIAL_ADMIN_ACCOUNTS, INITIAL_HOSPITAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS, INITIAL_CUSTOM_ROLES, INITIAL_ACTIVE_SESSIONS,
  INITIAL_FAILED_LOGINS, INITIAL_BACKUP_RECORDS, INITIAL_SENT_NOTIFICATIONS,
  REPORT_CARDS, MONTHLY_DONATION_TREND, MONTHLY_PATIENT_INTAKE,
  MONTHLY_VOLUNTEER_HOURS, DATABASE_HEALTH, SYSTEM_SETTINGS, ALL_PERMISSIONS,
  type SuperAdminAccount, type HospitalApplication, type AuditLogEntry,
  type CustomRole, type SentNotification
} from '../superAdminDashboardData';

import {
  INITIAL_PATIENTS, INITIAL_ADMIN_VOLUNTEERS, INITIAL_ADMIN_DONATIONS,
  type Patient, type AdminVolunteer, type AdminDonation
} from '../adminDashboardData';

// ===========================
// Super Admin Dashboard
// ===========================

export default function SuperAdminDashboard({ onPageChange, onLogout }: { onPageChange?: (page: string) => void; onLogout: () => void }) {
  const toast = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Real-time Patient Enquiries from Enquiry Store
  const enquiries = useEnquiries();
  const superAdminNotifications = useNotifications('superadmin');
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

  // Close open modals on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAdminModal(false);
        setAssigningEnquiry(null);
        setTimelineEnquiry(null);
        setShowHospitalDetail(null);
        setShowRejectDialog(null);
        setShowApprovalResult(null);
        setCreatedAdminCredentials(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportAssignmentsCSV = () => {
    if (superAdminFilteredEnquiries.length === 0) {
      toast.info('No Enquiries', 'There are no enquiries to export.');
      return;
    }
    const headers = ['Enquiry ID', 'Reference Number', 'Patient Name', 'Age', 'Gender', 'Phone', 'City', 'Reason', 'Priority', 'Assigned Facility', 'Status', 'Date'];
    const rows = superAdminFilteredEnquiries.map(e => [
      e.enquiryId,
      e.referenceNumber,
      `"${(e.patientName || '').replace(/"/g, '""')}"`,
      e.age,
      e.gender,
      e.phone,
      `"${(e.city || '').replace(/"/g, '""')}"`,
      `"${(e.reason || '').replace(/"/g, '""')}"`,
      e.priority,
      `"${(e.assignedHospitalName || e.preferredHospitalName || 'Pending Assignment').replace(/"/g, '""')}"`,
      `"${(e.status || '').replace(/"/g, '""')}"`,
      e.date
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAB_SuperAdmin_Hospital_Assignments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export Complete', 'Hospital assignments CSV downloaded successfully.');
  };

  // Registered Hospitals for assignment
  const allRegisteredHospitals: Hospital[] = useMemo(() => {
    const list = [...INITIAL_HOSPITALS];
    try {
      const storedReqs = localStorage.getItem('aware_bharat_hospital_requests');
      if (storedReqs) {
        const parsed = JSON.parse(storedReqs);
        parsed.forEach((req: any) => {
          if ((req.status === 'Approved' || req.status === 'Active Partner') && !list.some(h => h.id === req.id)) {
            list.push({
              id: req.id || 'hosp-' + Math.random().toString(36).substr(2, 5),
              name: req.hospitalName || req.name || 'Hospital Node',
              logo: '',
              type: req.type || 'Community Partner',
              region: req.region || 'north',
              city: req.city || 'New Delhi',
              state: req.state || 'Delhi',
              specialties: req.specialties ? (Array.isArray(req.specialties) ? req.specialties : req.specialties.split(',')) : ['Oncology', 'Screening'],
              phone: req.contactPhone || req.phone || '+91 11 0000 0000',
              email: req.contactEmail || req.email || 'info@hospital.org',
              address: req.address || `${req.city}`,
              lat: 28.6139,
              lng: 77.2090,
              description: 'Approved Network Hospital'
            });
          }
        });
      }
    } catch (e) {}
    return list;
  }, []);

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

  const [hospitals, setHospitals] = useState<HospitalApplication[]>(() => {
    const stored = localStorage.getItem('aware_bharat_hospital_requests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = [...parsed];
        INITIAL_HOSPITAL_APPLICATIONS.forEach(initApp => {
          if (!merged.some((h: any) => h.id === initApp.id)) {
            merged.push(initApp);
          }
        });
        return merged;
      } catch (e) {
        console.error('Failed to parse hospital requests', e);
      }
    }
    return INITIAL_HOSPITAL_APPLICATIONS;
  });
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
  const [blogs, setBlogs] = useState<BlogArticle[]>(() => {
    const stored = localStorage.getItem('aware_bharat_blogs');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_BLOGS;
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
  const approveHospital = (id: string) => {
    const email = hospitals.find(h => h.id === id)?.name.toLowerCase().replace(/\s+/g, '').slice(0, 8) + '@awarebharat.org';
    const tempPass = 'CAB-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-TEMP';
    setHospitals(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, status: 'Approved' as const, generatedCredentials: { email, tempPassword: tempPass } } : h);
      localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(updated));
      return updated;
    });
    logAuditEntry('Hospital Application Approved', `Hospital ID: ${id}`, 'Info');
    setShowApprovalResult({ email, password: tempPass });
    showToast('Hospital application approved and credentials generated!');
  };

  const rejectHospital = (id: string) => {
    if (!rejectReason.trim()) return;
    setHospitals(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, status: 'Rejected' as const, rejectionReason: rejectReason } : h);
      localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(updated));
      return updated;
    });
    logAuditEntry('Hospital Application Rejected', `Hospital ID: ${id} (${rejectReason})`, 'Warning');
    setShowRejectDialog(null);
    setRejectReason('');
    showToast('Hospital application rejected.');
  };

  const requestMoreInfo = (id: string) => {
    setHospitals(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, status: 'Info Requested' as const } : h);
      localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(updated));
      return updated;
    });
    logAuditEntry('Hospital Info Requested', `Hospital ID: ${id}`, 'Info');
    showToast('Additional information requested from hospital.');
  };

  // ---- Notifications ----
  const sendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    let targetRole: 'admin' | 'superadmin' | 'hospital' | 'patient' | 'volunteer' = 'admin';
    if (notifAudience === 'Volunteers') targetRole = 'volunteer';
    else if (notifAudience === 'Hospitals') targetRole = 'hospital';
    else if (notifAudience === 'Patients') targetRole = 'patient';
    else if (notifAudience === 'Admins') targetRole = 'admin';

    enquiryStore.addNotification({
      targetRole,
      title: notifTitle,
      message: notifMessage
    });

    const newNotif: SentNotification = {
      id: 'NOTIF-S' + (sentNotifications.length + 1),
      title: notifTitle, message: notifMessage, audience: notifAudience,
      sentAt: new Date().toLocaleString('en-IN'), sentBy: 'board@awarebharat.org',
      recipientCount: notifAudience === 'All Users' ? 4250 : notifAudience === 'Volunteers' ? 2400 : notifAudience === 'Admins' ? 3 : 500,
    };
    setSentNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('aware_bharat_superadmin_sent_notifications', JSON.stringify(updated));
      return updated;
    });
    logAuditEntry(`Broadcast Notification Dispatched (${notifAudience})`, notifTitle, 'Info');
    setNotifTitle('');
    setNotifMessage('');
    showToast(`Notification broadcast to ${notifAudience}!`);
  };

  // ---- Blog Publishing ----
  const handlePublishBlogBySuperAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogSummary.trim()) return;

    const newBlogItem: BlogArticle = {
      id: 'blog-' + Date.now(),
      title: newBlogTitle,
      summary: newBlogSummary,
      content: newBlogSummary + '\n\nOfficial directive published by Super Admin Executive Board.',
      category: newBlogCategory,
      author: 'Executive Board',
      role: 'Super Admin',
      date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      tags: [newBlogCategory, 'Official Directive', 'Executive']
    };

    const updated = [newBlogItem, ...blogs];
    setBlogs(updated);
    localStorage.setItem('aware_bharat_blogs', JSON.stringify(updated));
    logAuditEntry(`Blog Notice Published ("${newBlogTitle}")`, 'Portal News', 'Info');
    setNewBlogTitle('');
    setNewBlogSummary('');
    toast.success('Notice Published', `"${newBlogItem.title}" is live on Portal News.`);
  };

  const handleDeleteBlogBySuperAdmin = (id: string) => {
    if (window.confirm('Are you sure you want to unpublish this article?')) {
      const updated = blogs.filter(b => b.id !== id);
      setBlogs(updated);
      localStorage.setItem('aware_bharat_blogs', JSON.stringify(updated));
      logAuditEntry(`Blog Article Deleted (ID: ${id})`, 'Portal News', 'Warning');
      toast.info('Blog Article Removed');
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
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.age,
      p.gender,
      `"${(p.diagnosis || '').replace(/"/g, '""')}"`,
      `"${(p.hospitalName || '').replace(/"/g, '""')}"`,
      p.financialAidStatus,
      p.financialAidAmount || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAB_SuperAdmin_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      `"${(v.name || '').replace(/"/g, '""')}"`,
      v.email,
      v.phone,
      `"${(v.domain || '').replace(/"/g, '""')}"`,
      v.registeredDate,
      v.hoursLogged,
      v.attendanceRate + '%',
      v.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAB_SuperAdmin_Volunteers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.date,
      c.type,
      `"${(c.loc || '').replace(/"/g, '""')}"`,
      `"${(c.vols || '').replace(/"/g, '""')}"`,
      c.status || 'Active'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAB_SuperAdmin_Campaigns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      `"${(d.donorName || '').replace(/"/g, '""')}"`,
      d.donorType,
      d.amount,
      d.date,
      d.paymentMethod,
      d.receiptSent ? 'Sent (80G)' : 'Pending'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAB_SuperAdmin_Donations_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      `"${(l.actor || '').replace(/"/g, '""')}"`,
      l.actorRole,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.target || '').replace(/"/g, '""')}"`,
      l.ipAddress,
      l.severity
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAB_SuperAdmin_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    { id: 'notifications', label: 'Notification Center', icon: Bell },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'roles', label: 'Roles & Permissions', icon: Layers },
    { id: 'database', label: 'Database Backup', icon: Database },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const kpi = SUPER_ADMIN_KPI;

  // Severity badge
  const severityBadge = (s: string) => {
    switch (s) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const hospitalStatusBadge = (s: string) => {
    switch (s) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Recommended by Admin': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-200';
      case 'Info Requested': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#1a1042] text-white transition-all duration-300 flex flex-col justify-between select-none ${
        mobileSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div>
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="font-headline-lg text-base font-black text-white tracking-tight truncate">
                  Super Admin Console
                </span>
              )}
            </div>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-0.5 max-h-[calc(100vh-160px)] overflow-y-auto">
            {sidebarItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { 
                    setActiveTab(item.id); 
                    setSearchTerm(''); 
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center rounded-xl p-2.5 text-[13px] font-semibold transition-all cursor-pointer ${isActive
                    ? 'bg-white/10 text-white shadow-sm border-l-4 border-purple-400'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <IconComp className={`w-4.5 h-4.5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3'}`} />
                  {(!sidebarCollapsed || mobileSidebarOpen) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center rounded-xl p-3 text-sm font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/20 cursor-pointer">
            <LogOut className={`w-5 h-5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3.5'}`} />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span>Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8f7ff]">

        {/* Header */}
        <header className="bg-white border-b border-purple-100/50 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }} 
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5 lg:hidden" />
              <Terminal className="w-5 h-5 hidden lg:block" />
            </button>
            <h2 className="font-headline-lg text-base sm:text-lg font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> SUPER-ADMIN-NODE
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">SA</div>
          </div>
        </header>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-[fadeInUp_0.3s_ease-out]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

          {/* ===== TAB: EXECUTIVE DASHBOARD ===== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Total Patients', value: kpi.totalPatients.toLocaleString(), icon: Heart, color: 'from-rose-500 to-pink-600' },
                  { label: 'Volunteers', value: kpi.totalVolunteers.toLocaleString(), icon: Users, color: 'from-emerald-500 to-teal-600' },
                  { label: 'Total Users', value: kpi.totalUsers.toLocaleString(), icon: Globe, color: 'from-blue-500 to-cyan-600' },
                  { label: 'Partner Hospitals', value: String(hospitals.filter(h => h.status === 'Approved').length + 4), icon: Building2, color: 'from-violet-500 to-purple-600' },
                  { label: 'Pending Tie-ups', value: String(hospitals.filter(h => h.status === 'Pending Review' || h.status === 'Recommended by Admin').length), icon: AlertCircle, color: 'from-amber-500 to-orange-600' },
                  { label: 'Active Campaigns', value: String(kpi.activeCampaigns), icon: Calendar, color: 'from-indigo-500 to-blue-600' },
                  { label: 'Donations (INR)', value: '₹' + kpi.totalDonations.toLocaleString(), icon: DollarSign, color: 'from-emerald-500 to-green-600' },
                  { label: 'Financial Aid Cases', value: String(kpi.financialAidCases), icon: Shield, color: 'from-pink-500 to-rose-600' },
                  { label: 'Awareness Programs', value: String(kpi.awarenessPrograms), icon: Megaphone, color: 'from-cyan-500 to-blue-600' },
                  { label: 'Admin Accounts', value: String(admins.length), icon: UserCog, color: 'from-slate-500 to-gray-600' },
                  { label: 'System Health', value: kpi.systemHealthScore + '%', icon: Activity, color: 'from-green-500 to-emerald-600' },
                  { label: 'Monthly Growth', value: '+' + kpi.monthlyGrowthRate + '%', icon: TrendingUp, color: 'from-purple-500 to-indigo-600' },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                        <card.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900">{card.value}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{card.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> Patient Intake Trend (2026)
                  </h3>
                  <div className="flex items-end justify-between gap-3 h-48 pt-4">
                    {MONTHLY_PATIENT_INTAKE.map((m, i) => {
                      const maxVal = Math.max(...MONTHLY_PATIENT_INTAKE.map(x => x.count));
                      const pct = (m.count / maxVal) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</span>
                          <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                            <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-400 transition-all duration-700 group-hover:from-purple-600 group-hover:to-pink-400" style={{ height: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Audit Activity</h3>
                  <div className="space-y-3">
                    {INITIAL_AUDIT_LOGS.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 text-xs">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.severity === 'Critical' ? 'bg-red-500' : log.severity === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-slate-700">{log.action}</p>
                          <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('audit')} className="w-full mt-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-100 transition-colors">
                    View All Audit Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: PENDING HOSPITAL ASSIGNMENT (STEPS 3 & 4) ===== */}
          {activeTab === 'enquiry-assignments' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">{pendingHospitalAssignmentCount}</span>
                    <span className="text-xs text-slate-500 font-medium">Pending Hospital Assignment</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">
                      {enquiries.filter(e => e.status === 'Assigned to Hospital').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Assigned to Hospital</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">
                      {enquiries.filter(e => e.status === 'Appointment Confirmed').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Appointments Confirmed</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">
                      {enquiries.filter(e => e.status === 'Declined by Hospital').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Declined (Needs Reassignment)</span>
                  </div>
                </div>
              </div>

              {/* Filter Row */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {['All', 'Pending Assignment', 'Assigned to Hospital', 'Declined by Hospital', 'Appointment Confirmed'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSuperAdminEnquiryFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        superAdminEnquiryFilter === st
                          ? 'bg-purple-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st} {st === 'Pending Assignment' && pendingHospitalAssignmentCount > 0 ? `(${pendingHospitalAssignmentCount})` : ''}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search ID, patient, city..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                    />
                  </div>
                  <button
                    onClick={handleExportAssignmentsCSV}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Export Hospital Assignments CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Enquiries Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-6 py-3.5">Enquiry ID</th>
                        <th className="px-6 py-3.5">Patient Details</th>
                        <th className="px-6 py-3.5">City & Preferred Loc</th>
                        <th className="px-6 py-3.5">Cancer Stream & Symptoms</th>
                        <th className="px-6 py-3.5">Admin & Hospital Notes</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {superAdminFilteredEnquiries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                            No patient enquiries found matching hospital assignment filter.
                          </td>
                        </tr>
                      ) : (
                        superAdminFilteredEnquiries.map((enq) => (
                          <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                              {enq.enquiryId}
                              <span className="text-[10px] text-slate-400 font-mono block">Ref: {enq.referenceNumber}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{enq.patientName}</p>
                              <p className="text-[10px] text-slate-500">{enq.age} yrs • {enq.gender}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-slate-800">{enq.city}</p>
                              <p className="text-[10px] text-slate-500">{enq.phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-800 block">{enq.cancerType || enq.reason}</span>
                              <span className="text-[10px] text-slate-500 truncate block max-w-xs">{enq.symptoms || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              {enq.adminDecision?.remarks && (
                                <p className="text-[11px] text-blue-700 font-medium">
                                  <strong>Admin:</strong> {enq.adminDecision.remarks}
                                </p>
                              )}
                              {enq.hospitalDecision?.action === 'Decline' && (
                                <p className="text-[11px] text-amber-700 font-medium">
                                  <strong>Declined:</strong> {enq.hospitalDecision.remarks}
                                </p>
                              )}
                              {enq.assignedHospitalName && (
                                <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                                  Assigned: {enq.assignedHospitalName}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={enq.status} />
                            </td>
                            <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                              {(enq.status === 'Approved by Admin' || enq.status === 'Declined by Hospital' || enq.status === 'Pending Hospital Assignment') && (
                                <button
                                  onClick={() => {
                                    setAssigningEnquiry(enq);
                                    setSelectedHospitalForAssign(enq.hospitalId || INITIAL_HOSPITALS[0].id);
                                    setAssignRemarks('');
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span>{enq.status === 'Declined by Hospital' ? 'Reassign Hospital' : 'Assign Hospital'}</span>
                                </button>
                              )}
                              <button
                                onClick={() => setTimelineEnquiry(enq)}
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Timeline</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: ADMIN MANAGEMENT ===== */}
          {activeTab === 'admins' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search admins..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
                </div>
                <button onClick={() => openAdminForm(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm">
                  <UserPlus className="w-4 h-4" /> Create Admin
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Admin Details</th>
                        <th className="px-5 py-3">Role & Region</th>
                        <th className="px-5 py-3">Login Password</th>
                        <th className="px-5 py-3">Passcode</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {admins.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase())).map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">{admin.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{admin.email} • {admin.phone || 'N/A'}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 block w-fit mb-1">{admin.role}</span>
                            <p className="text-[10px] font-medium text-slate-500">{admin.region}</p>
                          </td>
                          <td className="px-5 py-4">
                            <code className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">{admin.password || 'adminpassword'}</code>
                          </td>
                          <td className="px-5 py-4">
                            <code className="text-xs font-mono bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200 font-bold">{admin.passcode || '12345'}</code>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${admin.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : admin.status === 'Suspended' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              {admin.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setCreatedAdminCredentials(admin)} className="p-1.5 hover:bg-slate-100 rounded-lg text-teal-600 cursor-pointer" title="View Credentials Card"><Key className="w-3.5 h-3.5" /></button>
                              <button onClick={() => openAdminForm(admin)} className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => toggleAdminStatus(admin.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-amber-600 cursor-pointer" title={admin.status === 'Active' ? 'Suspend' : 'Activate'}>
                                {admin.status === 'Active' ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => deleteAdmin(admin.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin Create/Edit Modal */}
              {showAdminModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAdminModal(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{editingAdmin ? 'Edit Staff Admin Account' : 'Create New Staff Admin'}</h3>
                        <p className="text-xs text-slate-500">Assign region, role permissions, and administrative login credentials.</p>
                      </div>
                      <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={saveAdmin} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-600 block mb-1">Full Name</label>
                          <input required value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="Dr. John Doe" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1">Official Email (Login ID)</label>
                          <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="admin@awarebharat.org" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-600 block mb-1">Phone Number</label>
                          <input value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="+91 98765 12345" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1">Role Assignment</label>
                          <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer text-xs">
                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Assigned Region / Zone</label>
                        <input required value={formRegion} onChange={e => setFormRegion(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="North India — Delhi NCR" />
                      </div>

                      {/* Credentials Configuration Box */}
                      <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3">
                        <p className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-indigo-600" /> Admin Login Credentials Setup
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Assign Login Password</label>
                            <input 
                              required 
                              type="text" 
                              value={formPassword} 
                              onChange={e => setFormPassword(e.target.value)} 
                              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white outline-none focus:border-indigo-500 font-mono text-xs text-indigo-950 font-bold" 
                              placeholder="e.g. adminpassword" 
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Security Passcode (5 Digits)</label>
                            <input 
                              required 
                              type="text" 
                              maxLength={5}
                              value={formPasscode} 
                              onChange={e => setFormPasscode(e.target.value)} 
                              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white outline-none focus:border-indigo-500 font-mono text-xs text-indigo-950 font-bold" 
                              placeholder="e.g. 12345" 
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-indigo-700/80">These credentials will be required when logging in on the <strong>Admin Portal Login page</strong>.</p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 cursor-pointer shadow-sm">{editingAdmin ? 'Save Changes' : 'Create Admin & Generate Credentials'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Created Admin Credentials Summary Modal */}
              {createdAdminCredentials && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-[scaleUp_0.2s_ease-out]">
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Admin Account Credentials</h3>
                      <p className="text-xs text-slate-500">Provide these login credentials to <strong>{createdAdminCredentials.name}</strong> to access the Regional Admin Portal.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-semibold">Admin Name:</span>
                        <span className="font-bold text-slate-900">{createdAdminCredentials.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-semibold">Role & Region:</span>
                        <span className="font-bold text-indigo-700">{createdAdminCredentials.role} ({createdAdminCredentials.region})</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-semibold">Official Login Email:</span>
                        <code className="font-bold text-slate-900 font-mono select-all bg-white px-2 py-0.5 rounded border">{createdAdminCredentials.email}</code>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-semibold">Password:</span>
                        <code className="font-bold text-indigo-900 font-mono select-all bg-white px-2 py-0.5 rounded border border-indigo-200">{createdAdminCredentials.password || 'adminpassword'}</code>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 font-semibold">Security Passcode:</span>
                        <code className="font-bold text-amber-900 font-mono select-all bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{createdAdminCredentials.passcode || '12345'}</code>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const text = `CAB Admin Credentials:\nName: ${createdAdminCredentials.name}\nEmail: ${createdAdminCredentials.email}\nPassword: ${createdAdminCredentials.password || 'adminpassword'}\nPasscode: ${createdAdminCredentials.passcode || '12345'}`;
                          navigator.clipboard.writeText(text);
                          showToast('Credentials copied to clipboard!');
                        }}
                        className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" /> Copy Details
                      </button>
                      <button 
                        onClick={() => setCreatedAdminCredentials(null)} 
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: HOSPITAL APPROVALS ===== */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-2xl text-xs flex items-start gap-3">
                <Crown className="w-5 h-5 shrink-0 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-bold">Super Admin Executive Authority — Hospital Partnership Approvals & Tie-ups</p>
                  <p className="text-purple-800/85 mt-0.5">As Super Admin, you hold final executive authority to <strong>Approve & Activate</strong> or <strong>Reject</strong> hospital tie-ups nationwide. Regional Admins evaluate documentation and submit recommendations for your final decision.</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search hospital applications..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['All', 'Recommended by Admin', 'Info Requested', 'Approved', 'Rejected'].map(f => (
                    <button key={f} onClick={() => setHospitalFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${hospitalFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Hospital Cards */}
              <div className="space-y-4">
                {filteredHospitals.map(hosp => (
                  <div key={hosp.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${hospitalStatusBadge(hosp.status)}`}>{hosp.status}</span>
                          {hosp.nabhAccredited && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">✓ NABH Accredited</span>}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{hosp.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{hosp.address}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-[11px] text-slate-600">
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {hosp.city}, {hosp.state}</p>
                          <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {hosp.contactEmail}</p>
                          <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-indigo-500" /> {hosp.bedCount} beds</p>
                          <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Applied: {hosp.appliedDate}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {hosp.specialties.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">{s}</span>
                          ))}
                        </div>

                        {/* Documents */}
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Submitted Documents</p>
                          <div className="flex flex-wrap gap-2">
                            {hosp.documents.map((doc, di) => (
                              <span key={di} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 ${doc.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {doc.verified ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {doc.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Admin recommendation */}
                        {hosp.recommendedBy && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Regional Admin Recommendation</p>
                            <p className="text-xs text-blue-800 font-semibold">Submitted by: {hosp.recommendedBy}</p>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">{hosp.recommendationNotes}</p>
                          </div>
                        )}

                        {/* Generated credentials display */}
                        {hosp.generatedCredentials && (
                          <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Hospital Tie-up Active — Login Credentials Generated</p>
                            <p className="text-xs text-emerald-800 font-mono">Email: {hosp.generatedCredentials.email}</p>
                            <p className="text-xs text-emerald-800 font-mono">Temp Password: {hosp.generatedCredentials.tempPassword}</p>
                          </div>
                        )}

                        {/* Rejection reason */}
                        {hosp.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Application Rejected</p>
                            <p className="text-xs text-red-700">{hosp.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      {/* Super Admin Executive Approval Actions */}
                      {(hosp.status === 'Pending Review' || hosp.status === 'Recommended by Admin' || hosp.status === 'Info Requested') && (
                        <div className="flex flex-col gap-2 shrink-0 lg:w-48">
                          <button onClick={() => approveHospital(hosp.id)} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                            <Check className="w-3.5 h-3.5" /> Approve & Activate
                          </button>
                          <button onClick={() => setShowRejectDialog(hosp.id)} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center justify-center gap-1.5">
                            <X className="w-3.5 h-3.5" /> Reject Tie-Up
                          </button>
                          <button onClick={() => requestMoreInfo(hosp.id)} className="w-full py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 cursor-pointer flex items-center justify-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" /> Request Info
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reject Dialog */}
              {showRejectDialog && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRejectDialog(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                    <h3 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Reject Hospital Application</h3>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none text-xs resize-none focus:border-red-400" placeholder="Provide a detailed reason for rejection..." />
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setShowRejectDialog(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                      <button onClick={() => rejectHospital(showRejectDialog)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 cursor-pointer">Confirm Rejection</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Credentials Modal */}
              {showApprovalResult && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowApprovalResult(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-emerald-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Hospital Approved!</h3>
                    <p className="text-xs text-slate-500 mb-4">Login credentials have been auto-generated. Share them securely with the hospital.</p>
                    <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs text-left space-y-1.5 mb-4">
                      <p>Email: <span className="text-white">{showApprovalResult.email}</span></p>
                      <p>Temp Password: <span className="text-white">{showApprovalResult.password}</span></p>
                    </div>
                    <button onClick={() => setShowApprovalResult(null)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-indigo-700">Close</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: PATIENTS ===== */}
          {activeTab === 'patients' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Patients', value: (patients.length + 1415).toLocaleString(), color: 'text-rose-700 bg-rose-50 border-rose-200' },
                  { label: 'Under Treatment', value: String(patients.filter(p => p.status === 'Under Treatment').length + 380), color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { label: 'Recovered / Remission', value: String(patients.filter(p => p.status === 'Recovered').length + 890), color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { label: 'Financial Aid Pending', value: String(patients.filter(p => p.financialAidStatus === 'Pending Review').length), color: 'text-blue-700 bg-blue-50 border-blue-200' },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-[10px] font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients by name or diagnosis..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full"
                  />
                </div>
                <button
                  onClick={handleExportPatientsCSV}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4 text-indigo-600" /> Export Patients CSV
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Patient Code</th>
                        <th className="px-5 py-3">Patient Name</th>
                        <th className="px-5 py-3">Diagnosis</th>
                        <th className="px-5 py-3">Clinic Partner</th>
                        <th className="px-5 py-3">Financial Aid Status</th>
                        <th className="px-5 py-3 text-right">Medical Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-indigo-700">{p.id}</td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.age} yrs • {p.gender}</p>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-800">{p.diagnosis}</td>
                          <td className="px-5 py-4 font-medium text-slate-600">{p.hospitalName}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.financialAidStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : p.financialAidStatus === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {p.financialAidStatus} {p.financialAidAmount ? `(₹${p.financialAidAmount.toLocaleString()})` : ''}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right font-bold text-slate-700">{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: VOLUNTEERS ===== */}
          {activeTab === 'volunteers' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Volunteers', value: (volunteers.length + 2390).toLocaleString(), color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { label: 'Approved & Active', value: String(volunteers.filter(v => v.status === 'Approved').length + 2300), color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { label: 'Pending Verification', value: String(volunteers.filter(v => v.status === 'Pending Approval').length), color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { label: 'Total Hours Logged', value: '4,460h', color: 'text-purple-700 bg-purple-50 border-purple-200' },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-[10px] font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search volunteers by name or domain..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full"
                  />
                </div>
                <button
                  onClick={handleExportVolunteersCSV}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4 text-indigo-600" /> Export Volunteers CSV
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Volunteer ID</th>
                        <th className="px-5 py-3">Volunteer Name</th>
                        <th className="px-5 py-3">Contact</th>
                        <th className="px-5 py-3">Expertise / Domain</th>
                        <th className="px-5 py-3">Hours Logged</th>
                        <th className="px-5 py-3 text-right">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {volunteers.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.domain.toLowerCase().includes(searchTerm.toLowerCase())).map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-indigo-700">{v.id}</td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">{v.name}</p>
                            <p className="text-[10px] text-slate-400">Registered: {v.registeredDate}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            <p>{v.email}</p>
                            <p className="text-[10px] text-slate-400">{v.phone}</p>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-800">{v.domain}</td>
                          <td className="px-5 py-4 font-bold text-purple-700">{v.hoursLogged} hrs</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${v.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: CAMPAIGNS ===== */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Active Campaigns', value: String(campaigns.length), color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                  { label: 'Total Drives This Year', value: '18', color: 'text-purple-700 bg-purple-50 border-purple-200' },
                  { label: 'People Screened', value: '4,200+', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-[10px] font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <h3 className="text-sm font-bold text-slate-900">National Healthcare Campaigns & Screening Drives</h3>
                <button
                  onClick={handleExportCampaignsCSV}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-indigo-600" /> Export Campaigns CSV
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Campaign Title</th>
                        <th className="px-5 py-3">Schedule Date</th>
                        <th className="px-5 py-3">Drive Type</th>
                        <th className="px-5 py-3">Location Venue</th>
                        <th className="px-5 py-3 text-right">Volunteers Assigned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {campaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-bold text-slate-900">{c.title}</td>
                          <td className="px-5 py-4 text-indigo-700 font-semibold">{c.date}</td>
                          <td className="px-5 py-4 font-medium text-slate-700">{c.type}</td>
                          <td className="px-5 py-4 text-slate-600">{c.loc}</td>
                          <td className="px-5 py-4 text-right font-bold text-purple-700">{c.vols}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: DONATIONS AUDIT ===== */}
          {activeTab === 'donations' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Donations', value: '₹' + donations.reduce((acc, curr) => acc + curr.amount, 650000).toLocaleString(), color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { label: 'Individual Donors', value: String(donations.filter(d => d.donorType === 'Individual').length + 140), color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { label: 'Corporate Sponsors', value: String(donations.filter(d => d.donorType === 'Corporate').length + 6), color: 'text-purple-700 bg-purple-50 border-purple-200' },
                  { label: '80G Tax Receipts Sent', value: String(donations.filter(d => d.receiptSent).length), color: 'text-amber-700 bg-amber-50 border-amber-200' },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-[10px] font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <h3 className="text-sm font-bold text-slate-900">National Financial Ledger & Audit Receipts</h3>
                <button
                  onClick={handleExportDonationsCSV}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-indigo-600" /> Export Ledger CSV
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Receipt ID</th>
                        <th className="px-5 py-3">Donor Entity</th>
                        <th className="px-5 py-3">Inflow Amount</th>
                        <th className="px-5 py-3">Audit Date</th>
                        <th className="px-5 py-3">Payment Channel</th>
                        <th className="px-5 py-3 text-right">Tax Exemption Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {donations.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-indigo-700">{d.id}</td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">{d.donorName}</p>
                            <p className="text-[10px] text-slate-400">{d.donorType}</p>
                          </td>
                          <td className="px-5 py-4 font-bold text-emerald-700">₹{d.amount.toLocaleString()}</td>
                          <td className="px-5 py-4 text-slate-600">{d.date}</td>
                          <td className="px-5 py-4 font-medium text-slate-700">{d.paymentMethod}</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${d.receiptSent ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {d.receiptSent ? '✓ Dispatched (80G)' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: BLOGS ===== */}
          {activeTab === 'blogs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs self-start">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-indigo-600" /> Publish Executive Directive / News
                </h3>

                <form onSubmit={handlePublishBlogBySuperAdmin} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Category</label>
                    <select
                      value={newBlogCategory}
                      onChange={e => setNewBlogCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer text-xs"
                    >
                      <option value="Prevention">Oncology Prevention</option>
                      <option value="Nutrition">Nutrition Guide</option>
                      <option value="Research">Research & Board Directive</option>
                      <option value="Survivors">Survivor Story</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Headline Title</label>
                    <input
                      type="text"
                      required
                      value={newBlogTitle}
                      onChange={e => setNewBlogTitle(e.target.value)}
                      placeholder="e.g. National Cancer Awareness Board Issues New Directive"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Executive Summary</label>
                    <textarea
                      rows={3}
                      required
                      value={newBlogSummary}
                      onChange={e => setNewBlogSummary(e.target.value)}
                      placeholder="Write brief release notes..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-600 text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm cursor-pointer"
                  >
                    Publish to Public Portal
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Published Portal Articles & Directives</h3>
                <div className="space-y-3">
                  {blogs.map(art => (
                    <div key={art.id} className="p-3 border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-200">{art.category}</span>
                        <h4 className="font-bold text-slate-900 mt-2">{art.title}</h4>
                        <p className="text-slate-400 mt-0.5">Author: {art.author} ({art.role}) • {art.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBlogBySuperAdmin(art.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-colors"
                        title="Unpublish Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REPORT_CARDS.map(report => (
                  <div key={report.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs hover:shadow-md transition-all">
                    <div className="text-3xl mb-3">{report.icon}</div>
                    <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{report.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">Last: {report.lastGenerated}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => showToast(`${report.title} — PDF exported!`)} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold border border-red-200 hover:bg-red-100 cursor-pointer flex items-center gap-0.5"><Download className="w-3 h-3" /> PDF</button>
                        <button onClick={() => showToast(`${report.title} — Excel exported!`)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-0.5"><Download className="w-3 h-3" /> Excel</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TAB: GLOBAL ANALYTICS ===== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* Donation Trends */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600" /> Monthly Donation Trends (INR)</h3>
                <div className="flex items-end justify-between gap-3 h-48 pt-4">
                  {MONTHLY_DONATION_TREND.map((m, i) => {
                    const max = Math.max(...MONTHLY_DONATION_TREND.map(x => x.amount));
                    const pct = (m.amount / max) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">₹{(m.amount / 1000).toFixed(0)}K</span>
                        <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                          <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-700 group-hover:from-green-600 group-hover:to-emerald-400" style={{ height: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volunteer Hours */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Monthly Volunteer Hours</h3>
                <div className="flex items-end justify-between gap-3 h-44 pt-4">
                  {MONTHLY_VOLUNTEER_HOURS.map((m, i) => {
                    const max = Math.max(...MONTHLY_VOLUNTEER_HOURS.map(x => x.hours));
                    const pct = (m.hours / max) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{m.hours}h</span>
                        <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                          <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-700 group-hover:from-indigo-600 group-hover:to-blue-400" style={{ height: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: AUDIT LOGS ===== */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {['All', 'Info', 'Warning', 'Critical'].map(f => (
                    <button key={f} onClick={() => setAuditFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${auditFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
                  ))}
                  <button
                    onClick={handleExportAuditLogsCSV}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-2"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" /> Export CSV
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Timestamp</th>
                        <th className="px-5 py-3">Actor</th>
                        <th className="px-5 py-3">Action</th>
                        <th className="px-5 py-3">Target</th>
                        <th className="px-5 py-3">IP Address</th>
                        <th className="px-5 py-3">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-700">{log.actor}</p>
                            <p className="text-[10px] text-slate-400">{log.actorRole}</p>
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-800">{log.action}</td>
                          <td className="px-5 py-3 text-slate-600 text-[11px] max-w-[200px] truncate">{log.target}</td>
                          <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">{log.ipAddress}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${severityBadge(log.severity)}`}>{log.severity}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: NOTIFICATION CENTER ===== */}
          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs self-start">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-600" /> Broadcast Notification</h3>
                <form onSubmit={sendNotification} className="space-y-3 text-xs">
                  <div><label className="font-bold text-slate-600 block mb-1">Title</label><input required value={notifTitle} onChange={e => setNotifTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="System Announcement" /></div>
                  <div><label className="font-bold text-slate-600 block mb-1">Message</label><textarea required value={notifMessage} onChange={e => setNotifMessage(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs resize-none" placeholder="Enter your broadcast message..." /></div>
                  <div><label className="font-bold text-slate-600 block mb-1">Audience</label><select value={notifAudience} onChange={e => setNotifAudience(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer text-xs">
                    <option>All Users</option><option>Admins</option><option>Volunteers</option><option>Hospitals</option><option>Patients</option>
                  </select></div>
                  <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm cursor-pointer">Send Broadcast</button>
                </form>
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Sent Notifications</h3>
                <div className="space-y-3">
                  {sentNotifications.map(n => (
                    <div key={n.id} className="p-4 border border-slate-200/60 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">{n.audience}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2">{n.sentAt} • {n.recipientCount.toLocaleString()} recipients</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: SYSTEM SETTINGS ===== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* NGO Info */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-600" /> NGO Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {[
                    { label: 'Organization Name', value: SYSTEM_SETTINGS.ngoName },
                    { label: 'Tagline', value: SYSTEM_SETTINGS.tagline },
                    { label: 'Registration No.', value: SYSTEM_SETTINGS.registrationNo },
                    { label: 'Address', value: SYSTEM_SETTINGS.address },
                    { label: 'Phone', value: SYSTEM_SETTINGS.phone },
                    { label: 'Email', value: SYSTEM_SETTINGS.email },
                    { label: 'Website', value: SYSTEM_SETTINGS.website },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email & Payment Config */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-600" /> Email Configuration</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">SMTP Host</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.smtpHost}</span></div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Port</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.smtpPort}</span></div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Sender Email</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.smtpEmail}</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-indigo-600" /> Payment Gateway & API Keys</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Gateway</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.paymentGateway}</span></div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">API Key</span><span className="font-mono text-slate-800">{SYSTEM_SETTINGS.apiKeyMasked}</span></div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Secret</span><span className="font-mono text-slate-800">{SYSTEM_SETTINGS.secretKeyMasked}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: ROLES & PERMISSIONS ===== */}
          {activeTab === 'roles' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
                <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create Custom Role
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Role Name</th>
                        <th className="px-5 py-3">Description</th>
                        <th className="px-5 py-3">Permissions</th>
                        <th className="px-5 py-3">Assigned</th>
                        <th className="px-5 py-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {roles.map(role => (
                        <tr key={role.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 font-bold text-slate-900">{role.name}</td>
                          <td className="px-5 py-4 text-slate-600 text-[11px] max-w-[280px]">{role.description}</td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">{role.permissions.length} permissions</span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700">{role.assignedCount} admins</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${role.isSystem ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                              {role.isSystem ? 'System' : 'Custom'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Custom Role Modal */}
              {showRoleModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRoleModal(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="text-base font-bold text-slate-900">Create Custom Role</h3>
                      <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleAddRole} className="space-y-3.5 text-xs">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Role Title</label>
                        <input required value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="e.g. Audit Compliance Manager" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Description</label>
                        <textarea rows={3} value={newRoleDescription} onChange={e => setNewRoleDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs resize-none" placeholder="Scope of authority and access..." />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowRoleModal(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm">Save Role</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: DATABASE BACKUP ===== */}
          {activeTab === 'database' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* Health Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Database Size', value: DATABASE_HEALTH.totalSize, icon: HardDrive },
                  { label: 'Tables', value: String(DATABASE_HEALTH.tablesCount), icon: Database },
                  { label: 'Total Records', value: DATABASE_HEALTH.totalRecords.toLocaleString(), icon: Layers },
                  { label: 'Uptime', value: DATABASE_HEALTH.uptime, icon: Activity },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-200">
                      <s.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div><p className="text-lg font-black text-slate-900">{s.value}</p><p className="text-[10px] text-slate-500 font-semibold">{s.label}</p></div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleCreateBackupNow} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 shadow-sm"><FolderArchive className="w-4 h-4" /> Create Backup Now</button>
                <button onClick={() => showToast('Restore initiated from latest backup snapshot.')} className="px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-50 cursor-pointer flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Restore Latest</button>
              </div>

              {/* Backup History */}
              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-5 py-3">Timestamp</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Initiated By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {backupRecords.map((b: any) => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 text-slate-600">{b.timestamp}</td>
                          <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.type === 'Full' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{b.type}</span></td>
                          <td className="px-5 py-3 font-semibold text-slate-700">{b.size}</td>
                          <td className="px-5 py-3 text-slate-500">{b.duration}</td>
                          <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{b.status}</span></td>
                          <td className="px-5 py-3 text-slate-500">{b.initiatedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: SECURITY CENTER ===== */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* Active Sessions */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-600" /> Active Sessions ({INITIAL_ACTIVE_SESSIONS.length})</h3>
                <div className="space-y-3">
                  {INITIAL_ACTIVE_SESSIONS.map(s => (
                    <div key={s.id} className="p-4 border border-slate-200/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{s.user} <span className="text-slate-400 font-normal">({s.role})</span></p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{s.device} • {s.browser} • {s.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-semibold">{s.lastActivity}</p>
                        <p className="text-[10px] font-mono text-slate-400">{s.ipAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Failed Login Attempts */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-600" /> Failed Login Attempts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-4 py-2">Email</th><th className="px-4 py-2">IP Address</th><th className="px-4 py-2">Timestamp</th><th className="px-4 py-2">Reason</th><th className="px-4 py-2">Blocked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {INITIAL_FAILED_LOGINS.map(f => (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{f.email}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{f.ipAddress}</td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">{f.timestamp}</td>
                          <td className="px-4 py-3 text-slate-600">{f.reason}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${f.blocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {f.blocked ? 'Blocked' : 'Allowed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Password Policy */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-600" /> Password Policy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Min Length</p><p className="font-black text-slate-900 text-lg">12</p></div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Special Characters</p><p className="font-black text-slate-900 text-lg">Required</p></div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Expiry</p><p className="font-black text-slate-900 text-lg">90 Days</p></div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: PROFILE ===== */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg">SA</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{profileName}</h3>
                    <p className="text-xs text-slate-500">{profileEmail} • Super Admin</p>
                  </div>
                </div>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Display Name</label>
                    <input value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Email Address</label>
                    <input value={profileEmail} disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 text-xs cursor-not-allowed" />
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <label className="font-bold text-slate-600 block mb-1">Change Password</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="password" placeholder="Current password" className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" />
                      <input type="password" placeholder="New password" className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('aware_bharat_superadmin_profile', JSON.stringify({ profileName }));
                        showToast('Profile updated successfully!');
                      }}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm"
                    >
                      Save Changes
                    </button>
                    <button onClick={onLogout} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer">Secure Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Super Admin Hospital Assignment Modal (Step 4) */}
      {assigningEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Assign Patient to Hospital Partner
              </h3>
              <button onClick={() => setAssigningEnquiry(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Overview */}
            <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-indigo-900">{assigningEnquiry.patientName} ({assigningEnquiry.age} / {assigningEnquiry.gender})</span>
                <span className="font-mono text-xs font-bold bg-indigo-200/60 px-2 py-0.5 rounded">{assigningEnquiry.enquiryId}</span>
              </div>
              <p>📍 <strong>Location:</strong> {assigningEnquiry.city}{assigningEnquiry.state ? `, ${assigningEnquiry.state}` : ''} | 📞 <strong>Phone:</strong> {assigningEnquiry.phone}</p>
              <p>🩺 <strong>Inquiry Stream:</strong> {assigningEnquiry.reason} | <strong>Diagnosis:</strong> {assigningEnquiry.cancerType || 'General Screening'}</p>
              {assigningEnquiry.adminDecision?.remarks && (
                <p className="text-blue-800"><strong>Admin Remarks:</strong> {assigningEnquiry.adminDecision.remarks}</p>
              )}
              {assigningEnquiry.hospitalDecision?.action === 'Decline' && (
                <p className="text-amber-800"><strong>Previous Hospital Decline Reason:</strong> {assigningEnquiry.hospitalDecision.remarks}</p>
              )}
            </div>

            {/* Search & Multi-Filter Bar for Hospitals */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Select Hospital Node (Filter by City, State & Specialty)</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Search hospital name/city..."
                  value={hospSearchTerm}
                  onChange={e => setHospSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:border-indigo-600"
                />
                <select
                  value={hospCityFilter}
                  onChange={e => setHospCityFilter(e.target.value)}
                  className="px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
                >
                  <option value="All">All Cities</option>
                  {Array.from(new Set(allRegisteredHospitals.map(h => h.city))).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={hospSpecialtyFilter}
                  onChange={e => setHospSpecialtyFilter(e.target.value)}
                  className="px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
                >
                  <option value="All">All Specialties</option>
                  <option value="Surgical Oncology">Surgical Oncology</option>
                  <option value="Radiation Oncology">Radiation Oncology</option>
                  <option value="Medical Oncology">Medical Oncology</option>
                  <option value="Pediatric Oncology">Pediatric Oncology</option>
                  <option value="Preventive Oncology">Preventive Oncology</option>
                </select>
                <select
                  value={hospTypeFilter}
                  onChange={e => setHospTypeFilter(e.target.value)}
                  className="px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
                >
                  <option value="All">All Center Types</option>
                  <option value="Center of Excellence">Center of Excellence</option>
                  <option value="Community Partner">Community Partner</option>
                </select>
              </div>
            </div>

            {/* Hospital Options List */}
            <div className="overflow-y-auto max-h-56 space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {filteredHospitalsForAssignment.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No registered hospitals match the active search/filter criteria.</p>
              ) : (
                filteredHospitalsForAssignment.map(hosp => (
                  <label
                    key={hosp.id}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedHospitalForAssign === hosp.id
                        ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="assign-hospital"
                        checked={selectedHospitalForAssign === hosp.id}
                        onChange={() => setSelectedHospitalForAssign(hosp.id)}
                        className="mt-1 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{hosp.name}</h5>
                        <p className="text-[11px] text-slate-600">📍 {hosp.address} ({hosp.city}, {hosp.state})</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold">{hosp.type}</span>
                          {hosp.specialties.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <p>📞 {hosp.phone}</p>
                      <p>✉️ {hosp.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Assignment Remarks */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Super Admin Assignment Notes / Instructions for Hospital (Optional)
              </label>
              <textarea
                rows={2}
                value={assignRemarks}
                onChange={e => setAssignRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-indigo-600 outline-none"
                placeholder="e.g. Priority case. Please arrange prompt surgical oncology consult..."
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAssigningEnquiry(null)}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedHospitalForAssign}
                onClick={() => {
                  if (selectedHospitalForAssign) {
                    const targetHosp = allRegisteredHospitals.find(h => h.id === selectedHospitalForAssign);
                    const targetName = targetHosp?.name || 'Partner Hospital';
                    enquiryStore.superAdminAssignHospital(
                      assigningEnquiry.id,
                      selectedHospitalForAssign,
                      targetName,
                      assignRemarks,
                      'Board Administrator'
                    );
                    toast.success('Hospital Assigned', `Patient ${assigningEnquiry.patientName} assigned to ${targetName}.`);
                    setAssigningEnquiry(null);
                    setAssignRemarks('');
                    setSelectedHospitalForAssign('');
                  }
                }}
                className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4" />
                <span>Confirm Hospital Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      <EnquiryTimelineModal
        enquiry={timelineEnquiry}
        isOpen={!!timelineEnquiry}
        onClose={() => setTimelineEnquiry(null)}
      />

    </div>
  );
}
