import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, UserCheck, Building2, Calendar, FileText, Heart, ShieldAlert, Shield,
  BarChart3, Settings, LogOut, Bell, Search, Filter, Plus, Edit2, Trash2,
  Check, X, ThumbsUp, Send, Download, FileCheck, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, BookOpen, MessageSquare, AlertCircle, AlertTriangle,
  Award, RefreshCw, Terminal, CheckCircle2, User, Key, Menu, Stethoscope, Clock
} from 'lucide-react';
import { enquiryStore, useEnquiries, useNotifications } from '../enquiryStore';
import EnquiryTimelineModal from './EnquiryTimelineModal';
import { PatientEnquiry, BlogArticle } from '../types';
import { INITIAL_BLOGS } from '../data';
import { useToast } from './common/Toast';
import StatusBadge from './common/StatusBadge';

import {
  INITIAL_KPI_METRICS, INITIAL_PATIENTS, INITIAL_ADMIN_VOLUNTEERS,
  INITIAL_HOSPITAL_REQUESTS, INITIAL_CAMPAIGN_REQUESTS, INITIAL_ADMIN_DONATIONS,
  INITIAL_ADMIN_FEEDBACKS, type Patient, type AdminVolunteer, type PartnerHospital,
  type CampaignRequest, type AdminDonation, type AdminFeedback
} from '../adminDashboardData';

export default function AdminDashboard({ onPageChange, onLogout }: { onPageChange?: (page: string) => void; onLogout: () => void }) {
  const toast = useToast();
  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Real-time Patient Enquiries & Notifications from Enquiry Store
  const enquiries = useEnquiries();
  const adminNotifications = useNotifications('admin');
  const pendingAdminCount = useMemo(() => enquiries.filter(e => e.status === 'Pending Admin Review').length, [enquiries]);

  // Admin Enquiry Modals state
  const [showApproveEnquiryModal, setShowApproveEnquiryModal] = useState<PatientEnquiry | null>(null);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [showRejectEnquiryModal, setShowRejectEnquiryModal] = useState<PatientEnquiry | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [timelineEnquiry, setTimelineEnquiry] = useState<PatientEnquiry | null>(null);
  const [enquiryFilter, setEnquiryFilter] = useState('All');

  // React state for mock DB tables
  const [patients, setPatients] = useState<Patient[]>(() => {
    const stored = localStorage.getItem('aware_bharat_patients');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_PATIENTS;
  });
  const [volunteers, setVolunteers] = useState<AdminVolunteer[]>(() => {
    const stored = localStorage.getItem('aware_bharat_volunteers');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_ADMIN_VOLUNTEERS;
  });
  const [hospitalRequests, setHospitalRequests] = useState<PartnerHospital[]>(() => {
    const stored = localStorage.getItem('aware_bharat_hospital_requests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mapped: PartnerHospital[] = parsed.map((h: any) => ({
          id: h.id,
          name: h.name || h.hospitalName,
          city: h.city,
          status: h.status === 'Approved' ? 'Active Partner' : h.status === 'Recommended by Admin' || h.status === 'Recommended to Super Admin' ? 'Recommended to Super Admin' : 'Pending Tie-up',
          appliedDate: h.appliedDate || new Date().toLocaleDateString(),
          documentVerified: h.documentVerified ?? (h.documents ? h.documents.every((d: any) => d.verified) : true),
          contactEmail: h.contactEmail || h.email || 'info@hospital.org',
          contactPhone: h.contactPhone || h.phone || '+91 11 0000 0000',
        }));
        // Merge with initial requests
        INITIAL_HOSPITAL_REQUESTS.forEach(init => {
          if (!mapped.some(m => m.id === init.id)) {
            mapped.push(init);
          }
        });
        return mapped;
      } catch (e) {
        console.error('Failed to parse hospital requests', e);
      }
    }
    return INITIAL_HOSPITAL_REQUESTS;
  });
  const [campaignRequests, setCampaignRequests] = useState<CampaignRequest[]>(() => {
    const stored = localStorage.getItem('aware_bharat_campaign_requests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_CAMPAIGN_REQUESTS;
  });
  const [donations, setDonations] = useState<AdminDonation[]>(() => {
    const stored = localStorage.getItem('aware_bharat_donations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_ADMIN_DONATIONS;
  });
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>(() => {
    const stored = localStorage.getItem('aware_bharat_volunteer_feedback');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_ADMIN_FEEDBACKS;
  });
  const [blogs, setBlogs] = useState<BlogArticle[]>(() => {
    const stored = localStorage.getItem('aware_bharat_blogs');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_BLOGS;
  });
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
  const [patientFormHospital, setPatientFormHospital] = useState('Apex Oncology Institute');
  const [patientFormAid, setPatientFormAid] = useState<'Not Requested' | 'Pending Review' | 'Approved' | 'Disbursed' | 'Rejected'>('Not Requested');
  const [patientFormAidAmt, setPatientFormAidAmt] = useState('');

  // Form states (Add Campaign)
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignType, setNewCampaignType] = useState('Screening Camp');
  const [newCampaignDate, setNewCampaignDate] = useState('');
  const [newCampaignLocation, setNewCampaignLocation] = useState('');
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
      activeCampaigns: kpiMetrics.activeCampaigns,
      donationsReceived: donations.reduce((acc, curr) => acc + curr.amount, 650000),
      pendingHospitalTieups: hospitalRequests.filter(h => h.status === 'Pending Tie-up').length,
      financialAidRequests: patients.filter(p => p.financialAidStatus === 'Pending Review').length,
    };
  }, [patients, volunteers, hospitalRequests, donations, kpiMetrics.activeCampaigns]);

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
      setPatientFormHospital(patient.hospitalName);
      setPatientFormAid(patient.financialAidStatus);
      setPatientFormAidAmt(String(patient.financialAidAmount || ''));
    } else {
      setEditingPatient(null);
      setPatientFormName('');
      setPatientFormAge('');
      setPatientFormGender('Male');
      setPatientFormDiagnosis('');
      setPatientFormHospital('Apex Oncology Institute');
      setPatientFormAid('Not Requested');
      setPatientFormAidAmt('');
    }
    setShowPatientModal(true);
  };

  // Close open modals on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPatientModal(false);
        setShowApproveEnquiryModal(null);
        setShowRejectEnquiryModal(null);
        setShowAdminDeclineModal(null);
        setTimelineEnquiry(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportEnquiriesCSV = () => {
    if (enquiries.length === 0) {
      toast.info('No Enquiries', 'There are no enquiries to export.');
      return;
    }
    const headers = ['Enquiry ID', 'Reference Number', 'Patient Name', 'Age', 'Gender', 'Phone', 'City', 'Reason', 'Priority', 'Status', 'Date'];
    const rows = enquiries.map(e => [
      e.enquiryId,
      e.referenceNumber,
      `"${(e.patientName || '').replace(/"/g, '""')}"`,
      e.age,
      e.gender,
      e.phone,
      `"${(e.city || '').replace(/"/g, '""')}"`,
      `"${(e.reason || '').replace(/"/g, '""')}"`,
      e.priority,
      `"${(e.status || '').replace(/"/g, '""')}"`,
      e.date
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cancer_Aware_Bharat_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export Complete', 'Enquiries CSV downloaded successfully.');
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFormName || !patientFormAge || !patientFormDiagnosis) return;

    let updatedList: Patient[];
    if (editingPatient) {
      // Edit mode
      updatedList = patients.map(p => p.id === editingPatient.id ? {
        ...p,
        name: patientFormName,
        age: parseInt(patientFormAge),
        gender: patientFormGender,
        diagnosis: patientFormDiagnosis,
        hospitalName: patientFormHospital,
        financialAidStatus: patientFormAid,
        financialAidAmount: patientFormAidAmt ? parseFloat(patientFormAidAmt) : undefined
      } : p);
    } else {
      // Add mode
      const newPat: Patient = {
        id: 'PAT-' + String(patients.length + 1).padStart(3, '0'),
        name: patientFormName,
        age: parseInt(patientFormAge),
        gender: patientFormGender,
        diagnosis: patientFormDiagnosis,
        hospitalId: 'hosp-custom',
        hospitalName: patientFormHospital,
        financialAidStatus: patientFormAid,
        financialAidAmount: patientFormAidAmt ? parseFloat(patientFormAidAmt) : undefined,
        status: 'Under Treatment'
      };
      updatedList = [...patients, newPat];
    }

    setPatients(updatedList);
    localStorage.setItem('aware_bharat_patients', JSON.stringify(updatedList));
    toast.success(editingPatient ? 'Patient Record Updated' : 'New Patient Record Added', `Record for ${patientFormName} saved.`);
    setShowPatientModal(false);
  };

  const handleDeletePatient = (id: string) => {
    if (window.confirm('Are you sure you want to remove this patient record?')) {
      const updated = patients.filter(p => p.id !== id);
      setPatients(updated);
      localStorage.setItem('aware_bharat_patients', JSON.stringify(updated));
      toast.info('Patient Record Removed');
    }
  };

  // ==========================================
  // VOLUNTEER UTILITIES
  // ==========================================
  const handleApproveVolunteer = (id: string) => {
    setVolunteers(prev => {
      const updated = prev.map(v => v.id === id ? { ...v, status: 'Approved' as const } : v);
      localStorage.setItem('aware_bharat_volunteers', JSON.stringify(updated));
      return updated;
    });
    toast.success('Volunteer Approved', 'Volunteer granted active status.');
  };

  const handleRejectVolunteer = (id: string) => {
    setVolunteers(prev => {
      const updated = prev.filter(v => v.id !== id);
      localStorage.setItem('aware_bharat_volunteers', JSON.stringify(updated));
      return updated;
    });
    toast.info('Volunteer Declined');
  };

  // ==========================================
  // CAMPAIGN UTILITIES
  // ==========================================
  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle || !newCampaignDate || !newCampaignLocation) return;

    enquiryStore.addNotification({
      targetRole: 'volunteer',
      title: `New Campaign Scheduled: ${newCampaignTitle}`,
      message: `Operational screening drive scheduled at ${newCampaignLocation} on ${newCampaignDate}. Volunteers invited for participation.`,
    });

    setKpiMetrics(prev => ({
      ...prev,
      activeCampaigns: prev.activeCampaigns + 1,
      recentActivities: [
        { id: 'act-custom-' + Date.now(), text: `New Campaign "${newCampaignTitle}" scheduled`, time: 'Just now', type: 'campaign' },
        ...prev.recentActivities
      ]
    }));

    setNewCampaignTitle('');
    setNewCampaignDate('');
    setNewCampaignLocation('');
    setCampaignSuccessToast(true);
    setTimeout(() => setCampaignSuccessToast(false), 3000);
    toast.success('Campaign Scheduled', `Campaign "${newCampaignTitle}" broadcasted to volunteer network.`);
  };

  // Decline hospital modal state
  const [showAdminDeclineModal, setShowAdminDeclineModal] = useState<string | null>(null);
  const [adminDeclineReason, setAdminDeclineReason] = useState('');

  // ==========================================
  // HOSPITAL UTILITIES
  // ==========================================
  const handleRecommendHospital = (id: string) => {
    setHospitalRequests(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, status: 'Recommended to Super Admin' as const } : h);
      const stored = localStorage.getItem('aware_bharat_hospital_requests');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updatedList = list.map((item: any) => item.id === id ? {
            ...item,
            status: 'Recommended by Admin',
            recommendedBy: 'Dr. Ramesh Sharma (ADM-001)',
            recommendationNotes: 'Primary accreditation documents verified by Regional Admin. Recommended for Super Admin board clearance.'
          } : item);
          localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(updatedList));
        } catch (e) { console.error(e); }
      }
      return updated;
    });
    toast.success('Hospital Recommended', 'Hospital application forwarded to Super Admin board.');
  };

  const handleDeclineHospitalByAdmin = (id: string) => {
    if (!adminDeclineReason.trim()) return;
    setHospitalRequests(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, status: 'Declined by Admin' as const, declineReason: adminDeclineReason } : h);
      const stored = localStorage.getItem('aware_bharat_hospital_requests');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updatedList = list.map((item: any) => item.id === id ? {
            ...item,
            status: 'Declined by Admin',
            rejectionReason: `Declined by Regional Coordinator: ${adminDeclineReason}`
          } : item);
          localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(updatedList));
        } catch (e) { console.error(e); }
      }
      return updated;
    });
    setShowAdminDeclineModal(null);
    setAdminDeclineReason('');
    toast.warning('Hospital Declined', 'Application marked as declined.');
  };

  const handleVerifyDocument = (id: string) => {
    setHospitalRequests(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, documentVerified: true } : h);
      const stored = localStorage.getItem('aware_bharat_hospital_requests');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updatedList = list.map((item: any) => item.id === id ? { ...item, documentVerified: true } : item);
          localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(updatedList));
        } catch (e) { console.error(e); }
      }
      return updated;
    });
    toast.success('Documents Verified', 'Hospital accreditation documents verified.');
  };

  // ==========================================
  // CAMPAIGN REQUESTS UTILITIES
  // ==========================================
  const handleScheduleFromRequest = (req: CampaignRequest) => {
    setCampaignRequests(prev => {
      const updated = prev.map(c => c.id === req.id ? { ...c, status: 'Scheduled' as const } : c);
      localStorage.setItem('aware_bharat_campaign_requests', JSON.stringify(updated));
      return updated;
    });
    setNewCampaignTitle(req.organizationName + ' Screening Camp');
    setNewCampaignLocation(req.location);
    setActiveTab('campaigns');
    toast.info('Request Converted to Camp', 'Pre-filled campaign form in scheduler.');
  };

  // ==========================================
  // FEEDBACK UTILITIES
  // ==========================================
  const handleSendFeedbackReply = (id: string) => {
    if (!feedbackReplyText.trim()) return;
    setFeedbacks(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, status: 'Responded' as const, response: feedbackReplyText } : f);
      localStorage.setItem('aware_bharat_volunteer_feedback', JSON.stringify(updated));
      return updated;
    });
    toast.success('Feedback Replied', 'Response sent to volunteer.');
    setFeedbackReplyText('');
    setActiveFeedbackId(null);
  };

  // ==========================================
  // ANNOUNCEMENTS & BLOG UTILITIES
  // ==========================================
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMessage) return;

    enquiryStore.addNotification({
      targetRole: 'volunteer',
      title: announcementTitle,
      message: announcementMessage
    });

    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setNotifSuccessToast(true);
    setTimeout(() => setNotifSuccessToast(false), 3000);
    toast.success('Broadcast Alert Sent', 'Notification dispatched to volunteer network.');
  };

  const handlePublishBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogSummary.trim()) return;

    const newBlogItem: BlogArticle = {
      id: 'blog-' + Date.now(),
      title: newBlogTitle,
      summary: newBlogSummary,
      content: newBlogSummary + '\n\nFull guidance and clinical information available on Cancer Aware Bharat medical portal.',
      category: newBlogCategory,
      author: newBlogAuthor || 'Dwarka Admin Node',
      role: 'Regional Medical Lead',
      date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      tags: [newBlogCategory, 'Health', 'Awareness']
    };

    const updated = [newBlogItem, ...blogs];
    setBlogs(updated);
    localStorage.setItem('aware_bharat_blogs', JSON.stringify(updated));
    setNewBlogTitle('');
    setNewBlogSummary('');
    toast.success('Blog Article Published', `"${newBlogItem.title}" is now live on Portal News.`);
  };

  const handleDeleteBlog = (id: string) => {
    if (window.confirm('Are you sure you want to remove this published article?')) {
      const updated = blogs.filter(b => b.id !== id);
      setBlogs(updated);
      localStorage.setItem('aware_bharat_blogs', JSON.stringify(updated));
      toast.info('Blog Article Removed');
    }
  };

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
    link.setAttribute('download', `Cancer_Aware_Bharat_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
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
    link.setAttribute('download', `Cancer_Aware_Bharat_Volunteers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    link.setAttribute('download', `Cancer_Aware_Bharat_Donations_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    { id: 'notifications', label: 'Notification Center', icon: Bell },
    { id: 'settings', label: 'Admin Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR NAVIGATION
      ===================================================== */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#004349] text-white transition-all duration-300 flex flex-col justify-between select-none ${
        mobileSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div>
          {/* Sidebar Brand Logo */}
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Shield className="w-5 h-5 text-secondary-container" />
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="font-headline-lg text-lg font-black text-white tracking-tight truncate">
                  CAB Admin Portal
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

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 max-h-[calc(100vh-160px)] overflow-y-auto">
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
                  className={`w-full flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm border-l-4 border-secondary-container'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center">
                    <IconComp className={`w-5 h-5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3.5'}`} />
                    {(!sidebarCollapsed || mobileSidebarOpen) && <span>{item.label}</span>}
                  </div>
                  {(!sidebarCollapsed || mobileSidebarOpen) && (item as any).badge !== undefined && (item as any).badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-secondary-container text-[#004349]">
                      {(item as any).badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center rounded-xl p-3 text-sm font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/20 cursor-pointer"
          >
            <LogOut className={`w-5 h-5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3.5'}`} />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span>Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN DASHBOARD WORKSPACE
      ===================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9ff]">
        {/* Workspace Top Header bar */}
        <header className="bg-white border-b border-outline-variant/30 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer focus:outline-none"
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
            {/* Quick connection state badge */}
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> dwarka-node-sync
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Panel Workspace container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

          {/* =====================================================
              TAB: DASHBOARD OVERVIEW
          ===================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* KPI cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Patients Managed', value: summaryKpis.totalPatients, icon: Heart, color: 'text-primary bg-primary/10 border-primary/15' },
                  { label: 'Registered Volunteers', value: summaryKpis.totalVolunteers, icon: Users, color: 'text-secondary bg-secondary/10 border-secondary/15' },
                  { label: 'Campaigns Scheduled', value: summaryKpis.activeCampaigns, icon: Calendar, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                  { label: 'Donations Audited (INR)', value: `₹${summaryKpis.donationsReceived.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${kpi.color}`}>
                      <kpi.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{kpi.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Second row: Activity & Quick Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Chart Placeholder */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Active Intake Trend (Last 6 Months)
                  </h3>
                  <div className="flex items-end justify-between gap-4 h-48 pt-4">
                    {[
                      { month: 'Feb', val: 120, label: '120 Patients' },
                      { month: 'Mar', val: 150, label: '150 Patients' },
                      { month: 'Apr', val: 210, label: '210 Patients' },
                      { month: 'May', val: 190, label: '190 Patients' },
                      { month: 'Jun', val: 240, label: '240 Patients' },
                      { month: 'Jul', val: 310, label: '310 Patients' },
                    ].map((m, i) => {
                      const heightPercent = (m.val / 350) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {m.val}
                          </span>
                          <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                            <div
                              className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-container transition-all duration-700 group-hover:from-secondary group-hover:to-secondary/80"
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activities Panel */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Audit Logs / Recent Activity</h3>
                    <div className="space-y-3.5">
                      {kpiMetrics.recentActivities.map((act) => (
                        <div key={act.id} className="flex items-start space-x-3 text-xs leading-relaxed">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-slate-700 font-medium">{act.text}</p>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="w-full mt-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary hover:bg-slate-100 transition-colors"
                  >
                    View All Activity Logs
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* =====================================================
              TAB: PATIENT ENQUIRIES (STEP 2: ADMIN REVIEW)
          ===================================================== */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">{pendingAdminCount}</span>
                    <span className="text-xs text-slate-500 font-medium">Pending Admin Review</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">
                      {enquiries.filter(e => e.status === 'Approved by Admin' || e.status === 'Assigned to Hospital').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Approved by Admin</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">
                      {enquiries.filter(e => e.status === 'Appointment Confirmed').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Confirmed Appointments</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 block">
                      {enquiries.filter(e => e.status === 'Rejected by Admin' || e.status === 'Declined by Hospital').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Rejected / Declined</span>
                  </div>
                </div>
              </div>

              {/* Filter & Search Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {['All', 'Pending Admin Review', 'Approved by Admin', 'Rejected by Admin', 'Appointment Confirmed'].map(st => (
                    <button
                      key={st}
                      onClick={() => setEnquiryFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        enquiryFilter === st
                          ? 'bg-[#004349] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st} {st === 'Pending Admin Review' && pendingAdminCount > 0 ? `(${pendingAdminCount})` : ''}
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
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={handleExportEnquiriesCSV}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Export Enquiries to CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Patient Enquiries Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                        <th className="px-6 py-3.5">Enquiry ID & Ref</th>
                        <th className="px-6 py-3.5">Patient Details</th>
                        <th className="px-6 py-3.5">Contact & Location</th>
                        <th className="px-6 py-3.5">Stream & Symptoms</th>
                        <th className="px-6 py-3.5">Uploaded Reports</th>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredEnquiries.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-slate-500 font-medium">
                            No patient enquiries found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredEnquiries.map((enq) => (
                          <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono font-bold text-primary block">{enq.enquiryId}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Ref: {enq.referenceNumber}</span>
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
                              <span className="text-[10px] text-slate-500 truncate block max-w-xs">{enq.symptoms || enq.notes || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              {enq.uploadedReports && enq.uploadedReports.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                  <FileText className="w-3 h-3" /> {enq.uploadedReports.length} Report(s)
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No reports</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                              {enq.date}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={enq.status} />
                            </td>
                            <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                              {enq.status === 'Pending Admin Review' && (
                                <>
                                  <button
                                    onClick={() => { setShowApproveEnquiryModal(enq); setApproveRemarks(''); }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Approve Enquiry"
                                  >
                                    <Check className="w-3 h-3" /> Approve
                                  </button>
                                  <button
                                    onClick={() => { setShowRejectEnquiryModal(enq); setRejectReasonText(''); }}
                                    className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                                    title="Reject Enquiry"
                                  >
                                    <X className="w-3 h-3" /> Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setTimelineEnquiry(enq)}
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                                title="View Timeline & Details"
                              >
                                <Clock className="w-3.5 h-3.5 text-primary" />
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

          {/* =====================================================
              TAB: PATIENTS MANAGER
          ===================================================== */}
          {activeTab === 'patients' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center space-x-2 border border-outline-variant rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50 focus-within:border-primary transition-all">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Patient name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={patientFilter}
                      onChange={e => setPatientFilter(e.target.value)}
                      className="pl-9 pr-6 py-2 border border-outline-variant rounded-xl text-xs bg-slate-50 cursor-pointer appearance-none outline-none w-full sm:w-auto"
                    >
                      <option value="All">All Financial Aid Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Disbursed">Disbursed</option>
                      <option value="Not Requested">Not Requested</option>
                    </select>
                  </div>
                  <button
                    onClick={handleExportPatientsCSV}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Export Patients CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => handleOpenPatientForm(null)}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Patient Record
                  </button>
                </div>
              </div>

              {/* Patients Grid/Table */}
              <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                        <th className="px-6 py-3">Patient Code</th>
                        <th className="px-6 py-3">Patient Details</th>
                        <th className="px-6 py-3">Primary Diagnosis</th>
                        <th className="px-6 py-3">Clinic Partner</th>
                        <th className="px-6 py-3">Financial Aid Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-xs">
                      {filteredPatients.map((pat) => (
                        <tr key={pat.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-500">{pat.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-950">{pat.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{pat.age} yrs • {pat.gender}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{pat.diagnosis}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">{pat.hospitalName}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              pat.financialAidStatus === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                              pat.financialAidStatus === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              pat.financialAidStatus === 'Disbursed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {pat.financialAidStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenPatientForm(pat)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-primary cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePatient(pat.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB: VOLUNTEERS MANAGER
          ===================================================== */}
          {activeTab === 'volunteers' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center space-x-2 border border-outline-variant rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50 focus-within:border-primary transition-all">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Volunteer name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={volunteerFilter}
                    onChange={e => setVolunteerFilter(e.target.value)}
                    className="px-4 py-2 border border-outline-variant rounded-xl text-xs bg-slate-50 cursor-pointer outline-none w-full sm:w-auto"
                  >
                    <option value="All">All Verification Status</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                  </select>
                  <button
                    onClick={handleExportVolunteersCSV}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Export Volunteers CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Volunteers list */}
              <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                        <th className="px-6 py-3">Volunteer Details</th>
                        <th className="px-6 py-3">Domain</th>
                        <th className="px-6 py-3">Registered Date</th>
                        <th className="px-6 py-3">Activity Metrics</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-xs">
                      {filteredVolunteers.map((vol) => (
                        <tr key={vol.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-950">{vol.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{vol.email} • {vol.phone}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{vol.domain}</td>
                          <td className="px-6 py-4 text-slate-500">{vol.registeredDate}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-700">{vol.hoursLogged} hrs logged</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{vol.attendanceRate}% Attendance Rate</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              vol.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                              vol.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {vol.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {vol.status === 'Pending Approval' ? (
                              <>
                                <button
                                  onClick={() => handleApproveVolunteer(vol.id)}
                                  className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-95 cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => handleRejectVolunteer(vol.id)}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-lg text-[10px] hover:bg-red-100 cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <X className="w-3 h-3" /> Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                                Active Node
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB: CAMPAIGNS SCHEDULER
          ===================================================== */}
          {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">
              
              {/* Campaign Schedule Form */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs self-start">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-primary" /> Schedule Awareness Campaign
                </h3>
                
                {campaignSuccessToast && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Campaign Scheduled Successfully!
                  </div>
                )}

                <form onSubmit={handleAddCampaign} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={newCampaignTitle}
                      onChange={e => setNewCampaignTitle(e.target.value)}
                      placeholder="e.g. Dwarka Screening Camp"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Campaign Type</label>
                    <select
                      value={newCampaignType}
                      onChange={e => setNewCampaignType(e.target.value)}
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
                    >
                      <option value="Screening Camp">Screening Camp (On-site)</option>
                      <option value="Blood Donation">Blood Donation Drive</option>
                      <option value="Awareness Drive">Awareness Campaign</option>
                      <option value="Workshop">Recovery Workshop</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Campaign Date / Time</label>
                    <input
                      type="text"
                      required
                      value={newCampaignDate}
                      onChange={e => setNewCampaignDate(e.target.value)}
                      placeholder="e.g. Sat, 15 Aug 2026 • 9:00 AM"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Location / Coordinates</label>
                    <input
                      type="text"
                      required
                      value={newCampaignLocation}
                      onChange={e => setNewCampaignLocation(e.target.value)}
                      placeholder="e.g. Community Center, Dwarka"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity"
                  >
                    Schedule & Broadcast Alert
                  </button>
                </form>
              </div>

              {/* Scheduled active list */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Active & Ongoing Campaigns</h3>
                
                <div className="space-y-4">
                  {[
                    { title: 'Free Oral Cancer Screening Drive', date: 'Sat, 26 Jul 2026', type: 'Screening Camp', loc: 'Lions Club, Dwarka', vols: '22 / 30 assigned' },
                    { title: 'Community Blood Donation Camp', date: 'Sun, 27 Jul 2026', type: 'Blood Donation', loc: 'City Hospital, Mumbai', vols: '18 / 20 assigned' },
                    { title: 'Women\'s Breast Health Awareness', date: 'Wed, 30 Jul 2026', type: 'Awareness Drive', loc: 'Sector 12 Center, Noida', vols: '7 / 15 assigned' },
                  ].map((c, i) => (
                    <div key={i} className="p-4 border border-outline-variant/40 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/15">{c.type}</span>
                        <h4 className="font-bold text-slate-900 mt-2">{c.title}</h4>
                        <p className="text-slate-500 mt-1">{c.date} • {c.loc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{c.vols}</p>
                        <button className="mt-2 text-[10px] font-bold text-secondary hover:underline">Manage Vol Allocation</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =====================================================
              TAB: HOSPITAL TIE-UPS
          ===================================================== */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" />
                <div>
                  <p className="font-bold">Role-based Access Clearance Level: Regional Coordinator</p>
                  <p className="text-amber-800/85 mt-0.5">As Admin, you can review partner applications, verify submitted accreditation documents, and recommend entries. Under CAB Trust guidelines, final tie-up approvals or rejections are restricted to the **Super Admin board console**.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                        <th className="px-6 py-3">Hospital Node Name</th>
                        <th className="px-6 py-3">Branch Location</th>
                        <th className="px-6 py-3">Applied Date</th>
                        <th className="px-6 py-3">Document Check</th>
                        <th className="px-6 py-3">Verification Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-xs">
                      {hospitalRequests.map((hosp) => (
                        <tr key={hosp.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-950">{hosp.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{hosp.contactEmail} • {hosp.contactPhone}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{hosp.city}</td>
                          <td className="px-6 py-4 text-slate-500">{hosp.appliedDate}</td>
                          <td className="px-6 py-4">
                            {hosp.documentVerified ? (
                              <span className="text-green-600 font-bold flex items-center gap-1">✓ Verified</span>
                            ) : (
                              <button
                                onClick={() => handleVerifyDocument(hosp.id)}
                                className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold hover:bg-amber-100"
                              >
                                Check Document Uploads
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              hosp.status === 'Active Partner' ? 'bg-green-50 text-green-700 border-green-200' :
                              hosp.status === 'Recommended to Super Admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              hosp.status === 'Declined by Admin' ? 'bg-red-50 text-red-600 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {hosp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {hosp.status === 'Pending Tie-up' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleRecommendHospital(hosp.id)}
                                  disabled={!hosp.documentVerified}
                                  className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                                  title={!hosp.documentVerified ? 'Verify documents before recommending' : 'Recommend application to Super Admin'}
                                >
                                  Recommend to Super Admin
                                </button>
                                <button
                                  onClick={() => setShowAdminDeclineModal(hosp.id)}
                                  className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold hover:bg-red-100 cursor-pointer"
                                >
                                  Deny / Decline
                                </button>
                              </div>
                            ) : hosp.status === 'Recommended to Super Admin' ? (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                                Recommended to Board
                              </span>
                            ) : hosp.status === 'Declined by Admin' ? (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                                Declined by Admin
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                                Connected Partner
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DECLINE APPLICATION MODAL */}
              {showAdminDeclineModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">Decline Hospital Tie-up Application</h3>
                    <p className="text-slate-600">Provide feedback notes explaining why this hospital partnership application is being declined by the Regional Coordinator desk.</p>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Decline Justification Reason *</label>
                      <textarea
                        rows={3}
                        required
                        value={adminDeclineReason}
                        onChange={e => setAdminDeclineReason(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                        placeholder="e.g. Hospital accreditation documentation incomplete or non-compliant with CAB guidelines..."
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowAdminDeclineModal(null); setAdminDeclineReason(''); }}
                        className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineHospitalByAdmin(showAdminDeclineModal)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 cursor-pointer"
                      >
                        Decline Application
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB: CAMPAIGN REQUESTS
          ===================================================== */}
          {activeTab === 'requests' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                        <th className="px-6 py-3">Applicant / Host Organization</th>
                        <th className="px-6 py-3">Contact Person</th>
                        <th className="px-6 py-3">Requested Location</th>
                        <th className="px-6 py-3">Expected Attendees</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-xs">
                      {campaignRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-950">{req.organizationName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{req.orgType} • Applied: {req.requestedDate}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-700">{req.contactPerson}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{req.email} • {req.phone}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{req.location}</td>
                          <td className="px-6 py-4 text-slate-500 font-bold">{req.expectedAttendees}</td>
                          <td className="px-6 py-4 font-medium">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              req.status === 'Scheduled' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {req.status === 'Pending Scheduling' ? (
                              <button
                                onClick={() => handleScheduleFromRequest(req)}
                                className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-95 cursor-pointer inline-flex items-center gap-0.5 shadow-sm"
                              >
                                <Calendar className="w-3 h-3" /> Convert to Camp
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                Active scheduled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB: DONATIONS AUDIT
          ===================================================== */}
          {activeTab === 'donations' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Cumulative Donations Received', val: summaryKpis.donationsReceived, prefix: '₹' },
                  { label: 'Total Receipts Dispatched', val: '100%', prefix: '' },
                  { label: 'Corporate CSR Grants', val: '2 sponsors', prefix: '' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 border border-outline-variant/30 rounded-2xl text-center">
                    <p className="text-2xl font-black text-slate-900">{stat.prefix}{stat.val.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Donations History table */}
              <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Donation Ledgers</h3>
                  <button
                    onClick={handleExportDonationsCSV}
                    className="px-3.5 py-1.5 border border-outline-variant/50 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export Ledger (Excel)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-outline-variant/30">
                        <th className="px-6 py-3">Receipt Code</th>
                        <th className="px-6 py-3">Donor Entity</th>
                        <th className="px-6 py-3">Inflow Amount</th>
                        <th className="px-6 py-3">Audit Date</th>
                        <th className="px-6 py-3">Inflow Channel</th>
                        <th className="px-6 py-3 text-right">Tax Exemption Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-xs">
                      {donations.map((don) => (
                        <tr key={don.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-500">{don.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-950">{don.donorName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{don.donorType}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{don.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-500">{don.date}</td>
                          <td className="px-6 py-4 font-medium text-slate-600">{don.paymentMethod}</td>
                          <td className="px-6 py-4 text-right">
                            {don.receiptSent ? (
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Sent (80G)</span>
                            ) : (
                              <button
                                onClick={() => setDonations(prev => {
                                  const updated = prev.map(d => d.id === don.id ? { ...d, receiptSent: true } : d);
                                  localStorage.setItem('aware_bharat_donations', JSON.stringify(updated));
                                  return updated;
                                })}
                                className="px-2.5 py-1 bg-primary text-white rounded text-[10px] font-bold hover:opacity-95"
                              >
                                Email Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB: BLOGS & EVENTS NEWS
          ===================================================== */}
          {activeTab === 'blogs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">
              
              {/* Blog publisher */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs self-start">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-primary" /> Publish Notice / Blog
                </h3>
                
                <form onSubmit={handlePublishBlog} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Post Category</label>
                    <select
                      value={newBlogCategory}
                      onChange={e => setNewBlogCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
                    >
                      <option value="Prevention">Oncology Prevention</option>
                      <option value="Nutrition">Nutrition Guide</option>
                      <option value="Research">Important Announcement / Research</option>
                      <option value="Survivors">Survivor Story</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Title</label>
                    <input
                      type="text"
                      required
                      value={newBlogTitle}
                      onChange={e => setNewBlogTitle(e.target.value)}
                      placeholder="e.g. Nutrition Tips during Chemotherapy"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Abstract Summary</label>
                    <textarea
                      rows={3}
                      required
                      value={newBlogSummary}
                      onChange={e => setNewBlogSummary(e.target.value)}
                      placeholder="Write brief description for public readers..."
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity cursor-pointer"
                  >
                    Publish to Portal News
                  </button>
                </form>
              </div>

              {/* Published articles log */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Published Announcements & News</h3>
                
                <div className="space-y-3">
                  {blogs.map((art) => (
                    <div key={art.id} className="p-3 border border-outline-variant/40 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold border border-slate-200">{art.category}</span>
                        <h4 className="font-bold text-slate-900 mt-2">{art.title}</h4>
                        <p className="text-slate-400 mt-0.5">Author: {art.author} • {art.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBlog(art.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-colors"
                        title="Delete Blog Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =====================================================
              TAB: VOLUNTEER FEEDBACK
          ===================================================== */}
          {activeTab === 'feedback' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-1 gap-4">
                {feedbacks.map((f) => (
                  <div key={f.id} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs text-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{f.volunteerName}</span>
                        <p className="text-slate-400 text-[10px] mt-0.5">Campaign: {f.campaignName} • {f.date}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-100 text-[10px]">
                        ★ {f.rating} / 5 Rating
                      </div>
                    </div>
                    <p className="text-slate-700 italic leading-relaxed">"{f.comment}"</p>
                    
                    {/* Reply box */}
                    {f.status === 'Responded' ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="font-bold text-primary">Admin Response:</p>
                        <p className="text-slate-600 mt-1">"{f.response}"</p>
                      </div>
                    ) : activeFeedbackId === f.id ? (
                      <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                        <textarea
                          rows={2}
                          value={feedbackReplyText}
                          onChange={e => setFeedbackReplyText(e.target.value)}
                          placeholder="Type response to volunteer..."
                          className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendFeedbackReply(f.id)}
                            className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:opacity-95"
                          >
                            Send Reply
                          </button>
                          <button
                            onClick={() => setActiveFeedbackId(null)}
                            className="px-4 py-1.5 border border-outline-variant rounded-lg font-semibold hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveFeedbackId(f.id);
                          setFeedbackReplyText('');
                        }}
                        className="px-3 py-1.5 border border-outline-variant/50 hover:bg-slate-50 rounded-lg font-bold text-slate-700"
                      >
                        Reply to Feedback
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB: NOTIFICATION CENTER
          ===================================================== */}
          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">
              
              {/* Broadcast Form */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs self-start">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-primary" /> Broadcast announcement to Volunteers
                </h3>
                
                {notifSuccessToast && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Broadcast alert sent to 2,400+ volunteers!
                  </div>
                )}

                <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Subject Header</label>
                    <input
                      type="text"
                      required
                      value={announcementTitle}
                      onChange={e => setAnnouncementTitle(e.target.value)}
                      placeholder="e.g. Schedule shift changes"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Message Body</label>
                    <textarea
                      rows={4}
                      required
                      value={announcementMessage}
                      onChange={e => setAnnouncementMessage(e.target.value)}
                      placeholder="Write message details here..."
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm">
                    Broadcast Announcement
                  </button>
                </form>
              </div>

              {/* Logs */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Historical System Logs</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Volunteer Verification Completed', text: 'Volunteer accounts registered in Pune database sync check.', time: 'July 21, 2026 • 2:10 PM' },
                    { title: 'Database Backed Up', text: 'System backup trace uploaded to primary AWS secure server.', time: 'July 20, 2026 • 11:59 PM' },
                    { title: 'MFA Credential Session Reset', text: 'Admin security passcode validated and credentials authorized.', time: 'July 18, 2026 • 10:15 AM' }
                  ].map((l, idx) => (
                    <div key={idx} className="p-3 border border-outline-variant/40 rounded-xl text-xs">
                      <h4 className="font-bold text-slate-900">{l.title}</h4>
                      <p className="text-slate-600 mt-1">{l.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{l.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =====================================================
              TAB: ADMIN SETTINGS
          ===================================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs max-w-2xl animate-[fadeInUp_0.4s_ease-out] text-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Administrative Settings
              </h3>

              {passwordSuccess && (
                <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5" /> Settings updated successfully!
                </div>
              )}

              <form onSubmit={e => {
                e.preventDefault();
                localStorage.setItem('aware_bharat_admin_profile', JSON.stringify({ profileName, profileEmail }));
                setPasswordSuccess(true);
                setTimeout(() => setPasswordSuccess(false), 3000);
                toast.success('Settings Saved', 'Administrative preferences updated successfully.');
              }} className="space-y-5">
                
                {/* Node details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Admin Account Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Admin Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Password reset */}
                <div className="border-t border-outline-variant/20 pt-5 space-y-4">
                  <h4 className="font-bold text-slate-950 text-sm">Security Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Verify New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity"
                >
                  Save Administrative Settings
                </button>

              </form>
            </div>
          )}

        </div>
      </main>

      {/* =====================================================
          MODAL: ADD / EDIT PATIENT RECORD
      ===================================================== */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-outline-variant/20 text-xs">
            <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-headline-lg text-sm font-bold flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-secondary-container animate-pulse" />
                {editingPatient ? 'Edit Patient Record' : 'Add Patient Intake'}
              </h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientFormName}
                    onChange={e => setPatientFormName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Age</label>
                    <input
                      type="number"
                      required
                      value={patientFormAge}
                      onChange={e => setPatientFormAge(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Gender</label>
                    <select
                      value={patientFormGender}
                      onChange={e => setPatientFormGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Cancer Diagnosis</label>
                <input
                  type="text"
                  required
                  value={patientFormDiagnosis}
                  onChange={e => setPatientFormDiagnosis(e.target.value)}
                  placeholder="e.g. Oral Cavity Cancer (Stage II)"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Clinic Partner Assignment</label>
                  <select
                    value={patientFormHospital}
                    onChange={e => setPatientFormHospital(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
                  >
                    <option value="Apex Oncology Institute">Apex Oncology Institute (Delhi)</option>
                    <option value="CareWell Cancer Hospital">CareWell Cancer Hospital (Mumbai)</option>
                    <option value="Tata Cancer Care & Research Center">Tata Cancer Care (Kolkata)</option>
                    <option value="Narayana Health City">Narayana Health City (Bangalore)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Financial Aid Status</label>
                    <select
                      value={patientFormAid}
                      onChange={e => setPatientFormAid(e.target.value as any)}
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
                    >
                      <option value="Not Requested">Not Requested</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Disbursed">Disbursed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Aid Amount (INR)</label>
                    <input
                      type="number"
                      value={patientFormAidAmt}
                      onChange={e => setPatientFormAidAmt(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-outline-variant/20 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-bold rounded-xl shadow-sm hover:opacity-95 cursor-pointer"
                >
                  Save Intake Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Approve Enquiry Modal */}
      {showApproveEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Approve Patient Enquiry
              </h3>
              <button onClick={() => setShowApproveEnquiryModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <p><strong className="text-slate-800">Enquiry ID:</strong> {showApproveEnquiryModal.enquiryId}</p>
              <p><strong className="text-slate-800">Patient:</strong> {showApproveEnquiryModal.patientName} ({showApproveEnquiryModal.age} / {showApproveEnquiryModal.gender})</p>
              <p><strong className="text-slate-800">Stream:</strong> {showApproveEnquiryModal.reason}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Admin Approval Remarks / Case Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={approveRemarks}
                onChange={e => setApproveRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-primary outline-none"
                placeholder="e.g. Primary reports verified. Approved for Super Admin hospital assignment."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveEnquiryModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  enquiryStore.adminApproveEnquiry(showApproveEnquiryModal.id, approveRemarks, 'Dr. Ramesh Sharma');
                  toast.success('Enquiry Approved', `Patient ${showApproveEnquiryModal.patientName} forwarded to Super Admin board.`);
                  setShowApproveEnquiryModal(null);
                  setApproveRemarks('');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                Approve & Forward to Super Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reject Enquiry Modal */}
      {showRejectEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" /> Reject Patient Enquiry
              </h3>
              <button onClick={() => setShowRejectEnquiryModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <p><strong className="text-slate-800">Enquiry ID:</strong> {showRejectEnquiryModal.enquiryId}</p>
              <p><strong className="text-slate-800">Patient:</strong> {showRejectEnquiryModal.patientName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectReasonText}
                onChange={e => setRejectReasonText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-red-500 outline-none"
                placeholder="State reason for rejection..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectEnquiryModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReasonText.trim()}
                onClick={() => {
                  if (rejectReasonText.trim()) {
                    enquiryStore.adminRejectEnquiry(showRejectEnquiryModal.id, rejectReasonText, 'Dr. Ramesh Sharma');
                    toast.warning('Enquiry Rejected', `Patient ${showRejectEnquiryModal.patientName} enquiry declined.`);
                    setShowRejectEnquiryModal(null);
                    setRejectReasonText('');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Reject Enquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enquiry Timeline Modal */}
      <EnquiryTimelineModal
        enquiry={timelineEnquiry}
        isOpen={!!timelineEnquiry}
        onClose={() => setTimelineEnquiry(null)}
      />

    </div>
  );
}
