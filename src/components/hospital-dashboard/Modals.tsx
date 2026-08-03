import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import type {
  AssignedPatient, NgoReferral, HospitalDoctor, FinancialAidVerification,
} from '../../hospitalDashboardData';
import type { PatientEnquiry } from '../../types';

// 1. VIEW PATIENT PROFILE MODAL
export function PatientProfileModal({
  patient,
  doctors,
  onClose,
  editStatus,
  setEditStatus,
  editCancerStage,
  setEditCancerStage,
  editDoctorId,
  setEditDoctorId,
  editAdmissionDate,
  setEditAdmissionDate,
  editRemarks,
  setEditRemarks,
  editEstimatedCost,
  setEditEstimatedCost,
  onSubmit,
}: {
  patient: AssignedPatient;
  doctors: HospitalDoctor[];
  onClose: () => void;
  editStatus: AssignedPatient['treatmentStatus'];
  setEditStatus: (val: AssignedPatient['treatmentStatus']) => void;
  editCancerStage: string;
  setEditCancerStage: (val: string) => void;
  editDoctorId: string;
  setEditDoctorId: (val: string) => void;
  editAdmissionDate: string;
  setEditAdmissionDate: (val: string) => void;
  editRemarks: string;
  setEditRemarks: (val: string) => void;
  editEstimatedCost: string;
  setEditEstimatedCost: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-profile-modal-title"
    >
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#063b42] text-white px-6 py-4 flex justify-between items-center">
          <span id="patient-profile-modal-title" className="font-bold text-sm">Patient Clinical Profile — {patient.name}</span>
          <button onClick={onClose} aria-label="Close" className="text-white/70 hover:text-white">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p><strong>NGO Ref:</strong> {patient.ngoRefId || '—'}</p>
            <p><strong>Age / Gender:</strong> {patient.age} / {patient.gender}</p>
            <p className="col-span-2"><strong>Diagnosis:</strong> {patient.diagnosis}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Cancer Stage</label>
              <input type="text" value={editCancerStage} onChange={e => setEditCancerStage(e.target.value)} placeholder="e.g. Stage IIB" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Admission Date</label>
              <input type="date" value={editAdmissionDate} onChange={e => setEditAdmissionDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assigned Doctor</label>
            <select
              value={editDoctorId}
              onChange={e => setEditDoctorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs"
            >
              <option value="">Unassigned</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Estimated Treatment Cost (INR)</label>
            <input type="number" min="0" value={editEstimatedCost} onChange={e => setEditEstimatedCost(e.target.value)} placeholder="e.g. 180000" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs" />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Update Patient Treatment Status</label>
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value as AssignedPatient['treatmentStatus'])}
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
              value={editRemarks}
              onChange={e => setEditRemarks(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. REFERRAL ACCEPT / DECLINE MODAL
export function ReferralModal({
  referral,
  onClose,
  declineReasonText,
  setDeclineReasonText,
  onAccept,
  onDecline,
}: {
  referral: NgoReferral;
  onClose: () => void;
  declineReasonText: string;
  setDeclineReasonText: (val: string) => void;
  onAccept: (refId: string) => void;
  onDecline: (refId: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="referral-modal-title"
    >
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="referral-modal-title" className="font-bold text-slate-900 text-sm">Evaluate NGO Patient Referral — {referral.patientName}</h3>
        <p className="text-slate-600">Diagnosis: <strong>{referral.cancerType}</strong> • Priority: <strong>{referral.priority}</strong></p>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">If Declining, Provide Reason Notes</label>
          <textarea rows={2} value={declineReasonText} onChange={e => setDeclineReasonText(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="e.g. Department at maximum bed capacity..." />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={() => onDecline(referral.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 cursor-pointer">Decline Referral</button>
          <button onClick={() => onAccept(referral.id)} className="flex-1 py-2.5 bg-primary-container text-white font-bold rounded-xl hover:bg-slate-700 cursor-pointer">Accept Referral</button>
        </div>
      </div>
    </div>
  );
}

// 3. ADD DOCTOR MODAL
export function AddDoctorModal({
  onClose,
  docName,
  setDocName,
  docSpecialty,
  setDocSpecialty,
  docQual,
  setDocQual,
  docExp,
  setDocExp,
  docPhone,
  setDocPhone,
  docEmail,
  setDocEmail,
  onSubmit,
}: {
  onClose: () => void;
  docName: string;
  setDocName: (val: string) => void;
  docSpecialty: string;
  setDocSpecialty: (val: string) => void;
  docQual: string;
  setDocQual: (val: string) => void;
  docExp: string;
  setDocExp: (val: string) => void;
  docPhone: string;
  setDocPhone: (val: string) => void;
  docEmail: string;
  setDocEmail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-doctor-modal-title"
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="add-doctor-modal-title" className="font-bold text-slate-900 text-sm">Add Oncologist to Hospital Directory</h3>
        <form onSubmit={onSubmit} className="space-y-3">
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
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone *</label>
            <input type="tel" required value={docPhone} onChange={e => setDocPhone(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="+91 98000 11122" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email *</label>
            <input type="email" required value={docEmail} onChange={e => setDocEmail(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" placeholder="doctor@hospital.org" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold">Save Doctor</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. UPLOAD MEDICAL REPORT MODAL
export function UploadReportModal({
  onClose,
  patients,
  doctors,
  reportPatientId,
  setReportPatientId,
  reportType,
  setReportType,
  reportDoctorId,
  setReportDoctorId,
  reportFile,
  setReportFile,
  onSubmit,
}: {
  onClose: () => void;
  patients: AssignedPatient[];
  doctors: HospitalDoctor[];
  reportPatientId: string;
  setReportPatientId: (val: string) => void;
  reportType: 'Prescription' | 'Lab Test' | 'Biopsy' | 'CT/MRI Scan' | 'Discharge Summary';
  setReportType: (val: 'Prescription' | 'Lab Test' | 'Biopsy' | 'CT/MRI Scan' | 'Discharge Summary') => void;
  reportDoctorId: string;
  setReportDoctorId: (val: string) => void;
  reportFile: File | null;
  setReportFile: (val: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-report-modal-title"
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="upload-report-modal-title" className="font-bold text-slate-900 text-sm">Upload Patient Medical Document</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Patient</label>
            <select value={reportPatientId} onChange={e => setReportPatientId(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <option value="">Select a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.ngoRefId || p.id.slice(0, 8)})</option>
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
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Uploaded By Doctor</label>
            <select value={reportDoctorId} onChange={e => setReportDoctorId(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <option value="">Unspecified</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Document File (PDF, JPEG, or PNG) *</label>
            <input
              type="file"
              required
              accept="application/pdf,image/jpeg,image/png"
              onChange={e => setReportFile(e.target.files?.[0] || null)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold">Upload Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 5. VERIFY COST ESTIMATE MODAL
export function VerifyCostModal({
  verification,
  onClose,
  verifiedCostInput,
  setVerifiedCostInput,
  onSubmit,
}: {
  verification: FinancialAidVerification;
  onClose: () => void;
  verifiedCostInput: string;
  setVerifiedCostInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-cost-modal-title"
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
        <h3 id="verify-cost-modal-title" className="font-bold text-slate-900 text-sm">Verify Financial Aid Treatment Cost</h3>
        <p className="text-slate-600">Patient: <strong>{verification.patientName}</strong> • NGO Est: <strong>₹{verification.estimatedCost.toLocaleString()}</strong></p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Hospital Verified Subsidized Treatment Cost (INR)</label>
            <input type="number" required value={verifiedCostInput} onChange={e => setVerifiedCostInput(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs" placeholder="150000" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-primary-container text-white rounded-xl font-bold">Submit Verification</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 6. ACCEPT PATIENT MODAL (Auto Appointment Creation)
export function AcceptPatientModal({
  enquiry,
  onClose,
  acceptDate,
  setAcceptDate,
  acceptTime,
  setAcceptTime,
  acceptDoctor,
  setAcceptDoctor,
  acceptRemarks,
  setAcceptRemarks,
  onAccept,
}: {
  enquiry: PatientEnquiry;
  onClose: () => void;
  acceptDate: string;
  setAcceptDate: (val: string) => void;
  acceptTime: string;
  setAcceptTime: (val: string) => void;
  acceptDoctor: string;
  setAcceptDoctor: (val: string) => void;
  acceptRemarks: string;
  setAcceptRemarks: (val: string) => void;
  onAccept: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accept-patient-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 id="accept-patient-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-container" /> Accept Patient & Schedule Appointment
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <p><strong className="text-slate-900">Enquiry ID:</strong> {enquiry.enquiryId} (Ref: {enquiry.referenceNumber})</p>
          <p><strong className="text-slate-900">Patient:</strong> {enquiry.patientName} ({enquiry.age} yrs / {enquiry.gender})</p>
          <p><strong className="text-slate-900">Location:</strong> {enquiry.city} | <strong>Phone:</strong> {enquiry.phone}</p>
          <p><strong className="text-slate-900">Stream:</strong> {enquiry.reason} ({enquiry.cancerType || 'General'})</p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={acceptDate}
                onChange={e => setAcceptDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-primary-container outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Appointment Slot / Time <span className="text-red-500">*</span>
              </label>
              <select
                value={acceptTime}
                onChange={e => setAcceptTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-primary-container outline-none"
              >
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Assigned Oncologist / Specialist Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={acceptDoctor}
              onChange={e => setAcceptDoctor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-primary-container outline-none"
            >
              <option value="Dr. Siddharth Roy (Surgical Oncology)">Dr. Siddharth Roy (Surgical Oncology)</option>
              <option value="Dr. Ananya Sen (Radiation Oncology)">Dr. Ananya Sen (Radiation Oncology)</option>
              <option value="Dr. Vikram Seth (Medical Oncology)">Dr. Vikram Seth (Medical Oncology)</option>
              <option value="Dr. Priya Nair (Gynecologic Oncology)">Dr. Priya Nair (Gynecologic Oncology)</option>
              <option value="Oncology OPD Resident Doctor">Oncology OPD Resident Doctor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Clinical Remarks / Instructions for Patient (Optional)
            </label>
            <textarea
              rows={2}
              value={acceptRemarks}
              onChange={e => setAcceptRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-primary-container outline-none"
              placeholder="e.g. Please bring all past biopsy reports and arrive 15 minutes before slot..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2 bg-primary-container hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept & Create Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 7. DECLINE PATIENT MODAL
export function DeclinePatientModal({
  enquiry,
  onClose,
  hospitalDeclineReasonText,
  setHospitalDeclineReasonText,
  onDecline,
}: {
  enquiry: PatientEnquiry;
  onClose: () => void;
  hospitalDeclineReasonText: string;
  setHospitalDeclineReasonText: (val: string) => void;
  onDecline: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decline-patient-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 id="decline-patient-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" /> Decline Patient Referral
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
          <p><strong className="text-slate-800">Enquiry ID:</strong> {enquiry.enquiryId}</p>
          <p><strong className="text-slate-800">Patient:</strong> {enquiry.patientName}</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Decline Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={hospitalDeclineReasonText}
            onChange={e => setHospitalDeclineReasonText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-red-500 outline-none"
            placeholder="State reason for declining referral..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!hospitalDeclineReasonText.trim()}
            onClick={onDecline}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
          >
            Decline & Return to Super Admin
          </button>
        </div>
      </div>
    </div>
  );
}

// 8. MARK TREATMENT COMPLETED MODAL
export function CompleteTreatmentModal({
  enquiry,
  onClose,
  completeRemarksText,
  setCompleteRemarksText,
  onComplete,
}: {
  enquiry: PatientEnquiry;
  onClose: () => void;
  completeRemarksText: string;
  setCompleteRemarksText: (val: string) => void;
  onComplete: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-treatment-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 id="complete-treatment-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> Mark Treatment Completed
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
          <p><strong className="text-slate-800">Enquiry ID:</strong> {enquiry.enquiryId}</p>
          <p><strong className="text-slate-800">Patient:</strong> {enquiry.patientName}</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Closing Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={completeRemarksText}
            onChange={e => setCompleteRemarksText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-primary outline-none"
            placeholder="e.g. Treatment course completed, patient discharged in stable condition."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
          >
            Mark Completed
          </button>
        </div>
      </div>
    </div>
  );
}
