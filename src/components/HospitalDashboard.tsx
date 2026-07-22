import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, Users, UserCheck, Calendar, Heart, Shield, ShieldCheck,
  FileText, Stethoscope, Clock, Check, X, Search, Filter, Plus, Edit2,
  Trash2, Download, Upload, AlertCircle, AlertTriangle, TrendingUp,
  DollarSign, MessageSquare, Bell, Settings, LogOut, Activity, Award,
  Terminal, CheckCircle2, Phone, Mail, MapPin, ChevronRight, ChevronDown,
  Eye, EyeOff, FileCheck, Share2, HelpCircle, UserPlus, RefreshCw,
  Sparkles, CheckSquare, Layers, Lock, ShieldAlert, Globe, Menu
} from 'lucide-react';

import {
  INITIAL_HOSPITAL_KPI, INITIAL_ASSIGNED_PATIENTS, INITIAL_NGO_REFERRALS,
  INITIAL_HOSPITAL_CAMPAIGNS, INITIAL_MEDICAL_REPORTS, INITIAL_HOSPITAL_DOCTORS,
  INITIAL_FINANCIAL_VERIFICATIONS, INITIAL_HOSPITAL_NOTIFICATIONS,
  INITIAL_HOSPITAL_PROFILE, INITIAL_HOSPITAL_ACTIVITY_LOG,
  MONTHLY_PATIENTS_TREATED, MONTHLY_REFERRAL_TREND, DEPARTMENT_DISTRIBUTION,
  type AssignedPatient, type NgoReferral, type HospitalCampaign,
  type HospitalReport, type HospitalDoctor, type FinancialAidVerification,
  type HospitalNotification, type HospitalActivityLog
} from '../hospitalDashboardData';

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
      patients: [], referrals: [], campaigns: [], reports: [], doctors: [], financialVerifications: [], notifications: [], activityLogs: []
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
      patients: INITIAL_ASSIGNED_PATIENTS,
      referrals: INITIAL_NGO_REFERRALS,
      campaigns: INITIAL_HOSPITAL_CAMPAIGNS,
      reports: INITIAL_MEDICAL_REPORTS,
      doctors: INITIAL_HOSPITAL_DOCTORS,
      financialVerifications: INITIAL_FINANCIAL_VERIFICATIONS,
      notifications: INITIAL_HOSPITAL_NOTIFICATIONS,
      activityLogs: INITIAL_HOSPITAL_ACTIVITY_LOG,
    };
  }

  // Newly registered hospital starts completely EMPTY — only registration details
  return {
    patients: [],
    referrals: [],
    campaigns: [],
    reports: [],
    doctors: [],
    financialVerifications: [],
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

export default function HospitalDashboard({ onPageChange, onLogout }: { onPageChange: (page: string) => void; onLogout: () => void }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [profile, setProfile] = useState(() => getInitialHospitalProfile());
  
  // React State for tables - initialized from hospital-specific data store
  const [patients, setPatients] = useState<AssignedPatient[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).patients);
  const [referrals, setReferrals] = useState<NgoReferral[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).referrals);
  const [campaigns, setCampaigns] = useState<HospitalCampaign[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).campaigns);
  const [reports, setReports] = useState<HospitalReport[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).reports);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).doctors);
  const [financialVerifications, setFinancialVerifications] = useState<FinancialAidVerification[]>(() => getInitialHospitalData(getInitialHospitalProfile().email).financialVerifications);
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
    setPatients(data.patients || []);
    setReferrals(data.referrals || []);
    setCampaigns(data.campaigns || []);
    setReports(data.reports || []);
    setDoctors(data.doctors || []);
    setFinancialVerifications(data.financialVerifications || []);
    setNotifications(data.notifications || []);
    setActivityLogs(data.activityLogs || []);
  }, []);

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
  const [reportPatientId, setReportPatientId] = useState(patients[0]?.id || '');
  const [reportType, setReportType] = useState<'Prescription' | 'Lab Test' | 'Biopsy' | 'CT/MRI Scan' | 'Discharge Summary'>('Prescription');
  const [reportDocName, setReportDocName] = useState('Dr. Siddharth Roy');
  const [reportFileName, setReportFileName] = useState('');

  // Form states (Support Ticket)
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Patient Referral Question');
  const [ticketDetails, setTicketDetails] = useState('');

  // Get active hospital session info
  const hospitalSession = useMemo(() => {
    const stored = localStorage.getItem('aware_bharat_logged_in_hospital');
    return stored ? JSON.parse(stored) : { name: profile.name, email: profile.email, city: profile.city };
  }, [profile]);

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
  const handleUpdatePatientStatus = (patientId: string, status: AssignedPatient['treatmentStatus']) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, treatmentStatus: status } : p));
    showToast(`Patient status updated to "${status}"`);
    addLog(`Patient ${patientId} status changed to ${status}`, 'Patient Management');
  };

  const handleAddPatientRemark = (patientId: string, remarks: string) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, remarks } : p));
    showToast('Doctor remarks saved successfully');
    addLog(`Updated remarks for patient ${patientId}`, 'Patient Management');
  };

  // ---- Referral Handlers ----
  const handleAcceptReferral = (refId: string) => {
    setReferrals(prev => prev.map(r => r.id === refId ? { ...r, status: 'Accepted' } : r));
    showToast('NGO referral accepted. Assigned to clinical intake.');
    addLog(`Accepted referral ${refId}`, 'Referrals');
    setSelectedReferralModal(null);
  };

  const handleDeclineReferral = (refId: string) => {
    if (!declineReasonText.trim()) return;
    setReferrals(prev => prev.map(r => r.id === refId ? { ...r, status: 'Declined', declineReason: declineReasonText } : r));
    showToast('Referral declined with feedback to NGO admin.');
    addLog(`Declined referral ${refId}`, 'Referrals');
    setSelectedReferralModal(null);
    setDeclineReasonText('');
  };

  // ---- Doctor Management Handlers ----
  const handleToggleDoctorAvailability = (docId: string) => {
    setDoctors(prev => prev.map(d => {
      if (d.id === docId) {
        const nextState = d.availability === 'Available' ? 'In Surgery' : d.availability === 'In Surgery' ? 'On Leave' : 'Available';
        showToast(`${d.name} availability set to ${nextState}`);
        return { ...d, availability: nextState };
      }
      return d;
    }));
  };

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docQual) return;
    const newDoc: HospitalDoctor = {
      id: 'DOC-00' + (doctors.length + 1),
      name: docName,
      specialty: docSpecialty,
      qualification: docQual,
      experienceYears: parseInt(docExp) || 5,
      phone: docPhone || '+91 98000 11122',
      email: docEmail || 'doctor@rgcirc.org',
      availability: 'Available',
      assignedPatientsCount: 0
    };
    setDoctors(prev => [...prev, newDoc]);
    setShowAddDoctorModal(false);
    showToast(`Dr. ${docName} added to hospital directory.`);
    addLog(`Added doctor ${docName}`, 'Doctor Management');
    setDocName(''); setDocQual(''); setDocExp(''); setDocPhone(''); setDocEmail('');
  };

  // ---- Report Handlers ----
  const handleUploadReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFileName) return;
    const targetPatient = patients.find(p => p.id === reportPatientId);
    const newReport: HospitalReport = {
      id: 'RPT-H0' + (reports.length + 1),
      patientId: reportPatientId,
      patientName: targetPatient?.name || 'Patient',
      reportType,
      uploadDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      uploadedByDoctor: reportDocName,
      fileSize: '1.5 MB',
      fileName: reportFileName
    };
    setReports(prev => [newReport, ...prev]);
    // increment patient report count
    setPatients(prev => prev.map(p => p.id === reportPatientId ? { ...p, reportsCount: p.reportsCount + 1, prescriptionUploaded: reportType === 'Prescription' ? true : p.prescriptionUploaded } : p));
    setShowUploadReportModal(false);
    showToast(`Medical report "${reportFileName}" uploaded successfully.`);
    addLog(`Uploaded ${reportType} for ${targetPatient?.name}`, 'Medical Reports');
    setReportFileName('');
  };

  // ---- Financial Verification Handler ----
  const handleVerifyCostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVerifyCostModal || !verifiedCostInput) return;
    const amt = parseInt(verifiedCostInput);
    setFinancialVerifications(prev => prev.map(f => f.id === showVerifyCostModal.id ? { ...f, verifiedAmount: amt, status: 'Cost Verified' } : f));
    setShowVerifyCostModal(null);
    showToast(`Treatment cost of ₹${amt.toLocaleString()} verified and sent to NGO.`);
    addLog(`Verified cost for ${showVerifyCostModal.patientName}`, 'Financial Aid');
    setVerifiedCostInput('');
  };

  // ---- Sidebar Item Taxonomy ----
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'patients', label: 'Patient Management', icon: Users, badge: patients.filter(p => p.treatmentStatus === 'Under Treatment').length },
    { id: 'referrals', label: 'Referrals', icon: UserCheck, badge: referrals.filter(r => r.status === 'Pending Action').length },
    { id: 'campaigns', label: 'Awareness Campaigns', icon: Calendar, badge: campaigns.filter(c => c.status === 'Upcoming').length },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'financial', label: 'Financial Aid Verification', icon: DollarSign, badge: financialVerifications.filter(f => f.status === 'Pending Verification').length },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.read).length },
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
      
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR NAVIGATION ===== */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#063b42] text-white transition-all duration-300 flex flex-col justify-between select-none ${
        mobileSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30 text-emerald-300">
                <Building2 className="w-5.5 h-5.5" />
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="overflow-hidden">
                  <span className="font-headline-lg text-base font-black text-white tracking-tight truncate block">
                    Partner Hospital
                  </span>
                  <span className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase block">
                    CAB Clinical Network
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto">
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
                  className={`w-full flex items-center justify-between rounded-xl p-2.5 text-[13px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/12 text-white shadow-sm border-l-4 border-emerald-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center">
                    <IconComp className={`w-4.5 h-4.5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3'}`} />
                    {(!sidebarCollapsed || mobileSidebarOpen) && <span>{item.label}</span>}
                  </div>
                  {(!sidebarCollapsed || mobileSidebarOpen) && item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400 text-[#063b42]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation & Logout */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => onPageChange('home')}
            className="w-full flex items-center rounded-xl p-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <Globe className={`w-4.5 h-4.5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3'}`} />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span>Return to Main Website</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center rounded-xl p-2.5 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/30 cursor-pointer transition-colors"
          >
            <LogOut className={`w-4.5 h-4.5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3'}`} />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span>Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN WORKSPACE ===== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f4f8f9]">

        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
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
            <h2 className="font-headline-lg text-base sm:text-lg font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {profile.shortName} • Active Clinical Node
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-[#063b42] flex items-center justify-center font-bold text-white text-xs shadow-md">
              HOSP
            </div>
          </div>
        </header>

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-[fadeInUp_0.3s_ease-out]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
          </div>
        )}

        {/* Workspace Container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

          {/* =====================================================
              TAB 1: EXECUTIVE DASHBOARD OVERVIEW
          ===================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              
              {/* Partner Welcome Banner */}
              <div className="bg-gradient-to-r from-[#063b42] via-[#0d5c63] to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-xl">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold border border-white/10">
                    Hospital Partner Console • {profile.city}
                  </span>
                  <h1 className="font-display-lg text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Collaborating with Cancer Aware Bharat Trust to provide standardized oncology treatment, diagnostic referrals, and financial aid verification.
                  </p>
                </div>
                <div className="relative z-10 flex gap-2 shrink-0">
                  <button onClick={() => setActiveTab('patients')} className="px-4 py-2.5 bg-white text-[#063b42] rounded-xl text-xs font-bold hover:bg-slate-100 shadow-md cursor-pointer transition-all">
                    View Assigned Patients
                  </button>
                  <button onClick={() => setActiveTab('referrals')} className="px-4 py-2.5 bg-emerald-400 text-[#063b42] rounded-xl text-xs font-bold hover:bg-emerald-300 shadow-md cursor-pointer transition-all">
                    Pending Referrals ({referrals.filter(r => r.status === 'Pending Action').length})
                  </button>
                </div>
              </div>

              {/* 8 KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Referred Patients', val: kpiMetrics.totalReferredPatients, icon: Users, color: 'text-teal-700 bg-teal-50 border-teal-200' },
                  { label: 'Under Treatment', val: kpiMetrics.patientsUnderTreatment, icon: Stethoscope, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                  { label: 'Completed Treatments', val: kpiMetrics.completedTreatments, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { label: 'Awareness Camps', val: kpiMetrics.upcomingAwarenessCamps, icon: Calendar, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                  { label: 'Assigned Doctors', val: kpiMetrics.assignedDoctorsCount, icon: UserCheck, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { label: 'Pending Reports', val: kpiMetrics.pendingMedicalReports, icon: FileText, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { label: 'Aid Verifications', val: kpiMetrics.financialAidRequestsCount, icon: DollarSign, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
                  { label: 'Partnership Status', val: kpiMetrics.partnershipStatus, icon: ShieldCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${kpi.color}`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xl font-black text-slate-900 truncate">{kpi.val}</p>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">{kpi.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Middle Section: Treatment Trends & Referrals Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Chart Placeholder: Patient Treatment Progress */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-600" /> Monthly Treated Patients Trend
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">+18% Growth</span>
                  </div>
                  {patients.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-center space-y-1.5 text-slate-400">
                      <Activity className="w-8 h-8 text-teal-600/40" />
                      <p className="text-xs font-bold text-slate-700">No Patient Treatment History</p>
                      <p className="text-[11px] text-slate-500 max-w-xs">Monthly patient treatment progress will plot here automatically as patients receive care.</p>
                    </div>
                  ) : (
                    <div className="flex items-end justify-between gap-3 h-44 pt-4">
                      {MONTHLY_PATIENTS_TREATED.map((m, idx) => {
                        const heightPct = (m.count / 35) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              {m.count}
                            </span>
                            <div 
                              style={{ height: `${heightPct}%` }}
                              className="w-full bg-gradient-to-t from-[#063b42] to-teal-500 rounded-t-lg group-hover:from-teal-600 group-hover:to-teal-400 transition-all duration-300"
                            />
                            <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* NGO Pending Referrals Feed */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-600" /> Incoming NGO Referrals
                    </h3>
                    <button onClick={() => setActiveTab('referrals')} className="text-xs font-bold text-teal-700 hover:underline">View All</button>
                  </div>
                  {referrals.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1.5">
                      <UserCheck className="w-7 h-7 mx-auto text-teal-600/40" />
                      <p className="text-xs font-bold text-slate-700">No Pending Referrals</p>
                      <p className="text-[11px] text-slate-500">Incoming referrals from CAB Trust will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {referrals.slice(0, 3).map(ref => (
                        <div key={ref.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 text-xs">{ref.patientName}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                ref.priority === 'Critical' ? 'bg-red-100 text-red-700' : ref.priority === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                              }`}>{ref.priority}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{ref.cancerType} • {ref.recommendedDepartment}</p>
                          </div>
                          <button onClick={() => setSelectedReferralModal(ref)} className="px-3 py-1 bg-[#063b42] text-white rounded-lg text-[10px] font-bold hover:opacity-90 cursor-pointer">
                            Inspect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Activity Log Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" /> Recent Hospital Audit Trail
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Module</th>
                        <th className="p-3">Action Description</th>
                        <th className="p-3">Actor / Doctor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activityLogs.slice(0, 4).map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-500 font-mono">{log.timestamp}</td>
                          <td className="p-3 font-semibold text-slate-700">{log.module}</td>
                          <td className="p-3 text-slate-900 font-medium">{log.action}</td>
                          <td className="p-3 text-slate-600">{log.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =====================================================
              TAB 2: PATIENT MANAGEMENT
          ===================================================== */}
          {activeTab === 'patients' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search patient name, ID, diagnosis..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['All', 'Under Review', 'Under Treatment', 'Completed', 'Emergency'].map(s => (
                    <button key={s} onClick={() => setPatientStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${patientStatusFilter === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Patient Table or Empty State */}
              {filteredPatients.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No Patients Assigned Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Patient intake records assigned to <strong>{profile.name}</strong> by Cancer Aware Bharat caseworkers will appear here once approved.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                          <th className="p-4">Patient Name & ID</th>
                          <th className="p-4">Diagnosis & Stage</th>
                          <th className="p-4">Assigned Doctor</th>
                          <th className="p-4">Admission Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPatients.map(pat => (
                          <tr key={pat.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-900 text-sm">{pat.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{pat.ngoRefId} • {pat.age} yrs / {pat.gender}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-800">{pat.diagnosis}</p>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-0.5">{pat.cancerStage}</span>
                            </td>
                            <td className="p-4 font-medium text-slate-700">{pat.assignedDoctor}</td>
                            <td className="p-4 text-slate-500">{pat.admissionDate}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                pat.treatmentStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                pat.treatmentStatus === 'Under Treatment' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                pat.treatmentStatus === 'Emergency' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {pat.treatmentStatus}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => setSelectedPatientModal(pat)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-[10px] cursor-pointer">
                                Profile & Reports
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB 3: REFERRAL MANAGEMENT
          ===================================================== */}
          {activeTab === 'referrals' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-teal-50 border border-teal-200 text-teal-900 p-4 rounded-2xl text-xs flex items-start gap-3">
                <UserCheck className="w-5 h-5 shrink-0 text-teal-600 mt-0.5" />
                <div>
                  <p className="font-bold">NGO Patient Referral Channel</p>
                  <p className="text-teal-800/85 mt-0.5">Review patient referrals sent by Cancer Aware Bharat caseworkers. Accept referrals to assign clinical intake slots or decline with justification notes.</p>
                </div>
              </div>

              {referrals.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No Incoming NGO Referrals</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Pre-screened cancer patient referrals sent by regional CAB Trust coordinators will be listed here for clinical intake review.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                          <th className="p-4">Referral Code & Patient</th>
                          <th className="p-4">Referred By NGO Agent</th>
                          <th className="p-4">Priority Level</th>
                          <th className="p-4">Cancer Type</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {referrals.map(ref => (
                          <tr key={ref.id} className="hover:bg-slate-50/60">
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{ref.patientName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{ref.id} • {ref.age} / {ref.gender}</p>
                            </td>
                            <td className="p-4 text-slate-700 font-medium">{ref.referredByNgoAgent}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                ref.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                ref.priority === 'Urgent' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {ref.priority}
                              </span>
                            </td>
                            <td className="p-4 text-slate-800 font-medium">{ref.cancerType}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                ref.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                ref.status === 'Declined' ? 'bg-red-50 text-red-600 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {ref.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {ref.status === 'Pending Action' ? (
                                <button onClick={() => setSelectedReferralModal(ref)} className="px-3 py-1.5 bg-[#063b42] text-white rounded-lg text-[10px] font-bold hover:opacity-90 cursor-pointer">
                                  Accept / Decline
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Process Completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB 4: AWARENESS CAMPAIGNS
          ===================================================== */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-lg text-lg font-bold text-slate-900">Hospital Collaborative Awareness Drives</h3>
              </div>

              {campaigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No Active Awareness Drives</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Collaborative early detection drives and screening camps co-hosted with Cancer Aware Bharat Trust will be displayed here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaigns.map(camp => (
                    <div key={camp.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">{camp.category}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${camp.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{camp.status}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{camp.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-teal-600" /> {camp.date} • {camp.time}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-600" /> {camp.venue}</p>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Hospital Oncologists</p>
                          {camp.assignedDoctors.map((doc, idx) => (
                            <p key={idx} className="font-semibold text-slate-700 text-[11px]">• {doc}</p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Volunteers: <strong>{camp.volunteerCount}</strong></span>
                        <button onClick={() => showToast(`Registered hospital doctors for ${camp.title}`)} className="px-3 py-1.5 bg-[#063b42] text-white rounded-lg text-[10px] font-bold hover:opacity-90 cursor-pointer">
                          Register Doctors
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB 5: MEDICAL REPORTS
          ===================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
                <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Prescription & Lab Repository</h3>
                <button onClick={() => setShowUploadReportModal(true)} className="px-4 py-2 bg-[#063b42] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload New Medical Report
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No Medical Reports Uploaded</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click "Upload New Medical Report" above to attach prescriptions, biopsy reports, or lab results for patient records.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                          <th className="p-4">Report Name & File</th>
                          <th className="p-4">Patient Name</th>
                          <th className="p-4">Report Type</th>
                          <th className="p-4">Uploaded Date</th>
                          <th className="p-4">Doctor</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map(rpt => (
                          <tr key={rpt.id} className="hover:bg-slate-50/60">
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{rpt.fileName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{rpt.fileSize}</p>
                            </td>
                            <td className="p-4 font-semibold text-slate-800">{rpt.patientName}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">{rpt.reportType}</span>
                            </td>
                            <td className="p-4 text-slate-500">{rpt.uploadDate}</td>
                            <td className="p-4 font-medium text-slate-700">{rpt.uploadedByDoctor}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => showToast(`Downloaded ${rpt.fileName}`)} className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-[10px] cursor-pointer inline-flex items-center gap-1">
                                <Download className="w-3.5 h-3.5" /> Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB 6: DOCTORS DIRECTORY
          ===================================================== */}
          {activeTab === 'doctors' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
                <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Oncologists & Specialists Directory</h3>
                <button onClick={() => setShowAddDoctorModal(true)} className="px-4 py-2 bg-[#063b42] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <UserPlus className="w-4 h-4" /> Add Doctor
                </button>
              </div>

              {doctors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No Doctors Registered Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Register your hospital's oncologists, surgeons, and specialists to assign them to incoming patient referrals.
                  </p>
                  <button onClick={() => setShowAddDoctorModal(true)} className="px-4 py-2 bg-[#063b42] text-white rounded-xl text-xs font-bold hover:bg-[#084c55] cursor-pointer">
                    + Add First Doctor
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.map(doc => (
                    <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">{doc.specialty}</span>
                          <button onClick={() => handleToggleDoctorAvailability(doc.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border ${
                            doc.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            doc.availability === 'In Surgery' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {doc.availability}
                          </button>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{doc.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{doc.qualification}</p>
                        <p className="text-xs text-slate-500 mt-2 font-mono">Experience: {doc.experienceYears} years</p>
                        <p className="text-xs text-slate-500 font-mono">{doc.phone} • {doc.email}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span>Assigned Patients: <strong>{doc.assignedPatientsCount}</strong></span>
                        <button onClick={() => showToast(`Doctor ${doc.name} assigned to clinical schedule.`)} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200 cursor-pointer">
                          Manage Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB 7: FINANCIAL AID VERIFICATION
          ===================================================== */}
          {activeTab === 'financial' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 p-4 rounded-2xl text-xs flex items-start gap-3">
                <DollarSign className="w-5 h-5 shrink-0 text-cyan-600 mt-0.5" />
                <div>
                  <p className="font-bold">NGO Financial Assistance Verification Portal</p>
                  <p className="text-cyan-800/85 mt-0.5">Review treatment cost estimates submitted by NGO patients. Verify actual surgical/chemo costs and submit cost estimation reports for CAB Trust fund disbursement.</p>
                </div>
              </div>

              {financialVerifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto border border-cyan-200">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No Financial Verification Requests</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Subsidized treatment cost estimations requiring NGO grant verification will be listed here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                          <th className="p-4">Case ID & Patient</th>
                          <th className="p-4">Department</th>
                          <th className="p-4">NGO Estimated Cost</th>
                          <th className="p-4">Verified Amount</th>
                          <th className="p-4">Verification Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {financialVerifications.map(fa => (
                          <tr key={fa.id} className="hover:bg-slate-50/60">
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{fa.patientName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{fa.ngoCaseId} • {fa.requestDate}</p>
                            </td>
                            <td className="p-4 font-medium text-slate-700">{fa.department}</td>
                            <td className="p-4 font-bold text-slate-900">₹{fa.estimatedCost.toLocaleString()}</td>
                            <td className="p-4 font-bold text-emerald-700">₹{fa.verifiedAmount.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                fa.status === 'Aid Disbursed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                fa.status === 'Cost Verified' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {fa.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {fa.status === 'Pending Verification' ? (
                                <button onClick={() => { setShowVerifyCostModal(fa); setVerifiedCostInput(fa.estimatedCost.toString()); }} className="px-3 py-1.5 bg-[#063b42] text-white rounded-lg text-[10px] font-bold hover:opacity-90 cursor-pointer">
                                  Verify Cost
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">Verified</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB 8: NOTIFICATIONS
          ===================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
                <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Notification Feed</h3>
                <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-teal-700 font-bold hover:underline cursor-pointer">
                  Mark All as Read
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${notif.read ? 'bg-white border-slate-200/80' : 'bg-emerald-50/40 border-emerald-200'}`}>
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 9: REPORTS & ANALYTICS
          ===================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200/80">
                <div>
                  <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Clinical Analytics & Export</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Comprehensive analytics on NGO patients treated, referral conversion rates, and department distribution.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showToast('Generated PDF Clinical Performance Report')} className="px-3.5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                  <button onClick={() => showToast('Exported Excel Dataset (.xlsx)')} className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Export Excel
                  </button>
                </div>
              </div>

              {/* Department Distribution */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Department-wise NGO Patient Distribution</h4>
                <div className="space-y-3">
                  {DEPARTMENT_DISTRIBUTION.map((dept, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{dept.department}</span>
                        <span className="text-slate-900">{dept.count} Patients ({dept.percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div style={{ width: `${dept.percentage}%` }} className="h-full bg-gradient-to-r from-[#063b42] to-teal-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 10: HOSPITAL PROFILE
          ===================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xl shrink-0">
                      {profile.shortName}
                    </div>
                    <div>
                      <h3 className="font-headline-lg text-lg font-bold text-slate-900">{profile.name}</h3>
                      <p className="text-xs text-teal-700 font-semibold">{profile.accreditationStatus}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">NABH No: {profile.nabhNo} • Reg: {profile.licenseNo}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> {isEditingProfile ? 'Cancel Editing' : 'Edit Profile Details'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Official Address</label>
                        <input
                          type="text"
                          required
                          value={editProfileAddress}
                          onChange={e => setEditProfileAddress(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contact Phone</label>
                        <input
                          type="text"
                          required
                          value={editProfilePhone}
                          onChange={e => setEditProfilePhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Emergency Desk Phone</label>
                        <input
                          type="text"
                          required
                          value={editProfileEmergency}
                          onChange={e => setEditProfileEmergency(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Official Website</label>
                        <input
                          type="text"
                          value={editProfileWebsite}
                          onChange={e => setEditProfileWebsite(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#063b42] text-white font-bold rounded-xl text-xs hover:bg-[#084c55]"
                      >
                        Save Profile Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.address}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone & Email</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.phone} • {profile.email}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Desk</p>
                      <p className="font-bold text-red-600 mt-1">{profile.emergencyPhone}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">Clinical Infrastructure & Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.facilities.map((fac, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">{fac}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 11: SUPPORT CENTER
          ===================================================== */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-teal-600" /> Raise Support Ticket to NGO Board</h3>
                  <form onSubmit={e => { e.preventDefault(); showToast('Support ticket raised. Case reference: TKT-2026-904'); setTicketSubject(''); setTicketDetails(''); }} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ticket Subject</label>
                      <input type="text" required value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs" placeholder="e.g. Referral intake delay inquiry" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                      <select value={ticketCategory} onChange={e => setTicketCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs">
                        <option value="Patient Referral Question">Patient Referral Question</option>
                        <option value="Financial Aid Disbursement">Financial Aid Disbursement</option>
                        <option value="Awareness Camp Coordination">Awareness Camp Coordination</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description</label>
                      <textarea rows={3} value={ticketDetails} onChange={e => setTicketDetails(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs" placeholder="Provide full details..." />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90 cursor-pointer">
                      Submit Support Ticket
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Download className="w-4 h-4 text-teal-600" /> Download Partnership Guidelines & SOPs</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { title: 'CAB Hospital Partnership SOP 2026.pdf', size: '2.8 MB' },
                      { title: 'Patient Referral Standard Guidelines.pdf', size: '1.4 MB' },
                      { title: 'Financial Aid Verification Rate Card.pdf', size: '920 KB' },
                    ].map((file, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{file.title}</p>
                          <p className="text-[10px] text-slate-400">{file.size}</p>
                        </div>
                        <button onClick={() => showToast(`Downloaded ${file.title}`)} className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] hover:bg-slate-300 cursor-pointer">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 12: SETTINGS
          ===================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
                <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Portal Configuration</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-800">Email notification on new NGO patient referrals</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-800">Auto-acknowledge urgent financial aid verification requests</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ===== MODAL: VIEW PATIENT PROFILE ===== */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#063b42] text-white px-6 py-4 flex justify-between items-center">
              <span className="font-bold text-sm">Patient Clinical Profile — {selectedPatientModal.name}</span>
              <button onClick={() => setSelectedPatientModal(null)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p><strong>NGO Ref:</strong> {selectedPatientModal.ngoRefId}</p>
                <p><strong>Age / Gender:</strong> {selectedPatientModal.age} / {selectedPatientModal.gender}</p>
                <p><strong>Diagnosis:</strong> {selectedPatientModal.diagnosis}</p>
                <p><strong>Cancer Stage:</strong> {selectedPatientModal.cancerStage}</p>
                <p><strong>Assigned Doctor:</strong> {selectedPatientModal.assignedDoctor}</p>
                <p><strong>Current Status:</strong> {selectedPatientModal.treatmentStatus}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Update Patient Treatment Status</label>
                <select
                  value={selectedPatientModal.treatmentStatus}
                  onChange={e => handleUpdatePatientStatus(selectedPatientModal.id, e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Completed">Completed</option>
                  <option value="Referred">Referred</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Doctor Clinical Remarks</label>
                <textarea
                  rows={3}
                  value={selectedPatientModal.remarks}
                  onChange={e => handleAddPatientRemark(selectedPatientModal.id, e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button onClick={() => setSelectedPatientModal(null)} className="px-5 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: REFERRAL ACCEPT / DECLINE ===== */}
      {selectedReferralModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Evaluate NGO Patient Referral — {selectedReferralModal.patientName}</h3>
            <p className="text-slate-600">Diagnosis: <strong>{selectedReferralModal.cancerType}</strong> • Priority: <strong>{selectedReferralModal.priority}</strong></p>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">If Declining, Provide Reason Notes</label>
              <textarea rows={2} value={declineReasonText} onChange={e => setDeclineReasonText(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="e.g. Department at maximum bed capacity..." />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => handleDeclineReferral(selectedReferralModal.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 cursor-pointer">Decline Referral</button>
              <button onClick={() => handleAcceptReferral(selectedReferralModal.id)} className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 cursor-pointer">Accept Referral</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: ADD DOCTOR ===== */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Add Oncologist to Hospital Directory</h3>
            <form onSubmit={handleAddDoctorSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Doctor Full Name *</label>
                <input type="text" required value={docName} onChange={e => setDocName(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="Dr. Siddharth Roy" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Specialty</label>
                <input type="text" required value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="Surgical Oncology" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Qualification *</label>
                <input type="text" required value={docQual} onChange={e => setDocQual(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="MS, MCh AIIMS" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Experience (Years)</label>
                <input type="number" value={docExp} onChange={e => setDocExp(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="15" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddDoctorModal(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold">Save Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: UPLOAD MEDICAL REPORT ===== */}
      {showUploadReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Upload Patient Medical Document</h3>
            <form onSubmit={handleUploadReportSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Patient</label>
                <select value={reportPatientId} onChange={e => setReportPatientId(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.ngoRefId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Document Category</label>
                <select value={reportType} onChange={e => setReportType(e.target.value as any)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <option value="Prescription">Prescription</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Biopsy">Biopsy</option>
                  <option value="CT/MRI Scan">CT/MRI Scan</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Document File Name *</label>
                <input type="text" required value={reportFileName} onChange={e => setReportFileName(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="e.g. Biopsy_Report_SunitaDevi.pdf" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowUploadReportModal(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold">Upload Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: VERIFY COST ESTIMATE ===== */}
      {showVerifyCostModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Verify Financial Aid Treatment Cost</h3>
            <p className="text-slate-600">Patient: <strong>{showVerifyCostModal.patientName}</strong> • NGO Est: <strong>₹{showVerifyCostModal.estimatedCost.toLocaleString()}</strong></p>
            <form onSubmit={handleVerifyCostSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Hospital Verified Subsidized Treatment Cost (INR)</label>
                <input type="number" required value={verifiedCostInput} onChange={e => setVerifiedCostInput(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs" placeholder="150000" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowVerifyCostModal(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold">Submit Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
