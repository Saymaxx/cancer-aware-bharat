import React from 'react';
import { Heart, X, CheckCircle2, AlertCircle } from 'lucide-react';
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
