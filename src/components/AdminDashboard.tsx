import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, Building2, Calendar, Heart, Shield,
  BarChart3, Settings, LogOut, Bell, FileCheck,
  DollarSign, BookOpen, MessageSquare, Terminal, Menu, Stethoscope,
} from 'lucide-react';
import { useApiEnquiries, useApiHospitals, useApiNotifications, useBlogs, useCampaignRequests, useDonations, useEvents, usePartnerRequests, usePatientRecords, useVolunteerFeedback, useVolunteers } from '../api/hooks';
import { adminApproveEnquiry, adminRejectEnquiry, ApiError, approveVolunteer, broadcastNotification, createBlog, createEvent, createPatientRecord, deleteBlog, deletePatientRecord, getStaffSession, recommendPartnerRequest, rejectPartnerRequest, rejectVolunteer, respondToVolunteerFeedback, scheduleCampaignRequest, sendDonationReceipt, updatePatientRecord } from '../api/client';
import EnquiryTimelineModal from './EnquiryTimelineModal';
import { PatientEnquiry } from '../types';
import { useToast } from './common/Toast';
import DashboardSidebar from './common/DashboardSidebar';
import { useSidebarState } from '../hooks/useSidebarState';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { csvCell, downloadCsv } from '../utils/csvExport';

import {
  INITIAL_KPI_METRICS,
  type Patient, type AdminVolunteer, type PartnerHospital,
  type CampaignRequest, type AdminDonation, type AdminFeedback
} from '../adminDashboardData';

import OverviewTab from './admin-dashboard/OverviewTab';
import EnquiriesTab from './admin-dashboard/EnquiriesTab';
import PatientsTab from './admin-dashboard/PatientsTab';
import VolunteersTab from './admin-dashboard/VolunteersTab';
import CampaignsTab from './admin-dashboard/CampaignsTab';
import HospitalsTab from './admin-dashboard/HospitalsTab';
import RequestsTab from './admin-dashboard/RequestsTab';
import DonationsTab from './admin-dashboard/DonationsTab';
import AdminBlogsTab from './admin-dashboard/AdminBlogsTab';
import FeedbackTab from './admin-dashboard/FeedbackTab';
import NotificationsTab from './admin-dashboard/NotificationsTab';
import SettingsTab from './admin-dashboard/SettingsTab';
import {
  PatientModal, ApproveEnquiryModal, RejectEnquiryModal, DeclineApplicationModal, RejectVolunteerModal,
} from './admin-dashboard/Modals';

// HospitalPartnerRequest.status (backend) -> PartnerHospital.status (this
// dashboard's pre-existing display shape) -- 'Recommended'/'Approved' map
// onto labels the UI already had before this was wired to a real API.
function partnerRequestStatusLabel(status: string): PartnerHospital['status'] {
  switch (status) {
    case 'Approved': return 'Active Partner';
    case 'Recommended': return 'Recommended to Super Admin';
    case 'Rejected': return 'Declined by Admin';
    default: return 'Pending Tie-up';
  }
}

export default function AdminDashboard({ onPageChange, onLogout }: { onPageChange?: (page: string) => void; onLogout: () => void }) {
  const toast = useToast();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, toggleSidebar } = useSidebarState();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Real-time Patient Enquiries & Notifications from the backend API
  const apiToken = useMemo(() => getStaffSession()?.accessToken || null, []);
  const { enquiries, refetch: refetchEnquiries } = useApiEnquiries(apiToken);
  const { notifications: adminNotifications } = useApiNotifications(apiToken);
  const { partnerRequests, refetch: refetchPartnerRequests } = usePartnerRequests(apiToken);
  const { volunteers: apiVolunteers, refetch: refetchVolunteers } = useVolunteers(apiToken);
  const { patientRecords: apiPatientRecords, refetch: refetchPatientRecords } = usePatientRecords(apiToken);
  const { donations: apiDonations, refetch: refetchDonations } = useDonations(apiToken);
  const { feedback: apiFeedback, refetch: refetchFeedback } = useVolunteerFeedback(apiToken);
  const { blogs, refetch: refetchBlogs } = useBlogs();
  const { events, refetch: refetchEvents } = useEvents();
  const { campaignRequests, refetch: refetchCampaignRequests } = useCampaignRequests(apiToken);
  const feedbacks: AdminFeedback[] = useMemo(() => apiFeedback.map(f => ({
    id: f.id,
    volunteerName: f.volunteerName,
    campaignName: f.campaignName,
    date: new Date(f.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    rating: f.rating,
    comment: f.comment,
    status: f.status,
    response: f.response || undefined,
  })), [apiFeedback]);
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
  const { hospitals: partnerHospitalDirectory } = useApiHospitals();
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
  // domain/city/assignedCampaignsCount/hoursLogged/attendanceRate have no
  // backend equivalent (no campaign-assignment or hours-tracking feature
  // exists for volunteers yet) -- left at their honest default rather than
  // faked, same principle as documentVerified below.
  const volunteers: AdminVolunteer[] = useMemo(() => apiVolunteers.map(v => ({
    id: v.id,
    name: v.name,
    email: v.email,
    phone: v.phone,
    domain: v.area || 'General Volunteer',
    city: '',
    status: v.status,
    assignedCampaignsCount: 0,
    hoursLogged: 0,
    attendanceRate: 0,
    registeredDate: new Date(v.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
  })), [apiVolunteers]);
  // documentVerified has no backend field (no document-upload feature
  // exists for partner requests) -- kept as a local-only overlay, same
  // "check before recommending" gate the mock version already had, just
  // no longer persisted to localStorage since the underlying list is now
  // real and refetched from the server.
  const [locallyVerifiedHospitalIds, setLocallyVerifiedHospitalIds] = useState<Set<string>>(new Set());
  const hospitalRequests: PartnerHospital[] = useMemo(() => partnerRequests.map(pr => ({
    id: pr.id,
    name: pr.hospitalName,
    city: pr.city,
    status: partnerRequestStatusLabel(pr.status),
    appliedDate: new Date(pr.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    documentVerified: locallyVerifiedHospitalIds.has(pr.id),
    contactEmail: pr.email,
    contactPhone: pr.phone,
    declineReason: pr.status === 'Rejected' ? (pr.decisionNotes || undefined) : undefined,
  })), [partnerRequests, locallyVerifiedHospitalIds]);
  const pendingAdminCount = useMemo(() => enquiries.filter(e => e.status === 'Pending Admin Review').length, [enquiries]);

  // Admin Enquiry Modals state
  const [showApproveEnquiryModal, setShowApproveEnquiryModal] = useState<PatientEnquiry | null>(null);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [showRejectEnquiryModal, setShowRejectEnquiryModal] = useState<PatientEnquiry | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [timelineEnquiry, setTimelineEnquiry] = useState<PatientEnquiry | null>(null);
  const [enquiryFilter, setEnquiryFilter] = useState('All');

  const [kpiMetrics, setKpiMetrics] = useState(INITIAL_KPI_METRICS);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState('All');
  const [volunteerFilter, setVolunteerFilter] = useState('All');

  // Form states (Add/Edit Patient)
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientFormName, setPatientFormName] = useState('');
  const [patientFormAge, setPatientFormAge] = useState('');
  const [patientFormGender, setPatientFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientFormDiagnosis, setPatientFormDiagnosis] = useState('');
  const [patientFormHospitalId, setPatientFormHospitalId] = useState('');
  const [patientFormAid, setPatientFormAid] = useState<'Not Requested' | 'Pending Review' | 'Approved' | 'Disbursed' | 'Rejected'>('Not Requested');
  const [patientFormAidAmt, setPatientFormAidAmt] = useState('');

  // Form states (Add Campaign)
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignType, setNewCampaignType] = useState('Screening Camp');
  const [newCampaignDate, setNewCampaignDate] = useState('');
  const [newCampaignLocation, setNewCampaignLocation] = useState('');
  const [newCampaignCapacity, setNewCampaignCapacity] = useState('');
  const [campaignSuccessToast, setCampaignSuccessToast] = useState(false);

  // Form states (Add Blog Article)
  const [newBlogCategory, setNewBlogCategory] = useState<'Prevention' | 'Nutrition' | 'Survivors' | 'Research'>('Prevention');
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogSummary, setNewBlogSummary] = useState('');
  const [newBlogAuthor, setNewBlogAuthor] = useState('Dr. Ramesh Sharma');

  // Form states (Notification Announcements)
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [notifSuccessToast, setNotifSuccessToast] = useState(false);

  // Form states (Feedback Response)
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackReplyText, setFeedbackReplyText] = useState('');

  // Admin Profile settings
  const [profileName, setProfileName] = useState(() => {
    const stored = localStorage.getItem('aware_bharat_admin_profile');
    if (stored) {
      try { return JSON.parse(stored).profileName; } catch (e) {}
    }
    return 'Dwarka Admin Node';
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    const stored = localStorage.getItem('aware_bharat_admin_profile');
    if (stored) {
      try { return JSON.parse(stored).profileEmail; } catch (e) {}
    }
    return 'dwarka@awarebharat.org';
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Get active administrative session metadata
  const adminDetails = useMemo(() => {
    const stored = localStorage.getItem('aware_bharat_logged_in_staff');
    return stored ? JSON.parse(stored) : { email: 'dwarka@awarebharat.org', hospital: 'Apex Oncology Institute', sessionKey: 'STAFF-MOCKKEY' };
  }, []);

  // Sync summary figures
  const summaryKpis = useMemo(() => {
    return {
      totalPatients: patients.length + 1415, // offsets mock database base count
      totalVolunteers: volunteers.length + 2395,
      activeCampaigns: events.filter(e => e.status === 'Scheduled').length,
      donationsReceived: donations.reduce((acc, curr) => acc + curr.amount, 650000),
      pendingHospitalTieups: hospitalRequests.filter(h => h.status === 'Pending Tie-up').length,
      financialAidRequests: patients.filter(p => p.financialAidStatus === 'Pending Review').length,
    };
  }, [patients, volunteers, hospitalRequests, donations, events]);

  // ==========================================
  // PATIENT UTILITIES
  // ==========================================
  const handleOpenPatientForm = (patient: Patient | null = null) => {
    if (patient) {
      setEditingPatient(patient);
      setPatientFormName(patient.name);
      setPatientFormAge(String(patient.age));
      setPatientFormGender(patient.gender);
      setPatientFormDiagnosis(patient.diagnosis);
      setPatientFormHospitalId(patient.hospitalId || '');
      setPatientFormAid(patient.financialAidStatus);
      setPatientFormAidAmt(String(patient.financialAidAmount || ''));
    } else {
      setEditingPatient(null);
      setPatientFormName('');
      setPatientFormAge('');
      setPatientFormGender('Male');
      setPatientFormDiagnosis('');
      setPatientFormHospitalId('');
      setPatientFormAid('Not Requested');
      setPatientFormAidAmt('');
    }
    setShowPatientModal(true);
  };

  useEscapeKey(() => {
    setShowPatientModal(false);
    setShowApproveEnquiryModal(null);
    setShowRejectEnquiryModal(null);
    setShowAdminDeclineModal(null);
    setTimelineEnquiry(null);
  });

  const handleExportEnquiriesCSV = () => {
    if (enquiries.length === 0) {
      toast.info('No Enquiries', 'There are no enquiries to export.');
      return;
    }
    const headers = ['Enquiry ID', 'Reference Number', 'Patient Name', 'Age', 'Gender', 'Phone', 'City', 'Reason', 'Priority', 'Status', 'Date'];
    const rows = enquiries.map(e => [
      e.enquiryId,
      e.referenceNumber,
      csvCell(e.patientName),
      e.age,
      e.gender,
      e.phone,
      csvCell(e.city),
      csvCell(e.reason),
      e.priority,
      csvCell(e.status),
      e.date
    ]);
    downloadCsv(headers, rows, 'Cancer_Aware_Bharat_Enquiries');
    toast.success('Export Complete', 'Enquiries CSV downloaded successfully.');
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFormName || !patientFormAge || !patientFormDiagnosis || !apiToken) return;

    const selectedHospital = partnerHospitalDirectory.find(h => h.id === patientFormHospitalId);
    const payload = {
      name: patientFormName,
      age: parseInt(patientFormAge),
      gender: patientFormGender,
      diagnosis: patientFormDiagnosis,
      hospitalId: selectedHospital?.id || null,
      hospitalName: selectedHospital?.name || null,
      financialAidStatus: patientFormAid,
      financialAidAmount: patientFormAidAmt ? parseFloat(patientFormAidAmt) : null,
      caseStatus: (editingPatient?.status || 'Under Treatment') as Patient['status'],
    };

    try {
      if (editingPatient) {
        await updatePatientRecord(editingPatient.id, apiToken, payload);
      } else {
        await createPatientRecord(apiToken, payload);
      }
      toast.success(editingPatient ? 'Patient Record Updated' : 'New Patient Record Added', `Record for ${patientFormName} saved.`);
      setShowPatientModal(false);
      refetchPatientRecords();
    } catch (err) {
      toast.error('Save Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!apiToken) return;
    if (window.confirm('Are you sure you want to remove this patient record?')) {
      try {
        await deletePatientRecord(id, apiToken);
        toast.info('Patient Record Removed');
        refetchPatientRecords();
      } catch (err) {
        toast.error('Delete Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
      }
    }
  };

  // ==========================================
  // VOLUNTEER UTILITIES
  // ==========================================
  const [showRejectVolunteerModal, setShowRejectVolunteerModal] = useState<string | null>(null);
  const [rejectVolunteerReason, setRejectVolunteerReason] = useState('');

  const handleApproveVolunteer = async (id: string) => {
    if (!apiToken) return;
    try {
      await approveVolunteer(id, apiToken);
      toast.success('Volunteer Approved', 'Volunteer granted active status.');
      refetchVolunteers();
    } catch (err) {
      toast.error('Approval Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleRejectVolunteer = (id: string) => {
    setShowRejectVolunteerModal(id);
  };

  const handleConfirmRejectVolunteer = async () => {
    if (!rejectVolunteerReason.trim() || !apiToken || !showRejectVolunteerModal) return;
    try {
      await rejectVolunteer(showRejectVolunteerModal, apiToken, rejectVolunteerReason);
      setShowRejectVolunteerModal(null);
      setRejectVolunteerReason('');
      toast.info('Volunteer Declined');
      refetchVolunteers();
    } catch (err) {
      toast.error('Rejection Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ==========================================
  // CAMPAIGN UTILITIES
  // ==========================================
  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle || !newCampaignDate || !newCampaignLocation || !apiToken) return;

    // The form collects date/time as one free-text field (e.g. "Sat, 15 Aug
    // 2026 • 9:00 AM") -- Event stores them separately, so split on the
    // bullet the placeholder itself suggests, falling back to date-only.
    const [datePart, timePart] = newCampaignDate.includes('•')
      ? newCampaignDate.split('•').map(s => s.trim())
      : [newCampaignDate.trim(), ''];

    try {
      await createEvent(apiToken, {
        title: newCampaignTitle,
        type: newCampaignType,
        date: datePart,
        time: timePart,
        location: newCampaignLocation,
        description: 'Community campaign scheduled via the Campaigns Scheduler.',
        category: newCampaignType,
        capacity: parseInt(newCampaignCapacity, 10) || 0,
      });
      await refetchEvents();
      setNewCampaignTitle('');
      setNewCampaignDate('');
      setNewCampaignLocation('');
      setNewCampaignCapacity('');
      setCampaignSuccessToast(true);
      setTimeout(() => setCampaignSuccessToast(false), 3000);
      toast.success('Campaign Scheduled', `Campaign "${newCampaignTitle}" is now live.`);
    } catch (err) {
      toast.error('Scheduling Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // Decline hospital modal state
  const [showAdminDeclineModal, setShowAdminDeclineModal] = useState<string | null>(null);
  const [adminDeclineReason, setAdminDeclineReason] = useState('');

  // ==========================================
  // HOSPITAL UTILITIES
  // ==========================================
  const handleRecommendHospital = async (id: string) => {
    if (!apiToken) return;
    try {
      await recommendPartnerRequest(id, apiToken);
      toast.success('Hospital Recommended', 'Hospital application forwarded to Super Admin board.');
      refetchPartnerRequests();
    } catch (err) {
      toast.error('Recommend Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleDeclineHospitalByAdmin = async (id: string) => {
    if (!adminDeclineReason.trim() || !apiToken) return;
    try {
      await rejectPartnerRequest(id, apiToken, adminDeclineReason);
      setShowAdminDeclineModal(null);
      setAdminDeclineReason('');
      toast.warning('Hospital Declined', 'Application marked as declined.');
      refetchPartnerRequests();
    } catch (err) {
      toast.error('Decline Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleVerifyDocument = (id: string) => {
    // No backend field exists for this (see hospitalRequests mapping above)
    // -- purely a local UI gate before the real "Recommend" call is allowed.
    setLocallyVerifiedHospitalIds(prev => new Set(prev).add(id));
    toast.success('Documents Verified', 'Hospital accreditation documents verified.');
  };

  // ==========================================
  // CAMPAIGN REQUESTS UTILITIES
  // ==========================================
  const handleScheduleFromRequest = async (req: CampaignRequest) => {
    if (!apiToken) return;
    try {
      await createEvent(apiToken, {
        title: `${req.organizationName} Screening Camp`,
        type: 'Screening Camp',
        date: req.requestedDate,
        time: 'TBD',
        location: req.location,
        description: `Community campaign requested by ${req.organizationName} (${req.contactPerson}).`,
        category: 'Community Camps',
        capacity: req.expectedAttendees,
      });
      await scheduleCampaignRequest(req.id, apiToken);
      await Promise.all([refetchEvents(), refetchCampaignRequests()]);
      toast.success('Request Converted to Camp', `"${req.organizationName}" is now a scheduled camp.`);
    } catch (err) {
      toast.error('Conversion Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ==========================================
  // FEEDBACK UTILITIES
  // ==========================================
  const handleSendFeedbackReply = async (id: string) => {
    if (!feedbackReplyText.trim() || !apiToken) return;
    try {
      await respondToVolunteerFeedback(id, apiToken, feedbackReplyText);
      toast.success('Feedback Replied', 'Response sent to volunteer.');
      setFeedbackReplyText('');
      setActiveFeedbackId(null);
      refetchFeedback();
    } catch (err) {
      toast.error('Reply Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ==========================================
  // ANNOUNCEMENTS & BLOG UTILITIES
  // ==========================================
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMessage || !apiToken) return;

    try {
      const result = await broadcastNotification(apiToken, 'Volunteers', announcementTitle, announcementMessage);
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setNotifSuccessToast(true);
      setTimeout(() => setNotifSuccessToast(false), 3000);
      toast.success('Broadcast Alert Sent', `Notification dispatched to ${result.recipientCount} volunteer(s).`);
    } catch (err) {
      toast.error('Broadcast Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogSummary.trim() || !apiToken) return;

    try {
      const created = await createBlog(apiToken, {
        title: newBlogTitle,
        summary: newBlogSummary,
        content: newBlogSummary + '\n\nFull guidance and clinical information available on Cancer Aware Bharat medical portal.',
        category: newBlogCategory,
        author: newBlogAuthor || 'Dwarka Admin Node',
        role: 'Regional Medical Lead',
        date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        tags: [newBlogCategory, 'Health', 'Awareness'],
      });
      await refetchBlogs();
      setNewBlogTitle('');
      setNewBlogSummary('');
      toast.success('Blog Article Published', `"${created.title}" is now live on Portal News.`);
    } catch (err) {
      toast.error('Publish Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!apiToken || !window.confirm('Are you sure you want to remove this published article?')) return;
    try {
      await deleteBlog(id, apiToken);
      await refetchBlogs();
      toast.info('Blog Article Removed');
    } catch (err) {
      toast.error('Delete Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleExportPatientsCSV = () => {
    if (patients.length === 0) {
      toast.info('No Patients', 'There are no patient records to export.');
      return;
    }
    const headers = ['Patient Code', 'Full Name', 'Age', 'Gender', 'Primary Diagnosis', 'Clinic Partner', 'Financial Aid Status', 'Aid Amount'];
    const rows = patients.map(p => [
      p.recordId,
      csvCell(p.name),
      p.age,
      p.gender,
      csvCell(p.diagnosis),
      csvCell(p.hospitalName),
      p.financialAidStatus,
      p.financialAidAmount || 0
    ]);
    downloadCsv(headers, rows, 'Cancer_Aware_Bharat_Patients');
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
    downloadCsv(headers, rows, 'Cancer_Aware_Bharat_Volunteers');
    toast.success('Export Complete', 'Volunteers CSV downloaded successfully.');
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
    downloadCsv(headers, rows, 'Cancer_Aware_Bharat_Donations_Ledger');
    toast.success('Export Complete', 'Donations ledger CSV downloaded successfully.');
  };

  // ==========================================
  // FILTERS FOR TABLES
  // ==========================================
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (!p) return false;
      const sTerm = (searchTerm || '').toLowerCase();
      const matchesSearch = (p.name || '').toLowerCase().includes(sTerm) || (p.diagnosis || '').toLowerCase().includes(sTerm);
      const matchesFilter = patientFilter === 'All' || p.financialAidStatus === patientFilter || p.status === patientFilter;
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, patientFilter]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      if (!v) return false;
      const sTerm = (searchTerm || '').toLowerCase();
      const matchesSearch = (v.name || '').toLowerCase().includes(sTerm) || (v.domain || '').toLowerCase().includes(sTerm);
      const matchesFilter = volunteerFilter === 'All' || v.status === volunteerFilter;
      return matchesSearch && matchesFilter;
    });
  }, [volunteers, searchTerm, volunteerFilter]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      if (!e) return false;
      const sTerm = (searchTerm || '').toLowerCase();
      const matchSearch =
        (e.enquiryId || '').toLowerCase().includes(sTerm) ||
        (e.patientName || '').toLowerCase().includes(sTerm) ||
        (e.city || '').toLowerCase().includes(sTerm) ||
        (e.reason || '').toLowerCase().includes(sTerm);
      const matchFilter =
        enquiryFilter === 'All' ||
        (enquiryFilter === 'Approved by Admin' && (e.status === 'Approved by Admin' || e.status === 'Pending Hospital Assignment')) ||
        e.status === enquiryFilter;
      return matchSearch && matchFilter;
    });
  }, [enquiries, searchTerm, enquiryFilter]);

  // Sidebar navigation options
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'enquiries', label: 'Patient Enquiries', icon: Stethoscope, badge: pendingAdminCount },
    { id: 'patients', label: 'Patients Manager', icon: Heart },
    { id: 'volunteers', label: 'Volunteers Manager', icon: Users },
    { id: 'campaigns', label: 'Campaigns Scheduler', icon: Calendar },
    { id: 'hospitals', label: 'Hospital Tie-ups', icon: Building2 },
    { id: 'requests', label: 'Campaign Requests', icon: FileCheck },
    { id: 'donations', label: 'Donations Audit', icon: DollarSign },
    { id: 'blogs', label: 'Blog & Event News', icon: BookOpen },
    { id: 'feedback', label: 'Volunteer Feedback', icon: MessageSquare },
    { id: 'settings', label: 'Admin Settings', icon: Settings },
  ];

  const unreadAdminNotifCount = useMemo(() => adminNotifications.filter(n => !n.read).length, [adminNotifications]);

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
        bgClass="bg-[#004349]"
        brandIcon={Shield}
        brandIconWrapperClass="bg-white/10 backdrop-blur-md border border-white/20"
        brandLabel="CAB Admin Portal"
        activeAccentBorderClass="border-secondary-container"
        badgeClass="bg-secondary-container text-[#004349]"
      />

      {/* =====================================================
          MAIN DASHBOARD WORKSPACE
      ===================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9ff]">
        {/* Workspace Top Header bar */}
        <header className="bg-white border-b border-outline-variant/30 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer focus:outline-none"
              title="Toggle Menu"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 lg:hidden" />
              <Terminal className="w-5 h-5 hidden lg:block" />
            </button>
            <h2 className="font-headline-lg text-base sm:text-lg font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick connection state badge */}
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> dwarka-node-sync
            </span>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAdminNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadAdminNotifCount}
                </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
              AD
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
              title="Secure Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Panel Workspace container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

          {/* =====================================================
              TAB: DASHBOARD OVERVIEW
          ===================================================== */}
          {activeTab === 'dashboard' && (
            <OverviewTab
              summaryKpis={summaryKpis}
              kpiMetrics={kpiMetrics}
              setActiveTab={setActiveTab}
            />
          )}

          {/* =====================================================
              TAB: PATIENT ENQUIRIES (STEP 2: ADMIN REVIEW)
          ===================================================== */}
          {activeTab === 'enquiries' && (
            <EnquiriesTab
              pendingAdminCount={pendingAdminCount}
              enquiries={enquiries}
              filteredEnquiries={filteredEnquiries}
              enquiryFilter={enquiryFilter}
              setEnquiryFilter={setEnquiryFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleExportEnquiriesCSV={handleExportEnquiriesCSV}
              setShowApproveEnquiryModal={setShowApproveEnquiryModal}
              setApproveRemarks={setApproveRemarks}
              setShowRejectEnquiryModal={setShowRejectEnquiryModal}
              setRejectReasonText={setRejectReasonText}
              setTimelineEnquiry={setTimelineEnquiry}
            />
          )}

          {/* =====================================================
              TAB: PATIENTS MANAGER
          ===================================================== */}
          {activeTab === 'patients' && (
            <PatientsTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              patientFilter={patientFilter}
              setPatientFilter={setPatientFilter}
              filteredPatients={filteredPatients}
              handleExportPatientsCSV={handleExportPatientsCSV}
              handleOpenPatientForm={handleOpenPatientForm}
              handleDeletePatient={handleDeletePatient}
            />
          )}

          {/* =====================================================
              TAB: VOLUNTEERS MANAGER
          ===================================================== */}
          {activeTab === 'volunteers' && (
            <VolunteersTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              volunteerFilter={volunteerFilter}
              setVolunteerFilter={setVolunteerFilter}
              filteredVolunteers={filteredVolunteers}
              handleExportVolunteersCSV={handleExportVolunteersCSV}
              handleApproveVolunteer={handleApproveVolunteer}
              handleRejectVolunteer={handleRejectVolunteer}
            />
          )}

          {/* =====================================================
              TAB: CAMPAIGNS SCHEDULER
          ===================================================== */}
          {activeTab === 'campaigns' && (
            <CampaignsTab
              campaignSuccessToast={campaignSuccessToast}
              handleAddCampaign={handleAddCampaign}
              newCampaignTitle={newCampaignTitle}
              setNewCampaignTitle={setNewCampaignTitle}
              newCampaignType={newCampaignType}
              setNewCampaignType={setNewCampaignType}
              newCampaignDate={newCampaignDate}
              setNewCampaignDate={setNewCampaignDate}
              newCampaignLocation={newCampaignLocation}
              setNewCampaignLocation={setNewCampaignLocation}
              newCampaignCapacity={newCampaignCapacity}
              setNewCampaignCapacity={setNewCampaignCapacity}
              events={events}
            />
          )}

          {/* =====================================================
              TAB: HOSPITAL TIE-UPS
          ===================================================== */}
          {activeTab === 'hospitals' && (
            <HospitalsTab
              hospitalRequests={hospitalRequests}
              handleVerifyDocument={handleVerifyDocument}
              handleRecommendHospital={handleRecommendHospital}
              setShowAdminDeclineModal={setShowAdminDeclineModal}
            />
          )}

          {/* =====================================================
              TAB: CAMPAIGN REQUESTS
          ===================================================== */}
          {activeTab === 'requests' && (
            <RequestsTab
              campaignRequests={campaignRequests}
              handleScheduleFromRequest={handleScheduleFromRequest}
            />
          )}

          {/* =====================================================
              TAB: DONATIONS AUDIT
          ===================================================== */}
          {activeTab === 'donations' && (
            <DonationsTab
              donationsReceived={summaryKpis.donationsReceived}
              donations={donations}
              handleExportDonationsCSV={handleExportDonationsCSV}
              onEmailReceipt={async (donationId) => {
                if (!apiToken) return;
                try {
                  await sendDonationReceipt(donationId, apiToken);
                  toast.success('Receipt Sent', 'Donation receipt marked as sent.');
                  refetchDonations();
                } catch (err) {
                  toast.error('Send Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
                }
              }}
            />
          )}

          {/* =====================================================
              TAB: BLOGS & EVENTS NEWS
          ===================================================== */}
          {activeTab === 'blogs' && (
            <AdminBlogsTab
              newBlogCategory={newBlogCategory}
              setNewBlogCategory={setNewBlogCategory}
              newBlogTitle={newBlogTitle}
              setNewBlogTitle={setNewBlogTitle}
              newBlogSummary={newBlogSummary}
              setNewBlogSummary={setNewBlogSummary}
              newBlogAuthor={newBlogAuthor}
              setNewBlogAuthor={setNewBlogAuthor}
              handlePublishBlog={handlePublishBlog}
              blogs={blogs}
              handleDeleteBlog={handleDeleteBlog}
            />
          )}

          {/* =====================================================
              TAB: VOLUNTEER FEEDBACK
          ===================================================== */}
          {activeTab === 'feedback' && (
            <FeedbackTab
              feedbacks={feedbacks}
              activeFeedbackId={activeFeedbackId}
              setActiveFeedbackId={setActiveFeedbackId}
              feedbackReplyText={feedbackReplyText}
              setFeedbackReplyText={setFeedbackReplyText}
              handleSendFeedbackReply={handleSendFeedbackReply}
            />
          )}

          {/* =====================================================
              TAB: NOTIFICATION CENTER
          ===================================================== */}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notifSuccessToast={notifSuccessToast}
              handleSendAnnouncement={handleSendAnnouncement}
              announcementTitle={announcementTitle}
              setAnnouncementTitle={setAnnouncementTitle}
              announcementMessage={announcementMessage}
              setAnnouncementMessage={setAnnouncementMessage}
              adminNotifications={adminNotifications}
            />
          )}

          {/* =====================================================
              TAB: ADMIN SETTINGS
          ===================================================== */}
          {activeTab === 'settings' && (
            <SettingsTab
              passwordSuccess={passwordSuccess}
              profileName={profileName}
              setProfileName={setProfileName}
              profileEmail={profileEmail}
              setProfileEmail={setProfileEmail}
              onSubmit={e => {
                e.preventDefault();
                localStorage.setItem('aware_bharat_admin_profile', JSON.stringify({ profileName, profileEmail }));
                setPasswordSuccess(true);
                setTimeout(() => setPasswordSuccess(false), 3000);
                toast.success('Settings Saved', 'Administrative preferences updated successfully.');
              }}
            />
          )}

        </div>
      </main>

      {/* =====================================================
          MODAL: ADD / EDIT PATIENT RECORD
      ===================================================== */}
      {showPatientModal && (
        <PatientModal
          editingPatient={editingPatient}
          onClose={() => setShowPatientModal(false)}
          patientFormName={patientFormName}
          setPatientFormName={setPatientFormName}
          patientFormAge={patientFormAge}
          setPatientFormAge={setPatientFormAge}
          patientFormGender={patientFormGender}
          setPatientFormGender={setPatientFormGender}
          patientFormDiagnosis={patientFormDiagnosis}
          setPatientFormDiagnosis={setPatientFormDiagnosis}
          patientFormHospitalId={patientFormHospitalId}
          setPatientFormHospitalId={setPatientFormHospitalId}
          hospitalOptions={partnerHospitalDirectory}
          patientFormAid={patientFormAid}
          setPatientFormAid={setPatientFormAid}
          patientFormAidAmt={patientFormAidAmt}
          setPatientFormAidAmt={setPatientFormAidAmt}
          onSubmit={handleSavePatient}
        />
      )}

      {/* Admin Approve Enquiry Modal */}
      {showApproveEnquiryModal && (
        <ApproveEnquiryModal
          enquiry={showApproveEnquiryModal}
          onClose={() => setShowApproveEnquiryModal(null)}
          approveRemarks={approveRemarks}
          setApproveRemarks={setApproveRemarks}
          onApprove={async () => {
            if (!apiToken) return;
            try {
              await adminApproveEnquiry(showApproveEnquiryModal.id, apiToken, approveRemarks || undefined);
              toast.success('Enquiry Approved', `Patient ${showApproveEnquiryModal.patientName} forwarded to Super Admin board.`);
              setShowApproveEnquiryModal(null);
              setApproveRemarks('');
              refetchEnquiries();
            } catch (err) {
              toast.error('Approval Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
            }
          }}
        />
      )}

      {/* Admin Reject Enquiry Modal */}
      {showRejectEnquiryModal && (
        <RejectEnquiryModal
          enquiry={showRejectEnquiryModal}
          onClose={() => setShowRejectEnquiryModal(null)}
          rejectReasonText={rejectReasonText}
          setRejectReasonText={setRejectReasonText}
          onReject={async () => {
            if (!rejectReasonText.trim() || !apiToken) return;
            try {
              await adminRejectEnquiry(showRejectEnquiryModal.id, apiToken, rejectReasonText);
              toast.warning('Enquiry Rejected', `Patient ${showRejectEnquiryModal.patientName} enquiry declined.`);
              setShowRejectEnquiryModal(null);
              setRejectReasonText('');
              refetchEnquiries();
            } catch (err) {
              toast.error('Rejection Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
            }
          }}
        />
      )}

      {/* Decline Hospital Application Modal */}
      {showAdminDeclineModal && (
        <DeclineApplicationModal
          onClose={() => { setShowAdminDeclineModal(null); setAdminDeclineReason(''); }}
          adminDeclineReason={adminDeclineReason}
          setAdminDeclineReason={setAdminDeclineReason}
          onDecline={() => handleDeclineHospitalByAdmin(showAdminDeclineModal)}
        />
      )}

      {/* Reject Volunteer Modal */}
      {showRejectVolunteerModal && (
        <RejectVolunteerModal
          onClose={() => { setShowRejectVolunteerModal(null); setRejectVolunteerReason(''); }}
          rejectReason={rejectVolunteerReason}
          setRejectReason={setRejectVolunteerReason}
          onReject={handleConfirmRejectVolunteer}
        />
      )}

      {/* Enquiry Timeline Modal */}
      <EnquiryTimelineModal
        enquiry={timelineEnquiry}
        isOpen={!!timelineEnquiry}
        onClose={() => setTimelineEnquiry(null)}
        apiToken={apiToken}
      />

    </div>
  );
}
