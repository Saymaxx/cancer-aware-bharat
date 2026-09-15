import React from 'react';
import { Heart, X, CheckCircle2, AlertCircle, ShieldCheck, FileText, Eye } from 'lucide-react';
import type { Patient } from '../../adminDashboardData';
import type { Hospital, PatientEnquiry } from '../../types';

// 1. ADD / EDIT PATIENT RECORD MODAL
export function PatientModal({
  editingPatient,
  onClose,
  patientFormName,
  setPatientFormName,
  patientFormAge,
  setPatientFormAge,
  patientFormGender,
  setPatientFormGender,
  patientFormDiagnosis,
  setPatientFormDiagnosis,
  patientFormHospitalId,
  setPatientFormHospitalId,
  hospitalOptions,
  patientFormAid,
  setPatientFormAid,
  patientFormAidAmt,
  setPatientFormAidAmt,
  onSubmit,
}: {
  editingPatient: Patient | null;
  onClose: () => void;
  patientFormName: string;
  setPatientFormName: (val: string) => void;
  patientFormAge: string;
  setPatientFormAge: (val: string) => void;
  patientFormGender: 'Male' | 'Female' | 'Other';
  setPatientFormGender: (val: 'Male' | 'Female' | 'Other') => void;
  patientFormDiagnosis: string;
  setPatientFormDiagnosis: (val: string) => void;
  patientFormHospitalId: string;
  setPatientFormHospitalId: (val: string) => void;
  hospitalOptions: Hospital[];
  patientFormAid: 'Not Requested' | 'Pending Review' | 'Approved' | 'Disbursed' | 'Rejected';
  setPatientFormAid: (val: 'Not Requested' | 'Pending Review' | 'Approved' | 'Disbursed' | 'Rejected') => void;
  patientFormAidAmt: string;
  setPatientFormAidAmt: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-record-modal-title"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-outline-variant/20 text-xs">
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h3 id="patient-record-modal-title" className="font-headline-lg text-sm font-bold flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-secondary-container animate-pulse" />
            {editingPatient ? 'Edit Patient Record' : 'Add Patient Intake'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
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
                value={patientFormHospitalId}
                onChange={e => setPatientFormHospitalId(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
              >
                <option value="">Unassigned</option>
                {hospitalOptions.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                ))}
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
              onClick={onClose}
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
  );
}

// 2. ADMIN APPROVE ENQUIRY MODAL
export function ApproveEnquiryModal({
  enquiry,
  onClose,
  approveRemarks,
  setApproveRemarks,
  onApprove,
}: {
  enquiry: PatientEnquiry;
  onClose: () => void;
  approveRemarks: string;
  setApproveRemarks: (val: string) => void;
  onApprove: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-enquiry-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 id="approve-enquiry-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-container" /> Approve Patient Enquiry
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
          <p><strong className="text-slate-800">Enquiry ID:</strong> {enquiry.enquiryId}</p>
          <p><strong className="text-slate-800">Patient:</strong> {enquiry.patientName} ({enquiry.age} / {enquiry.gender})</p>
          <p><strong className="text-slate-800">Stream:</strong> {enquiry.reason}</p>
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            className="px-5 py-2 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-slate-700 shadow-sm cursor-pointer"
          >
            Approve & Forward to Super Admin
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. ADMIN REJECT ENQUIRY MODAL
export function RejectEnquiryModal({
  enquiry,
  onClose,
  rejectReasonText,
  setRejectReasonText,
  onReject,
}: {
  enquiry: PatientEnquiry;
  onClose: () => void;
  rejectReasonText: string;
  setRejectReasonText: (val: string) => void;
  onReject: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-enquiry-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 id="reject-enquiry-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" /> Reject Patient Enquiry
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
          <p><strong className="text-slate-800">Enquiry ID:</strong> {enquiry.enquiryId}</p>
          <p><strong className="text-slate-800">Patient:</strong> {enquiry.patientName}</p>
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!rejectReasonText.trim()}
            onClick={onReject}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            Reject Enquiry
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. DECLINE HOSPITAL APPLICATION MODAL
export function DeclineApplicationModal({
  onClose,
  adminDeclineReason,
  setAdminDeclineReason,
  onDecline,
}: {
  onClose: () => void;
  adminDeclineReason: string;
  setAdminDeclineReason: (val: string) => void;
  onDecline: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decline-application-modal-title"
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="decline-application-modal-title" className="font-bold text-slate-900 text-sm">Decline Hospital Tie-up Application</h3>
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
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 cursor-pointer"
          >
            Decline Application
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. REJECT VOLUNTEER MODAL
export function RejectVolunteerModal({
  onClose,
  rejectReason,
  setRejectReason,
  onReject,
}: {
  onClose: () => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  onReject: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-volunteer-modal-title"
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="reject-volunteer-modal-title" className="font-bold text-slate-900 text-sm">Reject Volunteer Application</h3>
        <p className="text-slate-600">Provide a reason explaining why this volunteer application is being rejected.</p>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rejection Reason *</label>
          <textarea
            rows={3}
            required
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
            placeholder="e.g. Unable to verify contact details..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 cursor-pointer"
          >
            Reject Volunteer
          </button>
        </div>
      </div>
    </div>
  );
}

// 5b. REJECT SURVIVOR STORY MODAL
export function RejectSurvivorStoryModal({
  onClose,
  rejectReason,
  setRejectReason,
  onReject,
}: {
  onClose: () => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  onReject: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-story-modal-title"
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="reject-story-modal-title" className="font-bold text-slate-900 text-sm">Reject Survivor Story</h3>
        <p className="text-slate-600">Optionally explain why this survivor story submission is being rejected (not published).</p>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rejection Reason (Optional)</label>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
            placeholder="e.g. Needs medical detail verification before publishing..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 cursor-pointer"
          >
            Reject Story
          </button>
        </div>
      </div>
    </div>
  );
}

export function RejectEnrollmentModal({
  onClose,
  rejectReason,
  setRejectReason,
  onReject,
}: {
  onClose: () => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  onReject: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-enrollment-modal-title"
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="reject-enrollment-modal-title" className="font-bold text-slate-900 text-sm">Reject Campaign Enrollment</h3>
        <p className="text-slate-600">Provide a reason explaining why this volunteer's campaign enrollment request is being rejected.</p>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rejection Reason *</label>
          <textarea
            rows={3}
            required
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
            placeholder="e.g. Camp is already at volunteer capacity..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 cursor-pointer"
          >
            Reject Request
          </button>
        </div>
      </div>
    </div>
  );
}

// 8. HOSPITAL DOCUMENT INSPECTION & VERIFICATION MODAL
export function HospitalDocumentInspectionModal({
  hospital,
  onClose,
  onConfirmVerify,
}: {
  hospital: {
    id: string;
    name: string;
    city: string;
    appliedDate: string;
    documentVerified: boolean;
    contactEmail: string;
    contactPhone: string;
  } | null;
  onClose: () => void;
  onConfirmVerify: (id: string) => void;
}) {
  const [selectedDocPreview, setSelectedDocPreview] = React.useState<{
    title: string;
    type: string;
    refNo: string;
    validity: string;
    issuedBy: string;
  } | null>(null);

  if (!hospital) return null;

  const documents = [
    {
      id: 'doc-nabh',
      title: 'NABH Accreditation Certificate',
      category: 'Hospital Quality Accreditation',
      fileName: `${hospital.name.replace(/\s+/g, '_')}_NABH_Cert.pdf`,
      size: '2.4 MB',
      refNo: `NABH/HOSP/${hospital.id.slice(0, 8).toUpperCase()}/2026`,
      issuedBy: 'National Accreditation Board for Hospitals & Healthcare Providers',
      validity: 'Valid through 2028',
      status: 'Uploaded',
    },
    {
      id: 'doc-license',
      title: 'State Clinical Establishment Registration',
      category: 'Statutory Health License',
      fileName: `${hospital.name.replace(/\s+/g, '_')}_Medical_License.pdf`,
      size: '1.8 MB',
      refNo: `REG-MED-${hospital.city.slice(0, 3).toUpperCase()}-2026-8812`,
      issuedBy: 'Directorate of Health Services & Medical Registration Authority',
      validity: 'Active License',
      status: 'Uploaded',
    },
    {
      id: 'doc-fire',
      title: 'Fire & Public Safety NOC Clearance',
      category: 'Safety Compliance',
      fileName: `${hospital.name.replace(/\s+/g, '_')}_Fire_NOC.pdf`,
      size: '1.1 MB',
      refNo: `FS-NOC-${hospital.city.slice(0, 3).toUpperCase()}-942`,
      issuedBy: 'State Fire & Emergency Services Department',
      validity: 'Annual Renewal Active',
      status: 'Uploaded',
    },
    {
      id: 'doc-biowaste',
      title: 'Bio-Medical Waste Management Authorization',
      category: 'Environmental Compliance',
      fileName: `${hospital.name.replace(/\s+/g, '_')}_BioWaste_Cert.pdf`,
      size: '980 KB',
      refNo: `SPCB-BMW-2026-${hospital.id.slice(0, 4).toUpperCase()}`,
      issuedBy: 'State Pollution Control Board',
      validity: 'Compliance Certified',
      status: 'Uploaded',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-doc-modal-title"
    >
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-xs flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0E3B36] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#E8A23A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="hospital-doc-modal-title" className="font-serif text-base font-bold text-white">
                Hospital Accreditation Document Verification
              </h3>
              <p className="text-[10px] text-white/70">
                {hospital.name} • {hospital.city} • Applied: {hospital.appliedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Hospital Overview Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospital Node</p>
              <p className="font-bold text-slate-900 mt-0.5">{hospital.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Email</p>
              <p className="font-semibold text-slate-700 mt-0.5 truncate">{hospital.contactEmail}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Status</p>
              <p className="mt-0.5">
                {hospital.documentVerified ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Documents Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Admin Review
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Document Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Submitted Accreditation & Statutory Documents ({documents.length})
              </h4>
              <span className="text-[10px] text-slate-500">Click &quot;Inspect Preview&quot; to review certificate details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 hover:border-[#0E3B36]/40 rounded-2xl p-4 space-y-2.5 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0E3B36]/10 flex items-center justify-center text-[#0E3B36] font-bold shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs line-clamp-1">{doc.title}</p>
                        <p className="text-[10px] text-slate-400">{doc.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2 font-mono text-[10px] space-y-1 text-slate-600">
                    <p className="truncate"><span className="text-slate-400">File:</span> {doc.fileName}</p>
                    <p><span className="text-slate-400">Size:</span> {doc.size} • <span className="text-emerald-700 font-bold">Uploaded ✓</span></p>
                    <p className="truncate"><span className="text-slate-400">Ref:</span> {doc.refNo}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDocPreview({
                        title: doc.title,
                        type: doc.category,
                        refNo: doc.refNo,
                        validity: doc.validity,
                        issuedBy: doc.issuedBy,
                      })}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-[#0E3B36] hover:text-white rounded-lg text-[10px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded / Selected Document Preview Modal Simulation */}
          {selectedDocPreview && (
            <div className="bg-[#1B2620] text-white p-5 rounded-2xl border border-[#0E3B36] space-y-3 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E8A23A]" />
                  <span className="font-bold text-xs text-white">Document Viewer: {selectedDocPreview.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDocPreview(null)}
                  className="text-white/60 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close Preview
                </button>
              </div>

              <div className="bg-white text-slate-900 p-5 rounded-xl border-2 border-slate-300 space-y-3 shadow-inner">
                <div className="text-center border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Official Certified Document</span>
                  <h4 className="font-serif font-bold text-sm text-[#0E3B36] mt-0.5">{selectedDocPreview.title}</h4>
                  <p className="text-[10px] text-slate-500">{selectedDocPreview.issuedBy}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                  <p><strong>Hospital Entity:</strong> {hospital.name}</p>
                  <p><strong>City / Jurisdiction:</strong> {hospital.city}</p>
                  <p><strong>Registration ID:</strong> {selectedDocPreview.refNo}</p>
                  <p><strong>Validity Status:</strong> <span className="text-emerald-700 font-bold">{selectedDocPreview.validity}</span></p>
                </div>

                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[10px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Digital seal & statutory medical registry verification valid. Ready for Regional Coordinator endorsement.</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-slate-500">
            {hospital.documentVerified
              ? '✓ Accreditation verified. You can now recommend this hospital to Super Admin.'
              : 'Verifying unlocks the "Recommend to Super Admin" action for this hospital.'
            }
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-white cursor-pointer"
            >
              Close
            </button>
            
            {!hospital.documentVerified ? (
              <button
                type="button"
                onClick={() => {
                  onConfirmVerify(hospital.id);
                  onClose();
                }}
                className="flex-1 sm:flex-initial px-5 py-2 bg-[#0E3B36] hover:bg-[#154f49] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#E8A23A]" />
                <span>Verify & Confirm Documents</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold text-xs opacity-90 cursor-default flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Documents Verified ✓</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

