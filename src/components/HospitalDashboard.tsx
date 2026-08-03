import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Building2, Users, UserCheck, Calendar, FileText, Stethoscope,
  DollarSign, Bell, TrendingUp, Terminal, CheckCircle2,
  HelpCircle, Settings, LogOut, Activity, Globe, Menu
} from 'lucide-react';
import { useApiEnquiries, useApiNotifications, useHospitalDoctors, useNgoReferrals, useMyPatientRecords, useMyHospitalReports } from '../api/hooks';
import { hospitalAcceptEnquiry, hospitalDeclineEnquiry, completeEnquiryTreatment, addMyHospitalDoctor, updateMyHospitalDoctorAvailability, acceptMyNgoReferral, declineMyNgoReferral, updateMyPatientRecord, verifyMyPatientCost, uploadMyHospitalReport, downloadMyHospitalReport, ApiError, getHospitalSession } from '../api/client';
import EnquiryTimelineModal from './EnquiryTimelineModal';
import { PatientEnquiry } from '../types';
import { useToast } from './common/Toast';
import StatusBadge from './common/StatusBadge';
import DashboardSidebar, { SidebarFooterButton } from './common/DashboardSidebar';
import { useSidebarState } from '../hooks/useSidebarState';

import {
  INITIAL_HOSPITAL_KPI,
  INITIAL_HOSPITAL_CAMPAIGNS,
  INITIAL_HOSPITAL_NOTIFICATIONS,
  INITIAL_HOSPITAL_PROFILE, INITIAL_HOSPITAL_ACTIVITY_LOG,
  type AssignedPatient, type NgoReferral, type HospitalCampaign,
  type HospitalReport, type HospitalDoctor, type FinancialAidVerification,
  type HospitalNotification, type HospitalActivityLog
} from '../hospitalDashboardData';

import OverviewTab from './hospital-dashboard/OverviewTab';
import AssignedEnquiriesTab from './hospital-dashboard/AssignedEnquiriesTab';
import PatientsTab from './hospital-dashboard/PatientsTab';
import ReferralsTab from './hospital-dashboard/ReferralsTab';
import CampaignsTab from './hospital-dashboard/CampaignsTab';
import ReportsTab from './hospital-dashboard/ReportsTab';
import DoctorsTab from './hospital-dashboard/DoctorsTab';
import FinancialTab from './hospital-dashboard/FinancialTab';
import NotificationsTab from './hospital-dashboard/NotificationsTab';
import AnalyticsTab from './hospital-dashboard/AnalyticsTab';
import ProfileTab from './hospital-dashboard/ProfileTab';
import SupportTab from './hospital-dashboard/SupportTab';
import SettingsTab from './hospital-dashboard/SettingsTab';
import {
  PatientProfileModal, ReferralModal, AddDoctorModal, UploadReportModal,
  VerifyCostModal, AcceptPatientModal, DeclinePatientModal, CompleteTreatmentModal,
} from './hospital-dashboard/Modals';

// Dynamic profile loader matching logged-in hospital session or registration record
const getInitialHospitalProfile = () => {
  const storedSession = localStorage.getItem('aware_bharat_logged_in_hospital');
  let sessionData: any = null;
  if (storedSession) {
    try { sessionData = JSON.parse(storedSession); } catch (e) {}
  }

  const storedRequests = localStorage.getItem('aware_bharat_hospital_requests');
  let requestList: any[] = [];
  if (storedRequests) {
    try { requestList = JSON.parse(storedRequests); } catch (e) {}
  }

  let matchedApp: any = null;
  if (sessionData && sessionData.email) {
    matchedApp = requestList.find(
      (h: any) =>
        (h.contactEmail && h.contactEmail.toLowerCase() === sessionData.email.toLowerCase()) ||
        (h.email && h.email.toLowerCase() === sessionData.email.toLowerCase()) ||
        (h.generatedCredentials && h.generatedCredentials.email && h.generatedCredentials.email.toLowerCase() === sessionData.email.toLowerCase())
    );
  }

  if (!matchedApp && sessionData && sessionData.name) {
    matchedApp = requestList.find(
      (h: any) => (h.name || h.hospitalName || '').toLowerCase() === sessionData.name.toLowerCase()
    );
  }

  if (matchedApp) {
    const name = matchedApp.hospitalName || matchedApp.name || sessionData.name || 'Partner Hospital';
    const city = matchedApp.city || sessionData.city || 'New Delhi';
    const state = matchedApp.state || 'Delhi';
    const email = matchedApp.contactEmail || matchedApp.email || sessionData.email || 'hospital@awarebharat.org';
    const phone = matchedApp.contactPhone || matchedApp.phone || '+91 98000 00000';
    const licenseNo = matchedApp.licenseNo || matchedApp.accreditationNumber || 'REG-MH-2026-4421';
    const bedCount = parseInt(matchedApp.bedCount) || 150;
    const nabhAccredited = matchedApp.nabhAccredited ?? true;
    const specialties = matchedApp.specialties && matchedApp.specialties.length > 0
      ? matchedApp.specialties
      : INITIAL_HOSPITAL_PROFILE.departments;

    return {
      name,
      shortName: name.split(' ')[0] + ' Hospital',
      licenseNo,
      nabhNo: nabhAccredited ? 'NABH-HOSP-2026-0891' : 'STANDARD-REG-2026',
      accreditationStatus: nabhAccredited ? 'NABH Accredited Partner Oncology Center' : 'CAB Registered Hospital Node',
      address: matchedApp.address || `${city}, ${state}`,
      city,
      state,
      phone,
      emergencyPhone: matchedApp.emergencyPhone || phone,
      email,
      website: `www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
      bedCount,
      oncologyBeds: Math.round(bedCount * 0.4),
      icuBeds: Math.round(bedCount * 0.15),
      workingHours: '24x7 Emergency Services • OPD: 08:30 AM - 05:00 PM',
      departments: specialties,
      facilities: matchedApp.facilities || INITIAL_HOSPITAL_PROFILE.facilities
    };
  }

  if (sessionData && sessionData.name) {
    return {
      ...INITIAL_HOSPITAL_PROFILE,
      name: sessionData.name,
      shortName: sessionData.name.split(' ')[0] + ' Hospital',
      city: sessionData.city || INITIAL_HOSPITAL_PROFILE.city,
      email: sessionData.email || INITIAL_HOSPITAL_PROFILE.email
    };
  }

  return INITIAL_HOSPITAL_PROFILE;
};

// Check if email belongs to static preapproved demo accounts
const isPreApprovedDemoAccount = (email: string) => {
  const demoEmails = [
    'rgci@awarebharat.org',
    'admin@maxhealthcare.com',
    'info@fortishospitals.com',
    'proton@apollohospitals.com'
  ];
  return demoEmails.includes((email || '').toLowerCase());
};

// Dynamic data loader: loads demo data ONLY for pre-approved accounts, and EMPTY [] data for newly registered hospitals
const getInitialHospitalData = (profileEmail: string) => {
  if (!profileEmail) {
    return {
      campaigns: [], notifications: [], activityLogs: []
    };
  }

  const storageKey = `aware_bharat_hospital_data_${profileEmail.toLowerCase()}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }

  // Pre-approved accounts keep initial demo data
  if (isPreApprovedDemoAccount(profileEmail)) {
    return {
      campaigns: INITIAL_HOSPITAL_CAMPAIGNS,
      notifications: INITIAL_HOSPITAL_NOTIFICATIONS,
      activityLogs: INITIAL_HOSPITAL_ACTIVITY_LOG,
    };
  }

  // Newly registered hospital starts completely EMPTY — only registration details
  return {
    campaigns: [],
    notifications: [
      {
        id: 'NOTIF-INIT-1',
        title: 'Partnership Registration Received',
        message: 'Your application details have been loaded. Add your oncology doctors and medical staff to manage clinical intake.',
        type: 'announcement',
        timestamp: 'Just now',
        read: false
      }
    ],
    activityLogs: [
      {
        id: 'LOG-INIT-1',
        timestamp: new Date().toLocaleString(),
        action: 'Application Registered & Portal Initialized',
        user: profileEmail,
        module: 'Registration'
      }
    ]
  };
};

export default function HospitalDashboard({ onPageChange, onLogout }: { onPageChange?: (page: string) => void; onLogout: () => void }) {
  const toast = useToast();
  const navigate = useNavigate();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, toggleSidebar } = useSidebarState();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [profile, setProfile] = useState(() => getInitialHospitalProfile());

  // React State for tables - initialized from hospital-specific data store
  const [campaigns, setCampaigns] = useState<HospitalCampaign[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).campaigns);
  const [notifications, setNotifications] = useState<HospitalNotification[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).notifications);
  const [activityLogs, setActivityLogs] = useState<HospitalActivityLog[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).activityLogs);

  // Sync profile & data on mount or session change
  useEffect(() => {
    const fresh = getInitialHospitalProfile();
    setProfile(fresh);
    setEditProfileAddress(fresh.address);
    setEditProfilePhone(fresh.phone);
    setEditProfileEmergency(fresh.emergencyPhone);
    setEditProfileWebsite(fresh.website);

    const data = getInitialHospitalData(fresh.email);
    setCampaigns(data.campaigns || []);
    setNotifications(data.notifications || []);
    setActivityLogs(data.activityLogs || []);
  }, []);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileAddress, setEditProfileAddress] = useState(profile.address);
  const [editProfilePhone, setEditProfilePhone] = useState(profile.phone);
  const [editProfileEmergency, setEditProfileEmergency] = useState(profile.emergencyPhone);
  const [editProfileWebsite, setEditProfileWebsite] = useState(profile.website);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      address: editProfileAddress,
      phone: editProfilePhone,
      emergencyPhone: editProfileEmergency,
      website: editProfileWebsite
    };
    setProfile(updated);
    setIsEditingProfile(false);
    showToast('Hospital profile details saved.');
    addLog('Updated hospital profile metadata', 'Hospital Profile');

    const storedRequests = localStorage.getItem('aware_bharat_hospital_requests');
    if (storedRequests) {
      try {
        const list = JSON.parse(storedRequests);
        const updatedList = list.map((h: any) => {
          if ((h.contactEmail && h.contactEmail.toLowerCase() === profile.email.toLowerCase()) ||
              (h.hospitalName && h.hospitalName.toLowerCase() === profile.name.toLowerCase()) ||
              (h.name && h.name.toLowerCase() === profile.name.toLowerCase())) {
            return { ...h, address: editProfileAddress, contactPhone: editProfilePhone, emergencyPhone: editProfileEmergency };
          }
          return h;
        });
        localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(updatedList));
      } catch (err) {}
    }
  };

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [selectedPatientModal, setSelectedPatientModal] = useState<AssignedPatient | null>(null);
  const [editPatientStatus, setEditPatientStatus] = useState<AssignedPatient['treatmentStatus']>('Under Review');
  const [editPatientCancerStage, setEditPatientCancerStage] = useState('');
  const [editPatientDoctorId, setEditPatientDoctorId] = useState('');
  const [editPatientAdmissionDate, setEditPatientAdmissionDate] = useState('');
  const [editPatientRemarks, setEditPatientRemarks] = useState('');
  const [editPatientEstimatedCost, setEditPatientEstimatedCost] = useState('');
  const [selectedReferralModal, setSelectedReferralModal] = useState<NgoReferral | null>(null);
  const [declineReasonText, setDeclineReasonText] = useState('');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showVerifyCostModal, setShowVerifyCostModal] = useState<FinancialAidVerification | null>(null);
  const [verifiedCostInput, setVerifiedCostInput] = useState('');
  const [showSupportTicketModal, setShowSupportTicketModal] = useState(false);

  // Form states (Add Doctor)
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('Surgical Oncology');
  const [docQual, setDocQual] = useState('');
  const [docExp, setDocExp] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docEmail, setDocEmail] = useState('');

  // Form states (Upload Report)
  const [reportPatientId, setReportPatientId] = useState('');
  const [reportType, setReportType] = useState<'Prescription' | 'Lab Test' | 'Biopsy' | 'CT/MRI Scan' | 'Discharge Summary'>('Prescription');
  const [reportDoctorId, setReportDoctorId] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);

  // Form states (Support Ticket)
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Patient Referral Question');
  const [ticketDetails, setTicketDetails] = useState('');

  // Get active hospital session info
  const hospitalSession = useMemo(() => {
    const stored = localStorage.getItem('aware_bharat_logged_in_hospital');
    return stored ? JSON.parse(stored) : { name: profile.name, email: profile.email, city: profile.city };
  }, [profile]);

  // Real-time Patient Enquiries & Notifications from the backend API.
  // GET /enquiries already scopes results to this hospital's own JWT identity,
  // so we only need to narrow down to the stages relevant post-assignment.
  const apiToken = useMemo(() => getHospitalSession()?.accessToken || null, []);
  const { enquiries, refetch: refetchEnquiries } = useApiEnquiries(apiToken);
  const { notifications: hospitalNotifications } = useApiNotifications(apiToken);
  const { doctors: apiDoctors, refetch: refetchDoctors } = useHospitalDoctors(apiToken);
  const doctors: HospitalDoctor[] = useMemo(() => apiDoctors.map(d => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    qualification: d.qualification,
    experienceYears: d.experienceYears,
    phone: d.phone,
    email: d.email,
    availability: d.availability,
    assignedPatientsCount: d.assignedPatientsCount,
  })), [apiDoctors]);

  const { referrals: apiReferrals, refetch: refetchReferrals } = useNgoReferrals(apiToken);
  const referrals: NgoReferral[] = useMemo(() => apiReferrals.map(r => ({
    id: r.id,
    patientName: r.patientName,
    age: r.age,
    gender: r.gender as NgoReferral['gender'],
    referralDate: r.referralDate,
    priority: r.priority,
    cancerType: r.cancerType,
    recommendedDepartment: r.recommendedDepartment,
    referredByNgoAgent: r.referredByNgoAgent,
    status: r.status,
    declineReason: r.declineReason || undefined,
  })), [apiReferrals]);

  const { patientRecords: apiPatientRecords, refetch: refetchPatientRecords } = useMyPatientRecords(apiToken);
  const patients: AssignedPatient[] = useMemo(() => apiPatientRecords.map(r => ({
    id: r.id,
    ngoRefId: r.ngoReferralId || '',
    name: r.name,
    age: r.age,
    gender: r.gender as AssignedPatient['gender'],
    diagnosis: r.diagnosis,
    cancerStage: r.cancerStage || '',
    treatmentStatus: r.treatmentStatus,
    assignedDoctor: r.assignedDoctorName || 'Unassigned',
    admissionDate: r.admissionDate || '',
    city: '',
    phone: '',
    reportsCount: r.reportsCount,
    prescriptionUploaded: r.prescriptionUploaded,
    remarks: r.remarks,
    estimatedCost: r.estimatedCost,
  })), [apiPatientRecords]);

  const { reports: apiReports, refetch: refetchReports } = useMyHospitalReports(apiToken);
  const reports: HospitalReport[] = useMemo(() => apiReports.map(r => ({
    id: r.id,
    patientId: r.patientRecordId,
    patientName: r.patientName,
    reportType: r.reportType,
    uploadDate: new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    uploadedByDoctor: r.uploadedByDoctorName || 'Unspecified',
    fileSize: r.fileSize,
    fileName: r.fileName,
  })), [apiReports]);

  // A patient only shows up here once the hospital has set an estimated
  // cost (via the profile modal); admin's separate financial_aid_status
  // (Disbursed/Rejected) overlays the hospital's own verification once
  // Admin has acted on it, closing the loop between the two workflows.
  const financialVerifications: FinancialAidVerification[] = useMemo(() => apiPatientRecords
    .filter(r => r.estimatedCost != null)
    .map(r => ({
      id: r.id,
      patientName: r.name,
      ngoCaseId: r.recordId,
      requestDate: new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      estimatedCost: r.estimatedCost as number,
      verifiedAmount: r.financialAidStatus === 'Disbursed' ? (r.financialAidAmount ?? r.verifiedCost ?? 0) : (r.verifiedCost ?? 0),
      status: r.financialAidStatus === 'Disbursed' ? 'Aid Disbursed'
        : r.financialAidStatus === 'Rejected' ? 'Rejected'
        : r.costVerificationStatus === 'Cost Verified' ? 'Cost Verified'
        : 'Pending Verification',
      department: doctors.find(d => d.id === r.assignedDoctorId)?.specialty || 'Not Assigned',
      notes: r.remarks,
    })), [apiPatientRecords, doctors]);

  // Compute dynamic KPI metrics
  const kpiMetrics = useMemo(() => {
    return {
      totalReferredPatients: referrals.length + patients.length,
      patientsUnderTreatment: patients.filter(p => p.treatmentStatus === 'Under Treatment').length,
      completedTreatments: patients.filter(p => p.treatmentStatus === 'Completed').length,
      upcomingAwarenessCamps: campaigns.filter(c => c.status === 'Upcoming').length,
      assignedDoctorsCount: doctors.length,
      pendingMedicalReports: reports.length,
      financialAidRequestsCount: financialVerifications.filter(f => f.status === 'Pending Verification').length,
      partnershipStatus: profile.accreditationStatus.includes('NABH') ? 'Active Partner' : 'Under Review',
    };
  }, [patients, referrals, campaigns, doctors, reports, financialVerifications, profile]);

  const assignedEnquiriesForThisHospital = useMemo(() => {
    return enquiries.filter(e =>
      e.status === 'Assigned to Hospital' ||
      e.status === 'Accepted by Hospital' ||
      e.status === 'Declined by Hospital' ||
      e.status === 'Appointment Confirmed' ||
      e.status === 'Completed'
    );
  }, [enquiries]);

  const pendingAssignedEnquiriesCount = useMemo(() => {
    return assignedEnquiriesForThisHospital.filter(e => e.status === 'Assigned to Hospital').length;
  }, [assignedEnquiriesForThisHospital]);

  // Hospital Accept / Decline modal states
  const [acceptingEnquiry, setAcceptingEnquiry] = useState<PatientEnquiry | null>(null);
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptTime, setAcceptTime] = useState('10:30 AM');
  const [acceptDoctor, setAcceptDoctor] = useState('Dr. Siddharth Roy (Surgical Oncology)');
  const [acceptRemarks, setAcceptRemarks] = useState('');

  const [decliningEnquiry, setDecliningEnquiry] = useState<PatientEnquiry | null>(null);
  const [hospitalDeclineReasonText, setHospitalDeclineReasonText] = useState('');
  const [completingEnquiry, setCompletingEnquiry] = useState<PatientEnquiry | null>(null);
  const [completeRemarksText, setCompleteRemarksText] = useState('');
  const [timelineEnquiry, setTimelineEnquiry] = useState<PatientEnquiry | null>(null);
  const [hospitalEnquiryTabFilter, setHospitalEnquiryTabFilter] = useState('All');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const addLog = (action: string, moduleName: string) => {
    const newLog: HospitalActivityLog = {
      id: 'LOG-H' + (activityLogs.length + 1),
      timestamp: new Date().toLocaleString(),
      action,
      user: hospitalSession.email || 'Hospital Coordinator',
      module: moduleName
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // ---- Patient Management Handlers ----
  const handleOpenPatientModal = (patient: AssignedPatient) => {
    setSelectedPatientModal(patient);
    setEditPatientStatus(patient.treatmentStatus);
    setEditPatientCancerStage(patient.cancerStage);
    setEditPatientDoctorId(doctors.find(d => d.name === patient.assignedDoctor)?.id || '');
    setEditPatientAdmissionDate(patient.admissionDate);
    setEditPatientRemarks(patient.remarks);
    setEditPatientEstimatedCost(patient.estimatedCost != null ? String(patient.estimatedCost) : '');
  };

  const handleSavePatientProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientModal || !apiToken) return;
    try {
      await updateMyPatientRecord(selectedPatientModal.id, apiToken, {
        treatmentStatus: editPatientStatus,
        cancerStage: editPatientCancerStage || null,
        assignedDoctorId: editPatientDoctorId || null,
        admissionDate: editPatientAdmissionDate || null,
        remarks: editPatientRemarks,
        estimatedCost: editPatientEstimatedCost ? parseFloat(editPatientEstimatedCost) : null,
      });
      showToast('Patient clinical profile updated.');
      addLog(`Updated clinical profile for ${selectedPatientModal.name}`, 'Patient Management');
      setSelectedPatientModal(null);
      refetchPatientRecords();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Referral Handlers ----
  const handleAcceptReferral = async (refId: string) => {
    if (!apiToken) return;
    try {
      await acceptMyNgoReferral(refId, apiToken);
      showToast('NGO referral accepted. Assigned to clinical intake.');
      addLog(`Accepted referral ${refId}`, 'Referrals');
      setSelectedReferralModal(null);
      refetchReferrals();
      refetchPatientRecords();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleDeclineReferral = async (refId: string) => {
    if (!declineReasonText.trim() || !apiToken) return;
    try {
      await declineMyNgoReferral(refId, declineReasonText, apiToken);
      showToast('Referral declined with feedback to NGO admin.');
      addLog(`Declined referral ${refId}`, 'Referrals');
      setSelectedReferralModal(null);
      setDeclineReasonText('');
      refetchReferrals();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Doctor Management Handlers ----
  const handleToggleDoctorAvailability = async (docId: string) => {
    if (!apiToken) return;
    const current = doctors.find(d => d.id === docId);
    if (!current) return;
    const nextState = current.availability === 'Available' ? 'In Surgery' : current.availability === 'In Surgery' ? 'On Leave' : 'Available';
    try {
      await updateMyHospitalDoctorAvailability(docId, nextState, apiToken);
      showToast(`${current.name} availability set to ${nextState}`);
      refetchDoctors();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docQual || !docPhone || !docEmail || !apiToken) return;
    try {
      await addMyHospitalDoctor({
        name: docName,
        specialty: docSpecialty,
        qualification: docQual,
        experienceYears: parseInt(docExp) || 0,
        phone: docPhone,
        email: docEmail,
        availability: 'Available',
      }, apiToken);
      setShowAddDoctorModal(false);
      showToast(`Dr. ${docName} added to hospital directory.`);
      addLog(`Added doctor ${docName}`, 'Doctor Management');
      setDocName(''); setDocQual(''); setDocExp(''); setDocPhone(''); setDocEmail('');
      refetchDoctors();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Report Handlers ----
  const handleUploadReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFile || !reportPatientId || !apiToken) return;
    const targetPatient = patients.find(p => p.id === reportPatientId);
    try {
      await uploadMyHospitalReport(reportFile, reportPatientId, reportType, reportDoctorId || null, apiToken);
      setShowUploadReportModal(false);
      showToast(`Medical report "${reportFile.name}" uploaded successfully.`);
      addLog(`Uploaded ${reportType} for ${targetPatient?.name}`, 'Medical Reports');
      setReportFile(null);
      refetchReports();
      refetchPatientRecords();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleDownloadReport = async (reportId: string, fileName: string) => {
    if (!apiToken) return;
    try {
      await downloadMyHospitalReport(reportId, apiToken, fileName);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Financial Verification Handler ----
  const handleVerifyCostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVerifyCostModal || !verifiedCostInput || !apiToken) return;
    const amt = parseInt(verifiedCostInput);
    try {
      await verifyMyPatientCost(showVerifyCostModal.id, amt, apiToken);
      setShowVerifyCostModal(null);
      showToast(`Treatment cost of ₹${amt.toLocaleString()} verified and sent to NGO.`);
      addLog(`Verified cost for ${showVerifyCostModal.patientName}`, 'Financial Aid');
      setVerifiedCostInput('');
      refetchPatientRecords();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  // ---- Sidebar Item Taxonomy ----
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'assigned-enquiries', label: 'Assigned Patients (CAB)', icon: UserCheck, badge: pendingAssignedEnquiriesCount },
    { id: 'patients', label: 'Patient Management', icon: Users, badge: patients.filter(p => p.treatmentStatus === 'Under Treatment').length },
    { id: 'referrals', label: 'Referrals', icon: UserCheck, badge: referrals.filter(r => r.status === 'Pending Action').length },
    { id: 'campaigns', label: 'Awareness Campaigns', icon: Calendar, badge: campaigns.filter(c => c.status === 'Upcoming').length },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'financial', label: 'Financial Aid Verification', icon: DollarSign, badge: financialVerifications.filter(f => f.status === 'Pending Verification').length },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: hospitalNotifications.filter(n => !n.read).length },
    { id: 'analytics', label: 'Reports & Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Hospital Profile', icon: Building2 },
    { id: 'support', label: 'Support Center', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.ngoRefId.toLowerCase().includes(searchTerm.toLowerCase()) || p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = patientStatusFilter === 'All' || p.treatmentStatus === patientStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">

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
        bgClass="bg-[#063b42]"
        brandIcon={Building2}
        brandIconWrapperClass="bg-primary/20 border border-slate-400/30 text-slate-300"
        brandLabel={
          <>
            <span className="block">Partner Hospital</span>
            <span className="text-[10px] text-slate-300 font-semibold tracking-wider uppercase block">CAB Clinical Network</span>
          </>
        }
        brandLabelClass="text-base"
        activeAccentBorderClass="border-slate-400"
        badgeClass="bg-slate-400 text-[#063b42]"
        navItemPaddingClass="p-2.5 text-[13px]"
        navIconSizeClass="w-4.5 h-4.5"
        navIconMarginClass="mr-3"
        footer={
          <>
            <SidebarFooterButton
              icon={Globe}
              label="Return to Main Website"
              onClick={() => navigate('/')}
              expanded={!sidebarCollapsed || mobileSidebarOpen}
            />
            <SidebarFooterButton
              icon={LogOut}
              label="Secure Logout"
              onClick={onLogout}
              expanded={!sidebarCollapsed || mobileSidebarOpen}
              colorClass="text-red-300 hover:text-red-100 hover:bg-red-950/30"
            />
          </>
        }
      />

      {/* ===== MAIN WORKSPACE ===== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f4f8f9]">

        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
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
            <h2 className="font-headline-lg text-base sm:text-lg font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> {profile.shortName} • Active Clinical Node
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-container to-[#063b42] flex items-center justify-center font-bold text-white text-xs shadow-md">
              HOSP
            </div>
          </div>
        </header>

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-[fadeInUp_0.3s_ease-out]">
            <CheckCircle2 className="w-4 h-4 text-slate-400" /> {toastMessage}
          </div>
        )}

        {/* Workspace Container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

          {/* =====================================================
              TAB 1: EXECUTIVE DASHBOARD OVERVIEW
          ===================================================== */}
          {activeTab === 'dashboard' && (
            <OverviewTab
              profile={profile}
              kpiMetrics={kpiMetrics}
              patients={patients}
              referrals={referrals}
              activityLogs={activityLogs}
              setActiveTab={setActiveTab}
              setSelectedReferralModal={setSelectedReferralModal}
            />
          )}

          {/* =====================================================
              TAB: ASSIGNED PATIENTS (STEPS 5 & 6: HOSPITAL ACCEPT / DECLINE)
          ===================================================== */}
          {activeTab === 'assigned-enquiries' && (
            <AssignedEnquiriesTab
              pendingAssignedEnquiriesCount={pendingAssignedEnquiriesCount}
              assignedEnquiriesForThisHospital={assignedEnquiriesForThisHospital}
              hospitalEnquiryTabFilter={hospitalEnquiryTabFilter}
              setHospitalEnquiryTabFilter={setHospitalEnquiryTabFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setAcceptingEnquiry={setAcceptingEnquiry}
              setAcceptDate={setAcceptDate}
              setAcceptTime={setAcceptTime}
              setAcceptDoctor={setAcceptDoctor}
              setAcceptRemarks={setAcceptRemarks}
              setDecliningEnquiry={setDecliningEnquiry}
              setHospitalDeclineReasonText={setHospitalDeclineReasonText}
              setCompletingEnquiry={setCompletingEnquiry}
              setCompleteRemarksText={setCompleteRemarksText}
              setTimelineEnquiry={setTimelineEnquiry}
            />
          )}

          {/* =====================================================
              TAB 2: PATIENT MANAGEMENT
          ===================================================== */}
          {activeTab === 'patients' && (
            <PatientsTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              patientStatusFilter={patientStatusFilter}
              setPatientStatusFilter={setPatientStatusFilter}
              filteredPatients={filteredPatients}
              hospitalName={profile.name}
              setSelectedPatientModal={handleOpenPatientModal}
            />
          )}

          {/* =====================================================
              TAB 3: REFERRAL MANAGEMENT
          ===================================================== */}
          {activeTab === 'referrals' && (
            <ReferralsTab
              referrals={referrals}
              setSelectedReferralModal={setSelectedReferralModal}
            />
          )}

          {/* =====================================================
              TAB 4: AWARENESS CAMPAIGNS
          ===================================================== */}
          {activeTab === 'campaigns' && (
            <CampaignsTab
              campaigns={campaigns}
              showToast={showToast}
            />
          )}

          {/* =====================================================
              TAB 5: MEDICAL REPORTS
          ===================================================== */}
          {activeTab === 'reports' && (
            <ReportsTab
              reports={reports}
              setShowUploadReportModal={setShowUploadReportModal}
              onDownload={handleDownloadReport}
            />
          )}

          {/* =====================================================
              TAB 6: DOCTORS DIRECTORY
          ===================================================== */}
          {activeTab === 'doctors' && (
            <DoctorsTab
              doctors={doctors}
              setShowAddDoctorModal={setShowAddDoctorModal}
              handleToggleDoctorAvailability={handleToggleDoctorAvailability}
              showToast={showToast}
            />
          )}

          {/* =====================================================
              TAB 7: FINANCIAL AID VERIFICATION
          ===================================================== */}
          {activeTab === 'financial' && (
            <FinancialTab
              financialVerifications={financialVerifications}
              setShowVerifyCostModal={setShowVerifyCostModal}
              setVerifiedCostInput={setVerifiedCostInput}
            />
          )}

          {/* =====================================================
              TAB 8: NOTIFICATIONS
          ===================================================== */}
          {activeTab === 'notifications' && (
            <NotificationsTab
              hospitalNotifications={hospitalNotifications}
            />
          )}

          {/* =====================================================
              TAB 9: REPORTS & ANALYTICS
          ===================================================== */}
          {activeTab === 'analytics' && (
            <AnalyticsTab showToast={showToast} />
          )}

          {/* =====================================================
              TAB 10: HOSPITAL PROFILE
          ===================================================== */}
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              editProfileAddress={editProfileAddress}
              setEditProfileAddress={setEditProfileAddress}
              editProfilePhone={editProfilePhone}
              setEditProfilePhone={setEditProfilePhone}
              editProfileEmergency={editProfileEmergency}
              setEditProfileEmergency={setEditProfileEmergency}
              editProfileWebsite={editProfileWebsite}
              setEditProfileWebsite={setEditProfileWebsite}
              handleSaveProfile={handleSaveProfile}
            />
          )}

          {/* =====================================================
              TAB 11: SUPPORT CENTER
          ===================================================== */}
          {activeTab === 'support' && (
            <SupportTab
              ticketSubject={ticketSubject}
              setTicketSubject={setTicketSubject}
              ticketCategory={ticketCategory}
              setTicketCategory={setTicketCategory}
              ticketDetails={ticketDetails}
              setTicketDetails={setTicketDetails}
              showToast={showToast}
            />
          )}

          {/* =====================================================
              TAB 12: SETTINGS
          ===================================================== */}
          {activeTab === 'settings' && (
            <SettingsTab />
          )}

        </div>
      </main>

      {/* ===== MODAL: VIEW PATIENT PROFILE ===== */}
      {selectedPatientModal && (
        <PatientProfileModal
          patient={selectedPatientModal}
          doctors={doctors}
          onClose={() => setSelectedPatientModal(null)}
          editStatus={editPatientStatus}
          setEditStatus={setEditPatientStatus}
          editCancerStage={editPatientCancerStage}
          setEditCancerStage={setEditPatientCancerStage}
          editDoctorId={editPatientDoctorId}
          setEditDoctorId={setEditPatientDoctorId}
          editAdmissionDate={editPatientAdmissionDate}
          setEditAdmissionDate={setEditPatientAdmissionDate}
          editRemarks={editPatientRemarks}
          setEditRemarks={setEditPatientRemarks}
          editEstimatedCost={editPatientEstimatedCost}
          setEditEstimatedCost={setEditPatientEstimatedCost}
          onSubmit={handleSavePatientProfile}
        />
      )}

      {/* ===== MODAL: REFERRAL ACCEPT / DECLINE ===== */}
      {selectedReferralModal && (
        <ReferralModal
          referral={selectedReferralModal}
          onClose={() => setSelectedReferralModal(null)}
          declineReasonText={declineReasonText}
          setDeclineReasonText={setDeclineReasonText}
          onAccept={handleAcceptReferral}
          onDecline={handleDeclineReferral}
        />
      )}

      {/* ===== MODAL: ADD DOCTOR ===== */}
      {showAddDoctorModal && (
        <AddDoctorModal
          onClose={() => setShowAddDoctorModal(false)}
          docName={docName}
          setDocName={setDocName}
          docSpecialty={docSpecialty}
          setDocSpecialty={setDocSpecialty}
          docQual={docQual}
          setDocQual={setDocQual}
          docExp={docExp}
          setDocExp={setDocExp}
          docPhone={docPhone}
          setDocPhone={setDocPhone}
          docEmail={docEmail}
          setDocEmail={setDocEmail}
          onSubmit={handleAddDoctorSubmit}
        />
      )}

      {/* ===== MODAL: UPLOAD MEDICAL REPORT ===== */}
      {showUploadReportModal && (
        <UploadReportModal
          onClose={() => setShowUploadReportModal(false)}
          patients={patients}
          doctors={doctors}
          reportPatientId={reportPatientId}
          setReportPatientId={setReportPatientId}
          reportType={reportType}
          setReportType={setReportType}
          reportDoctorId={reportDoctorId}
          setReportDoctorId={setReportDoctorId}
          reportFile={reportFile}
          setReportFile={setReportFile}
          onSubmit={handleUploadReportSubmit}
        />
      )}

      {/* ===== MODAL: VERIFY COST ESTIMATE ===== */}
      {showVerifyCostModal && (
        <VerifyCostModal
          verification={showVerifyCostModal}
          onClose={() => setShowVerifyCostModal(null)}
          verifiedCostInput={verifiedCostInput}
          setVerifiedCostInput={setVerifiedCostInput}
          onSubmit={handleVerifyCostSubmit}
        />
      )}

      {/* Accept Patient Modal (Step 5 & 6: Auto Appointment Creation) */}
      {acceptingEnquiry && (
        <AcceptPatientModal
          enquiry={acceptingEnquiry}
          onClose={() => setAcceptingEnquiry(null)}
          acceptDate={acceptDate}
          setAcceptDate={setAcceptDate}
          acceptTime={acceptTime}
          setAcceptTime={setAcceptTime}
          acceptDoctor={acceptDoctor}
          setAcceptDoctor={setAcceptDoctor}
          acceptRemarks={acceptRemarks}
          setAcceptRemarks={setAcceptRemarks}
          onAccept={async () => {
            if (!apiToken) return;
            try {
              await hospitalAcceptEnquiry(
                acceptingEnquiry.id,
                apiToken,
                acceptDate,
                acceptTime,
                acceptDoctor,
                acceptRemarks || undefined
              );
              showToast(`Patient ${acceptingEnquiry.patientName} accepted & appointment created!`);
              setAcceptingEnquiry(null);
              refetchEnquiries();
            } catch (err) {
              showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
            }
          }}
        />
      )}

      {/* Decline Patient Modal */}
      {decliningEnquiry && (
        <DeclinePatientModal
          enquiry={decliningEnquiry}
          onClose={() => setDecliningEnquiry(null)}
          hospitalDeclineReasonText={hospitalDeclineReasonText}
          setHospitalDeclineReasonText={setHospitalDeclineReasonText}
          onDecline={async () => {
            if (!hospitalDeclineReasonText.trim() || !apiToken) return;
            try {
              await hospitalDeclineEnquiry(decliningEnquiry.id, apiToken, hospitalDeclineReasonText);
              showToast(`Patient ${decliningEnquiry.patientName} declined and returned to Super Admin.`);
              setDecliningEnquiry(null);
              refetchEnquiries();
            } catch (err) {
              showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
            }
          }}
        />
      )}

      {/* Mark Treatment Completed Modal */}
      {completingEnquiry && (
        <CompleteTreatmentModal
          enquiry={completingEnquiry}
          onClose={() => setCompletingEnquiry(null)}
          completeRemarksText={completeRemarksText}
          setCompleteRemarksText={setCompleteRemarksText}
          onComplete={async () => {
            if (!apiToken) return;
            try {
              await completeEnquiryTreatment(completingEnquiry.id, apiToken, completeRemarksText || undefined);
              showToast(`Patient ${completingEnquiry.patientName}'s case marked as completed.`);
              setCompletingEnquiry(null);
              refetchEnquiries();
            } catch (err) {
              showToast(err instanceof ApiError ? err.message : 'Unable to reach the server.');
            }
          }}
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
