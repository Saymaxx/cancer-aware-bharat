import React, { useState, useMemo } from 'react';
import {
  Users, Building2, Calendar, Heart, Settings, LogOut, Bell, DollarSign,
  BookOpen, Terminal, CheckCircle2, User, Clipboard, Menu,
  Stethoscope, Crown, UserCog, Layers, PieChart, LayoutDashboard, Megaphone,
  Database, ShieldCheck, FileText,
} from 'lucide-react';
import { useAdmins, useApiEnquiries, useApiNotifications, useApiHospitals, useAuditLogs, useBackups, useBlogs, useDatabaseHealth, useDonations, useEvents, useIntegrationStatus, useOrgSettings, usePartnerRequests, usePatientRecords, useRoles, useStaffMe, useVolunteers } from '../api/hooks';
import { activateAdmin, assignAdminRole, assignHospital, ApiError, approvePartnerRequest, broadcastNotification, changeStaffPassword, createAdmin, createBackup, createBlog, createRole, deleteAdmin as deleteAdminAccount, deleteBlog, getStaffSession, rejectPartnerRequest, requestPartnerRequestInfo, suspendAdmin, updateAdmin, updateOrgSettings, updateStaffMe, type ApiOrgSettings, type NotificationAudience } from '../api/client';
import EnquiryTimelineModal from './EnquiryTimelineModal';
import { PatientEnquiry, Hospital } from '../types';
import { useToast } from './common/Toast';
import DashboardSidebar from './common/DashboardSidebar';
import { useSidebarState } from '../hooks/useSidebarState';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { csvCell, downloadCsv } from '../utils/csvExport';

import {
  type SuperAdminAccount, type HospitalApplication
} from '../superAdminDashboardData';

import {
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
  AdminAccountModal, ApproveHospitalModal, RejectHospitalModal,
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
  const staffSession = useMemo(() => getStaffSession(), []);
  const apiToken = useMemo(() => staffSession?.accessToken || null, [staffSession]);
  const { enquiries, refetch: refetchEnquiries } = useApiEnquiries(apiToken);
  const { notifications: superAdminNotifications } = useApiNotifications(apiToken);
  const { events } = useEvents();
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



  const { admins, refetch: refetchAdmins } = useAdmins(apiToken);

  const { partnerRequests, refetch: refetchPartnerRequests } = usePartnerRequests(apiToken);
  const { blogs, refetch: refetchBlogs } = useBlogs();
  const hospitals: HospitalApplication[] = useMemo(() => partnerRequests.map(pr => {
    const status: HospitalApplication['status'] =
      pr.status === 'Approved' ? 'Approved' :
      pr.status === 'Rejected' ? 'Rejected' :
      pr.status === 'Recommended' ? 'Recommended by Admin' :
      pr.status === 'Info Requested' ? 'Info Requested' :
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
  }), [partnerRequests]);
  const { auditLogs } = useAuditLogs(apiToken);
  const { roles, refetch: refetchRoles } = useRoles(apiToken);
  const { health: databaseHealth, loading: databaseHealthLoading } = useDatabaseHealth(apiToken);
  const { backups, refetch: refetchBackups } = useBackups(apiToken);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const { settings: orgSettings, loading: orgSettingsLoading, refetch: refetchOrgSettings } = useOrgSettings(apiToken);
  const { status: integrationStatus } = useIntegrationStatus(apiToken);
  const [savingOrgSettings, setSavingOrgSettings] = useState(false);
  const handleSaveOrgSettings = async (payload: ApiOrgSettings) => {
    if (!apiToken) return;
    setSavingOrgSettings(true);
    try {
      await updateOrgSettings(apiToken, payload);
      await refetchOrgSettings();
      toast.success('Settings Saved', 'Organization information updated successfully.');
    } catch (err) {
      toast.error('Save Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    } finally {
      setSavingOrgSettings(false);
    }
  };

  // Cross-Platform Unified Data States -- same real-backend mapping AdminDashboard.tsx
  // uses for its own copies of these tabs (Phases E/F/C), reused here since
  // SuperAdmin's Patients/Volunteers/Donations tabs are read-only + CSV-export
  // views of the same underlying data, not separate CRUD surfaces.
  const { patientRecords: apiPatientRecords } = usePatientRecords(apiToken);
  const patients: Patient[] = useMemo(() => apiPatientRecords.map(r => ({
    id: r.id,
    recordId: r.recordId,
    name: r.name,
    age: r.age,
    gender: r.gender as Patient['gender'],
    diagnosis: r.diagnosis,
    hospitalId: r.hospitalId || '',
    hospitalName: r.hospitalName || '',
    assignedVolunteerId: r.assignedVolunteerId || undefined,
    assignedVolunteerName: r.assignedVolunteerName || undefined,
    financialAidStatus: r.financialAidStatus,
    financialAidAmount: r.financialAidAmount ?? undefined,
    reportUrl: r.reportUrl || undefined,
    status: r.caseStatus,
  })), [apiPatientRecords]);

  const { volunteers: apiVolunteers } = useVolunteers(apiToken);
  // domain/city/assignedCampaignsCount/attendanceRate have no backend
  // equivalent, same honest-default rationale as AdminDashboard.tsx.
  // hoursLogged is real (self-reported hours log).
  const volunteers: AdminVolunteer[] = useMemo(() => apiVolunteers.map(v => ({
    id: v.id,
    name: v.name,
    email: v.email,
    phone: v.phone,
    domain: v.area || 'General Volunteer',
    city: '',
    status: v.status,
    assignedCampaignsCount: 0,
    hoursLogged: v.totalHours,
    attendanceRate: 0,
    registeredDate: new Date(v.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
  })), [apiVolunteers]);

  const campaigns = useMemo(() => events.map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    type: e.type,
    loc: e.location,
    registrations: `${e.registeredCount} / ${e.capacity} registered`,
    status: e.status,
  })), [events]);

  const { donations: apiDonations } = useDonations(apiToken);
  const donations: AdminDonation[] = useMemo(() => apiDonations.map(d => ({
    id: d.id,
    donorName: d.donorName,
    donorType: d.donorType,
    amount: d.amount,
    date: new Date(d.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    paymentMethod: d.paymentMethod,
    receiptSent: d.receiptSent,
    sponsorshipCampaign: d.sponsorshipCampaign || undefined,
  })), [apiDonations]);
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
  const [formRegion, setFormRegion] = useState('');
  // '' means "no custom role assigned" (the plain "Admin" label).
  const [formRoleId, setFormRoleId] = useState('');
  // Shown once via this modal instead of ever being persisted/re-fetchable
  // -- same pattern as showApprovalResult for hospital approval.
  const [createdAdminCredentials, setCreatedAdminCredentials] = useState<{ email: string; password: string } | null>(null);

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
  const { me: staffMe, loading: staffMeLoading, refetch: refetchStaffMe } = useStaffMe(apiToken);
  const [savingProfileName, setSavingProfileName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfileName = async (name: string) => {
    if (!apiToken) return;
    setSavingProfileName(true);
    try {
      await updateStaffMe(apiToken, name);
      await refetchStaffMe();
      toast.success('Profile Updated', 'Your display name was updated successfully.');
    } catch (err) {
      toast.error('Update Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    } finally {
      setSavingProfileName(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!apiToken) return false;
    setChangingPassword(true);
    try {
      await changeStaffPassword(apiToken, currentPassword, newPassword);
      toast.success('Password Updated', 'Your password was changed successfully.');
      return true;
    } catch (err) {
      toast.error('Password Change Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
      return false;
    } finally {
      setChangingPassword(false);
    }
  };

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
      setFormRegion(admin.region);
      setFormRoleId(admin.customRoleId || '');
    } else {
      setEditingAdmin(null);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormRegion('');
      setFormRoleId('');
    }
    setShowAdminModal(true);
  };

  const saveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !apiToken) return;

    try {
      let adminId: string;
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, apiToken, { name: formName, phone: formPhone || undefined, region: formRegion || undefined });
        adminId = editingAdmin.id;
        showToast(`Admin "${formName}" updated successfully.`);
        setShowAdminModal(false);
      } else {
        const result = await createAdmin(apiToken, { name: formName, email: formEmail, phone: formPhone || undefined, region: formRegion || undefined });
        adminId = result.admin.id;
        showToast(`Admin "${formName}" created with credentials!`);
        setShowAdminModal(false);
        setCreatedAdminCredentials({ email: result.loginEmail, password: result.tempPassword });
      }
      const currentRoleId = editingAdmin?.customRoleId || '';
      if (formRoleId !== currentRoleId) {
        await assignAdminRole(adminId, apiToken, formRoleId || null);
        await refetchRoles();
      }
      await refetchAdmins();
    } catch (err) {
      toast.error('Save Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const toggleAdminStatus = async (id: string) => {
    if (!apiToken) return;
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    try {
      if (admin.status === 'Active') {
        await suspendAdmin(id, apiToken);
        showToast(`Admin "${admin.name}" suspended.`);
      } else {
        await activateAdmin(id, apiToken);
        showToast(`Admin "${admin.name}" activated.`);
      }
      await refetchAdmins();
    } catch (err) {
      toast.error('Status Change Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!apiToken) return;
    const admin = admins.find(a => a.id === id);
    if (!admin || !window.confirm(`Permanently delete admin "${admin.name}"? This action cannot be undone.`)) return;
    try {
      await deleteAdminAccount(id, apiToken);
      await refetchAdmins();
      showToast(`Admin "${admin.name}" has been deleted.`);
    } catch (err) {
      toast.error('Delete Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
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
      setShowRejectDialog(null);
      setRejectReason('');
      showToast('Hospital application rejected.');
      refetchPartnerRequests();
    } catch (err) {
      toast.error('Rejection Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const requestMoreInfo = async (id: string) => {
    if (!apiToken) return;
    try {
      await requestPartnerRequestInfo(id, apiToken);
      showToast('Additional information requested from hospital.');
      refetchPartnerRequests();
    } catch (err) {
      toast.error('Request Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Notifications ----
  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage || !apiToken) return;

    try {
      const result = await broadcastNotification(apiToken, notifAudience as NotificationAudience, notifTitle, notifMessage);
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
      toast.info('Blog Article Removed');
    } catch (err) {
      toast.error('Delete Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Roles Management ----
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !apiToken) return;

    try {
      const created = await createRole(apiToken, {
        name: newRoleName,
        description: newRoleDescription || 'Custom Administrative Role',
        permissions: ['dashboard.view', 'reports.view'],
      });
      await refetchRoles();
      setNewRoleName('');
      setNewRoleDescription('');
      setShowRoleModal(false);
      toast.success('Role Created', `Custom role "${created.name}" saved.`);
    } catch (err) {
      toast.error('Role Creation Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Backup Trigger ----
  const handleCreateBackupNow = async () => {
    if (!apiToken) return;
    setCreatingBackup(true);
    try {
      await createBackup(apiToken);
      await refetchBackups();
      toast.success('Backup Completed', 'A full database snapshot was written to disk.');
    } catch (err) {
      toast.error('Backup Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    } finally {
      setCreatingBackup(false);
    }
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
    const headers = ['Campaign ID', 'Title', 'Date', 'Type', 'Location', 'Registrations', 'Status'];
    const rows = campaigns.map(c => [
      c.id,
      csvCell(c.title),
      c.date,
      c.type,
      csvCell(c.loc),
      csvCell(c.registrations),
      c.status
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
  // Super Admin can see and act on every application directly -- an Admin
  // recommendation is optional context, not a gate (the backend has always
  // allowed approve/reject/request-info straight from 'Pending').
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = hospitalFilter === 'All' || h.status === hospitalFilter;
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
              patients={patients}
              volunteers={volunteers}
              donations={donations}
              activeCampaignsCount={events.filter(e => e.status === 'Scheduled').length}
              blogCount={blogs.length}
              auditLogs={auditLogs}
              apiToken={apiToken}
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
              toggleAdminStatus={toggleAdminStatus}
              deleteAdmin={handleDeleteAdmin}
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
            <ReportsTab
              patients={patients}
              volunteers={volunteers}
              donations={donations}
              hospitals={hospitals}
              admins={admins}
              campaigns={campaigns}
              showToast={showToast}
            />
          )}

          {/* ===== TAB: GLOBAL ANALYTICS ===== */}
          {activeTab === 'analytics' && (
            <AnalyticsTab apiToken={apiToken} />
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
            <SettingsTab
              settings={orgSettings}
              loading={orgSettingsLoading}
              saving={savingOrgSettings}
              onSave={handleSaveOrgSettings}
              integrationStatus={integrationStatus}
            />
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
              health={databaseHealth}
              healthLoading={databaseHealthLoading}
              backups={backups}
              creatingBackup={creatingBackup}
              handleCreateBackupNow={handleCreateBackupNow}
            />
          )}

          {/* ===== TAB: SECURITY CENTER ===== */}
          {activeTab === 'security' && (
            <SecurityTab staffSession={staffSession} auditLogs={auditLogs} />
          )}

          {/* ===== TAB: PROFILE ===== */}
          {activeTab === 'profile' && (
            <ProfileTab
              me={staffMe}
              loading={staffMeLoading}
              savingName={savingProfileName}
              changingPassword={changingPassword}
              onSaveName={handleSaveProfileName}
              onChangePassword={handleChangePassword}
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
          formRegion={formRegion}
          setFormRegion={setFormRegion}
          roles={roles}
          formRoleId={formRoleId}
          setFormRoleId={setFormRoleId}
          onSubmit={saveAdmin}
        />
      )}

      {/* Created Admin Credentials Summary Modal */}
      {createdAdminCredentials && (
        <HospitalApprovedModal
          result={createdAdminCredentials}
          onClose={() => setCreatedAdminCredentials(null)}
          title="Admin Created!"
          description="Login credentials have been auto-generated. Share them securely with the new admin."
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
