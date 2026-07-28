import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Eye, EyeOff, CheckCircle2, Shield, FileCheck, ArrowRight, ArrowLeft,
  Mail, Phone, Lock, MapPin, Award, Check, Clock, Upload, Stethoscope,
  Activity, ShieldCheck, Heart, Sparkles, Building, AlertCircle, Save, FileText,
  HelpCircle, ChevronDown, ChevronUp, Download, Layers, Users, CheckSquare, Info,
  X, UserCheck, Calendar, DollarSign, Globe, ExternalLink, RefreshCw, Printer
} from 'lucide-react';
import { ApiError, loginHospital, setHospitalSession } from '../api/client';

interface HospitalAuthPageProps {
  onPageChange?: (page: string) => void;
}

type AuthMode = 'login' | 'register';
type FormStep = 1 | 2 | 3 | 4 | 5;

export default function HospitalAuthPage({ onPageChange }: HospitalAuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [loggedInHospital, setLoggedInHospital] = useState<{ name: string; email: string; city: string; appId?: string } | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Accordion FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Login form state -- previously pre-filled with a real seed-account
  // password, handing a working login to anyone who opened this page.
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Step 1: Hospital Details State
  const [hospName, setHospName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [bedCount, setBedCount] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Step 2: Representative Contact Details State
  const [repName, setRepName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [secEmail, setSecEmail] = useState('');

  // Step 3: Clinical Specializations & Infrastructure State
  const [nabhAccredited, setNabhAccredited] = useState(true);
  const [nablAccredited, setNablAccredited] = useState(true);
  const [oncologyBeds, setOncologyBeds] = useState('40');
  const [icuBeds, setIcuBeds] = useState('15');
  const [specialties, setSpecialties] = useState<string[]>([
    'Medical Oncology', 'Radiation Oncology', 'Surgical Oncology'
  ]);
  const [facilities, setFacilities] = useState<string[]>([
    'Linear Accelerator', 'Dedicated Chemotherapy Daycare', 'PET-CT Scanner', 'Blood Bank'
  ]);

  // Step 4: Documents Upload State (starts unassigned until file selected from OS)
  const [docNabhFile, setDocNabhFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [docLicenseFile, setDocLicenseFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [docFireFile, setDocFireFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [docReportFile, setDocReportFile] = useState<{ name: string; size: string; type: string } | null>(null);

  // File Upload Handler (Native OS File Explorer Picker & Validation)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: { name: string; size: string; type: string } | null) => void
  ) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB file size limit validation
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File "${file.name}" exceeds the maximum allowed 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller file.`);
      e.target.value = '';
      return;
    }

    // Allowed file extension / MIME type validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !['pdf', 'png', 'jpg', 'jpeg'].includes(ext || '')) {
      setErrorMessage(`Invalid format for "${file.name}". Supported formats: PDF, PNG, JPG.`);
      e.target.value = '';
      return;
    }

    const formattedSize = file.size < 1024 * 1024
      ? `${Math.round(file.size / 1024)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    setter({
      name: file.name,
      size: formattedSize,
      type: (ext || 'pdf').toUpperCase()
    });

    e.target.value = '';
  };

  // Step 5: Terms Agreement State
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAudit, setAgreeAudit] = useState(false);
  const [generatedAppId, setGeneratedAppId] = useState('');

  // Specialties master list
  const availableSpecialties = [
    'Medical Oncology', 'Radiation Oncology', 'Surgical Oncology',
    'Gynecological Oncology', 'Pediatric Oncology', 'Bone Marrow Transplant',
    'Proton Beam Therapy', 'Palliative & Supportive Care', 'Hemato-Oncology',
    'Head & Neck Surgery', 'Neuro-Oncology', 'Nuclear Medicine'
  ];

  // Facilities master list
  const availableFacilities = [
    'Linear Accelerator', 'Dedicated Chemotherapy Daycare', 'PET-CT Scanner',
    'Robotic Surgery Suite', 'Bone Marrow Transplant Unit', 'Blood Bank & Component Separator',
    '24x7 Emergency ICUs', 'TrueBeam STx Radiation System'
  ];

  // Auto load saved draft on mount if available
  useEffect(() => {
    const savedDraft = localStorage.getItem('aware_bharat_hospital_draft');
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        if (data.hospName) setHospName(data.hospName);
        if (data.repName) setRepName(data.repName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.city) setCity(data.city);
        if (data.state) setState(data.state);
        if (data.licenseNo) setLicenseNo(data.licenseNo);
        if (data.savedAt) setDraftSavedTime(data.savedAt);
      } catch (err) {
        console.error('Failed to parse draft', err);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const toggleSpecialty = (item: string) => {
    setSpecialties(prev => prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]);
  };

  const toggleFacility = (item: string) => {
    setFacilities(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);
  };

  const switchMode = (newMode: AuthMode) => {
    setErrorMessage('');
    setMode(newMode);
    setCurrentStep(1);
  };

  // ---- Save Draft Handler ----
  const handleSaveDraft = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const draftData = {
      hospName, licenseNo, bedCount, address, city, state, emergencyPhone,
      repName, designation, email, phone, secEmail, nabhAccredited, nablAccredited,
      specialties, facilities, savedAt: timestamp
    };
    localStorage.setItem('aware_bharat_hospital_draft', JSON.stringify(draftData));
    setDraftSavedTime(timestamp);
    showToast(`Application draft saved successfully at ${timestamp}`);
  };

  // ---- Form Step Validation ----
  const validateCurrentStep = (): boolean => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!hospName.trim() || !city.trim() || !state.trim()) {
        setErrorMessage('Please enter the Hospital Name, City, and State to continue.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!repName.trim() || !email.trim() || !phone.trim()) {
        setErrorMessage('Please enter Representative Name, Official Email, and Phone Number.');
        return false;
      }
      // Previously just `!email.includes('@') || !email.includes('.')`,
      // which both rejected valid addresses and accepted garbage like
      // "a@.@b.c" -- disagreeing with the native type="email" constraint
      // already on the input. Not a full RFC 5322 validator, but a real
      // shape check instead of two substring tests.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErrorMessage('Please provide a valid official email address.');
        return false;
      }
    } else if (currentStep === 3) {
      if (specialties.length === 0) {
        setErrorMessage('Please select at least one core Oncology Specialty.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!docNabhFile && !docLicenseFile) {
        setErrorMessage('Please upload at least one accreditation document (NABH Certificate or License).');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5) as FormStep);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(prev - 1, 1) as FormStep);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // ---- Login Handler ----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter both official email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await loginHospital(loginEmail.trim(), loginPassword);
      setHospitalSession({
        name: token.name,
        email: loginEmail,
        accessToken: token.accessToken,
        sessionKey: 'HOSP-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        loginTime: new Date().toLocaleString(),
      });
      navigate('/hospital/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Partnership Application Final Submit ----
  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!agreeTerms || !agreeAudit) {
      setErrorMessage('You must agree to the NGO Clinical Guidelines and Verification Audit terms.');
      return;
    }

    setIsSubmitting(true);
    const appId = 'CAB-HOSP-APP-2026-' + Math.floor(1000 + Math.random() * 9000);
    setGeneratedAppId(appId);

    setTimeout(() => {
      const newApplication = {
        id: appId,
        name: hospName,
        licenseNo: licenseNo || 'REG-PENDING',
        city,
        state,
        address,
        contactEmail: email,
        contactPhone: phone,
        appliedDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        submittedAt: new Date().toLocaleString(),
        nabhAccredited,
        bedCount: parseInt(bedCount) || 150,
        specialties,
        documents: [
          { name: 'NABH Accreditation Certificate', verified: !!docNabhFile, fileName: docNabhFile?.name || null, fileSize: docNabhFile?.size || null },
          { name: 'Hospital Registration License', verified: !!docLicenseFile, fileName: docLicenseFile?.name || null, fileSize: docLicenseFile?.size || null },
          { name: 'Fire Safety Clearance', verified: !!docFireFile, fileName: docFireFile?.name || null, fileSize: docFireFile?.size || null },
        ],
        recommendedBy: null,
        recommendationNotes: null,
        status: 'Pending Review',
      };

      const existing = localStorage.getItem('aware_bharat_hospital_requests');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newApplication);
      localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(list));

      // Clear draft
      localStorage.removeItem('aware_bharat_hospital_draft');

      setIsSubmitting(false);
      setLoggedInHospital({ name: hospName, email, city, appId });
      setSubmitSuccess(true);
    }, 1800);
  };

  // ---- SUBMISSION CONFIRMATION SPLASH PAGE ----
  if (submitSuccess && loggedInHospital) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-slate-50">
        <div className="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl animate-[fadeInUp_0.4s_ease-out]">
          
          <div className="relative mb-2 inline-block">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl border-2 border-emerald-300 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-11 h-11 text-emerald-600 animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#063b42] rounded-full flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              {mode === 'login' ? 'Authentication Successful' : 'Application Status: Pending Executive Review'}
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {mode === 'login' ? 'Welcome to Hospital Portal' : 'Partnership Application Received!'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed max-w-md mx-auto">
              {mode === 'login' ? (
                <>Authenticated session initialized for <strong className="text-[#063b42]">{loggedInHospital.name}</strong> ({loggedInHospital.city}). Accessing clinical management workspace...</>
              ) : (
                <>Application reference <strong className="font-mono text-[#063b42]">{loggedInHospital.appId || generatedAppId}</strong> for <strong className="text-[#063b42]">{loggedInHospital.name}</strong> has been logged into the CAB Trust Board registry.</>
              )}
            </p>
          </div>

          {/* Submission Receipt Breakdown */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl text-left text-xs font-mono space-y-2 border border-slate-800 shadow-inner">
            <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Official Application Receipt
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <p><span className="text-slate-400">Application ID:</span> <span className="text-white font-bold">{loggedInHospital.appId || generatedAppId || 'CAB-HOSP-2026'}</span></p>
              <p><span className="text-slate-400">Submitted On:</span> <span className="text-white">{new Date().toLocaleDateString('en-IN')}</span></p>
              <p><span className="text-slate-400">Hospital Node:</span> <span className="text-white">{loggedInHospital.name}</span></p>
              <p><span className="text-slate-400">Current Status:</span> <span className="text-amber-400 font-bold">{mode === 'login' ? 'ACTIVE_PARTNER' : 'PENDING_ADMIN_REVIEW'}</span></p>
              <p><span className="text-slate-400">Est. Timeline:</span> <span className="text-emerald-300">2 Business Days</span></p>
              <p><span className="text-slate-400">Assigned Board:</span> <span className="text-white">CAB Delhi Executive Node</span></p>
            </div>
          </div>

          {/* Next Steps List */}
          {mode === 'register' && (
            <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl text-left text-xs space-y-2">
              <p className="font-bold text-[#063b42] uppercase text-[10px] tracking-wider">Next Onboarding Steps</p>
              <ul className="space-y-1.5 text-slate-700 text-[11px]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-teal-600" /> Regional Coordinator document verification</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-teal-600" /> Super Admin executive board approval & credential issuance</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-teal-600" /> Notification with temp password sent to official email</li>
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Exit Portal
            </button>
            <button
              onClick={() => setShowReceiptModal(true)}
              className="py-3 px-4 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" /> Receipt PDF
            </button>
            <button
              onClick={() => navigate(mode === 'login' ? '/hospital/dashboard' : '/hospitals')}
              className="flex-1 py-3 rounded-xl bg-[#063b42] text-white font-bold text-xs hover:bg-[#084c55] shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{mode === 'login' ? 'Go to Hospital Dashboard' : 'View Partner Directory'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* APPLICATION ACKNOWLEDGMENT RECEIPT PDF MODAL */}
        {showReceiptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReceiptModal(false)}>
            <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#063b42] relative space-y-6 text-slate-900" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#063b42] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-lg font-black text-slate-900">Cancer Aware Bharat Trust</h2>
                    <p className="text-xs text-slate-500 font-semibold">Official Hospital Partnership Application Receipt</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 uppercase tracking-wider">
                  Pending Review
                </span>
              </div>

              {/* Reference Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Application Ref ID</p>
                  <p className="font-bold font-mono text-[#063b42] text-sm">{loggedInHospital?.appId || generatedAppId || 'CAB-HOSP-APP-2026-9042'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submission Date</p>
                  <p className="font-bold text-slate-800">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Board Timeline</p>
                  <p className="font-bold text-emerald-700">2 Business Days</p>
                </div>
              </div>

              {/* Hospital Details Grid */}
              <div className="space-y-3">
                <p className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">Hospital Partner Information</p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                  <p><strong>Hospital Name:</strong> {loggedInHospital?.name || hospName || 'Max Super Speciality Hospital'}</p>
                  <p><strong>Location:</strong> {city || 'New Delhi'}, {state || 'Delhi'}</p>
                  <p><strong>Official Email:</strong> {loggedInHospital?.email || email || 'contact@hospital.org'}</p>
                  <p><strong>Contact Phone:</strong> {phone || '+91 98765 43210'}</p>
                  <p><strong>Representative:</strong> {repName || 'Dr. Rajesh Mehta'} ({designation || 'Medical Director'})</p>
                  <p><strong>License Number:</strong> {licenseNo || 'REG-MH-2026-4421'}</p>
                  <p><strong>Bed Capacity:</strong> {bedCount || 150} beds</p>
                  <p><strong>NABH Status:</strong> {nabhAccredited ? 'NABH Accredited ✓' : 'Standard Registration'}</p>
                </div>
              </div>

              {/* Submitted Documents */}
              <div className="space-y-2">
                <p className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">Submitted Verification Documents</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-mono">
                  <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> NABH Cert: {docNabhFile ? docNabhFile.name : 'Uploaded ✓'}</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> License: {docLicenseFile ? docLicenseFile.name : 'Uploaded ✓'}</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Fire Clearance: {docFireFile ? docFireFile.name : 'Uploaded ✓'}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Issuer Authority</p>
                  <p className="font-bold text-slate-800">CAB Trust Executive Board Secretariat</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Authorized Representative</p>
                  <p className="font-bold text-[#063b42]">Dr. Ramesh Sharma, Director</p>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast('Receipt PDF ready for printing/saving.');
                  }}
                  className="flex-1 py-2.5 bg-[#063b42] text-white font-bold rounded-xl hover:bg-[#084c55] flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save Receipt PDF
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f9] py-8 px-4 sm:px-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-[fadeInUp_0.3s_ease-out]">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* Main Container Card */}
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Portal Header Bar */}
        <div className="bg-gradient-to-r from-[#063b42] via-[#0d5c63] to-teal-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none filter blur-3xl" />
          
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/15">
              <Building2 className="w-3.5 h-3.5" />
              <span>Cancer Aware Bharat Trust • Hospital Onboarding</span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-4xl font-black tracking-tight">
              Hospital Partner Portal
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Empowering recognized oncology centers & community hospitals across India to collaborate in diagnostic screening, patient referrals, and subsidized cancer treatment.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex shrink-0 w-full sm:w-auto">
            <button
              onClick={() => switchMode('login')}
              role="tab"
              aria-selected={mode === 'login'}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#063b42] shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Hospital Sign In
            </button>
            <button
              onClick={() => switchMode('register')}
              role="tab"
              aria-selected={mode === 'register'}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-[#063b42] shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Apply for Partnership
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-[shake_0.4s_ease-in-out]">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =========================================================================
            VIEW 1: HOSPITAL LOGIN FORM
        ========================================================================= */}
        {mode === 'login' ? (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline-lg text-xl font-bold text-slate-900">Partner Hospital Sign In</h2>
              <p className="text-xs text-slate-500">Log in with credentials issued by Super Admin board.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Official Hospital Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#063b42] outline-none text-xs"
                    placeholder="rgci@awarebharat.org"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#063b42] outline-none text-xs"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#063b42] text-white font-bold text-xs hover:bg-[#084c55] shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting Hospital Node...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Access Hospital Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* =========================================================================
              VIEW 2: MULTI-STEP PARTNERSHIP APPLICATION ONBOARDING PORTAL
          ========================================================================= */
          <div className="space-y-8">
            
            {/* STEPPER PROGRESS INDICATOR */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs overflow-x-auto">
              <div className="flex items-center justify-between min-w-[650px] px-4">
                {[
                  { step: 1, label: 'Hospital Node', icon: Building2 },
                  { step: 2, label: 'Contacts & Rep', icon: UserCheck },
                  { step: 3, label: 'Specialties', icon: Stethoscope },
                  { step: 4, label: 'Accreditation', icon: FileCheck },
                  { step: 5, label: 'Review & Submit', icon: CheckCircle2 },
                ].map((s, i) => {
                  const isDone = currentStep > s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <React.Fragment key={s.step}>
                      <button
                        onClick={() => { if (s.step < currentStep) setCurrentStep(s.step as FormStep); }}
                        className={`flex items-center space-x-2.5 transition-all text-xs font-bold ${
                          isCurrent ? 'text-[#063b42]' : isDone ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                          isCurrent ? 'bg-[#063b42] text-white shadow-md' : isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isDone ? <Check className="w-4 h-4" /> : <s.icon className="w-4.5 h-4.5" />}
                        </div>
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                      {i < 4 && <div className={`flex-1 h-0.5 mx-3 ${currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* FORM CONTAINER */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-6">
              
              {/* Draft Bar Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 text-xs">
                <div>
                  <h2 className="font-headline-lg text-lg font-bold text-slate-900">
                    {currentStep === 1 && 'Step 1: Hospital Node & Location Details'}
                    {currentStep === 2 && 'Step 2: Key Representative & Official Contacts'}
                    {currentStep === 3 && 'Step 3: Clinical Specializations & Infrastructure'}
                    {currentStep === 4 && 'Step 4: Accreditation & Document Uploads'}
                    {currentStep === 5 && 'Step 5: Terms Verification & Final Submission'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">Please provide verified clinical details for board clearance.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-teal-600" />
                  <span>Save Draft</span>
                  {draftSavedTime && <span className="text-[10px] text-slate-400 font-mono">({draftSavedTime})</span>}
                </button>
              </div>

              <form onSubmit={handleApplicationSubmit} className="space-y-6">

                {/* ================= STEP 1 ================= */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Hospital / Institute Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={hospName}
                            onChange={e => setHospName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#063b42] outline-none text-xs"
                            placeholder="e.g. Max Super Speciality Hospital"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Hospital Reg. License / NPI No.
                        </label>
                        <div className="relative">
                          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={licenseNo}
                            onChange={e => setLicenseNo(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#063b42] outline-none text-xs"
                            placeholder="REG-DL-2026-9041"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="New Delhi"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          State / UT <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="Delhi"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Total Hospital Beds
                        </label>
                        <input
                          type="number"
                          value={bedCount}
                          onChange={e => setBedCount(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Full Campus Address
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="Press Enclave Road, Saket, New Delhi — 110017"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          24x7 Emergency Desk Phone
                        </label>
                        <input
                          type="tel"
                          value={emergencyPhone}
                          onChange={e => setEmergencyPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="+91 11 2651 5050"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= STEP 2 ================= */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Representative Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={repName}
                          onChange={e => setRepName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="Dr. Siddharth Roy"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Designation / Role
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={e => setDesignation(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="Director of Oncology Services"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Official Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="sroy@maxhealthcare.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Direct Contact Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-xs"
                          placeholder="+91 98111 22334"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= STEP 3 ================= */}
                {currentStep === 3 && (
                  <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                        <input type="checkbox" checked={nabhAccredited} onChange={e => setNabhAccredited(e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                        <span className="text-xs font-bold text-slate-800">NABH Accredited Hospital</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                        <input type="checkbox" checked={nablAccredited} onChange={e => setNablAccredited(e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                        <span className="text-xs font-bold text-slate-800">NABL Accredited Diagnostic Lab</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Core Oncological Specialties Available <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableSpecialties.map(sp => {
                          const isSel = specialties.includes(sp);
                          return (
                            <button
                              type="button"
                              key={sp}
                              onClick={() => toggleSpecialty(sp)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                isSel ? 'bg-[#063b42] text-white border-[#063b42]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isSel ? '✓ ' : '+ '}{sp}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Clinical Facilities & Equipment
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableFacilities.map(fac => {
                          const isSel = facilities.includes(fac);
                          return (
                            <button
                              type="button"
                              key={fac}
                              onClick={() => toggleFacility(fac)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                                isSel ? 'bg-teal-50 text-teal-800 border-teal-300' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isSel ? '✓ ' : '+ '}{fac}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= STEP 4 ================= */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                      <Info className="w-4.5 h-4.5 shrink-0 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-bold">Document Upload Format & Size Guidelines:</p>
                        <p className="text-[11px] text-blue-800 mt-0.5">Click any document upload box to select files directly from your device (File Explorer / Drive). Supported formats: <strong>PDF, PNG, JPG</strong>. Maximum file size allowed: <strong>10 MB per document</strong>.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'file-nabh', title: 'NABH / NABL Accreditation Cert *', state: docNabhFile, setter: setDocNabhFile, req: true },
                        { id: 'file-license', title: 'Hospital Registration License *', state: docLicenseFile, setter: setDocLicenseFile, req: true },
                        { id: 'file-fire', title: 'Fire Safety Clearance Cert', state: docFireFile, setter: setDocFireFile, req: false },
                        { id: 'file-report', title: 'Oncology Dept Audit Report', state: docReportFile, setter: setDocReportFile, req: false },
                      ].map((docItem) => (
                        <div key={docItem.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">{docItem.title}</span>
                            <span className="text-[10px] font-semibold text-slate-400">PDF/JPG (Max 10MB)</span>
                          </div>

                          <input
                            type="file"
                            id={docItem.id}
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, docItem.setter)}
                            className="hidden"
                          />

                          {docItem.state ? (
                            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                              <div className="truncate flex items-center gap-1.5 font-mono">
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="truncate font-bold text-emerald-800">{docItem.state.name}</span>
                                <span className="text-[10px] text-emerald-600 font-sans font-semibold">({docItem.state.size})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => docItem.setter(null)}
                                className="text-red-500 hover:text-red-700 font-bold text-xs ml-2 shrink-0 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={docItem.id}
                              className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:border-[#063b42] hover:bg-white hover:text-[#063b42] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                            >
                              <Upload className="w-4 h-4 text-teal-600" /> Select Document from Device
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================= STEP 5 ================= */}
                {currentStep === 5 && (
                  <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <p className="font-bold text-slate-900 text-sm">Application Summary Review</p>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                        <p><strong>Hospital:</strong> {hospName}</p>
                        <p><strong>City/State:</strong> {city}, {state}</p>
                        <p><strong>Representative:</strong> {repName} ({designation})</p>
                        <p><strong>Contact Email:</strong> {email}</p>
                        <p><strong>Specialties:</strong> {specialties.join(', ')}</p>
                        <p><strong>Accreditation:</strong> {nabhAccredited ? 'NABH Accredited' : 'Standard Registration'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-start space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={agreeTerms}
                          onChange={e => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 text-[#063b42] rounded mt-0.5"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          I confirm that our hospital agrees to Cancer Aware Bharat Trust's <strong>Partnership Guidelines, Clinical Quality Standards, and Privacy Policy</strong>.
                        </span>
                      </label>

                      <label className="flex items-start space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={agreeAudit}
                          onChange={e => setAgreeAudit(e.target.checked)}
                          className="w-4 h-4 text-[#063b42] rounded mt-0.5"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          I consent to physical and document verification audits conducted by regional coordinators prior to final Super Admin board approval.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEPPER NAVIGATION BUTTONS */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous Step
                    </button>
                  ) : <div />}

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-[#063b42] text-white hover:bg-[#084c55] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Continue to Step {currentStep + 1}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting Application to Board...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4.5 h-4.5" />
                          <span>Submit Official Application</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* =========================================================================
                PARTNERSHIP VALUE & TRUST SECTIONS
            ========================================================================= */}
            <div className="space-y-8 pt-6">
              
              {/* 1. WHY PARTNER WITH CAB TRUST */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider border border-teal-200">
                    Mutual Growth & Impact
                  </span>
                  <h3 className="font-headline-lg text-xl sm:text-2xl font-black text-slate-900">
                    Why Partner With Cancer Aware Bharat Trust?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Collaborate with India's premier non-profit oncology advocacy network to scale patient referrals, clinical screening, and community outreach.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: UserCheck, title: 'Streamlined Patient Referrals', desc: 'Receive pre-screened, diagnosed patients directly from our regional caseworker hubs.' },
                    { icon: Calendar, title: 'Collaborative Screening Drives', desc: 'Host high-impact early detection and mammography camps in partner centers.' },
                    { icon: DollarSign, title: 'NGO Financial Aid Support', desc: 'Get direct subsidized treatment fund disbursements from CAB Trust grants.' },
                    { icon: Award, title: 'NABH Standard Accreditation', desc: 'Boost hospital brand visibility as a recognized Center of Excellence.' },
                    { icon: Users, title: 'Volunteer & CSR Network', desc: 'Engage trained medical volunteers and corporate CSR sponsorship programs.' },
                    { icon: ShieldCheck, title: 'Executive Board Representation', desc: 'Participate in quarterly clinical advisory summits with top oncologists.' },
                  ].map((b, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 hover:bg-teal-50/40 hover:border-teal-200 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#063b42] text-emerald-300 flex items-center justify-center shrink-0">
                        <b.icon className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{b.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. MINIMUM ELIGIBILITY CRITERIA */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="font-headline-lg text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-teal-600" /> Minimum Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {[
                    { title: 'Clinical Accreditation', text: 'Valid State Medical Registration or NABH accreditation for surgical/radiation facilities.' },
                    { title: 'Oncology Bed Capacity', text: 'Minimum 20 dedicated inpatient beds reserved for oncology & chemotherapy daycare.' },
                    { title: 'Licensed Specialist Staff', text: 'At least 2 full-time licensed oncologists (Medical, Surgical, or Radiation).' },
                    { title: 'Emergency Services', text: '24x7 Emergency ICU desk and diagnostic laboratory support.' },
                  ].map((el, idx) => (
                    <div key={idx} className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">{el.title}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{el.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. PARTNERSHIP TIMELINE FLOW */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="font-headline-lg text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" /> Partnership Process Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                  {[
                    { step: '1', title: 'Submit Application', desc: 'Online portal registration' },
                    { step: '2', title: 'Admin Review', desc: 'Regional coordinator review' },
                    { step: '3', title: 'Document Check', desc: 'NABH & license audit' },
                    { step: '4', title: 'Board Approval', desc: 'Super Admin clearance' },
                    { step: '5', title: 'Activated Node', desc: 'Credentials issued' },
                  ].map((t, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-center relative">
                      <div className="w-7 h-7 rounded-full bg-[#063b42] text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                        {t.step}
                      </div>
                      <p className="font-bold text-slate-900 text-xs">{t.title}</p>
                      <p className="text-[10px] text-slate-500">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. FREQUENTLY ASKED QUESTIONS */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-headline-lg text-xl font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-teal-600" /> Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {[
                    { q: 'How long does the hospital tie-up approval process take?', a: 'Under CAB Trust guidelines, regional coordinators complete initial review within 48 hours, followed by Super Admin board approval in 2-3 business days.' },
                    { q: 'Is there any fee to join the Cancer Aware Bharat hospital network?', a: 'No, hospital partnership is completely free. CAB Trust is a registered non-profit organization dedicated to facilitating cancer care.' },
                    { q: 'How are patient referrals dispatched to partner hospitals?', a: 'Once an application is approved, hospitals gain access to the Hospital Partner Dashboard where caseworkers assign pre-screened patients directly.' },
                    { q: 'How does financial aid verification work?', a: 'Hospitals submit subsidized treatment cost estimations through the dashboard, which are reviewed and funded by CAB Trust grants.' },
                  ].map((faq, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 bg-slate-50/60 hover:bg-slate-100 flex justify-between items-center cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === idx ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {expandedFaq === idx && (
                        <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. CONTACT PARTNERSHIP TEAM CARD */}
              <div className="bg-[#063b42] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 max-w-xl">
                  <h4 className="font-headline-lg text-lg sm:text-xl font-bold">Contact NGO Hospital Partnership Desk</h4>
                  <p className="text-white/80 text-xs leading-relaxed">
                    Have questions regarding clinical compliance, accreditation guidelines, or partnership SOPs? Speak directly with our executive onboarding team.
                  </p>
                </div>
                <div className="space-y-2 text-xs font-mono shrink-0">
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-300" /> partnerships@awarebharat.org</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-300" /> +91 11 4702 2200 / +91 98111 22334</p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-300" /> 09:00 AM - 06:00 PM IST (Mon - Sat)</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
