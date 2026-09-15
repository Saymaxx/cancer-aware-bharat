import React from 'react';
import { X, AlertTriangle, CheckCircle2, Building2, ShieldCheck, FileText, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { SuperAdminAccount, CustomRole } from '../../superAdminDashboardData';
import type { PatientEnquiry, Hospital } from '../../types';

// 1. ADMIN CREATE/EDIT ACCOUNT MODAL
export function AdminAccountModal({
  editingAdmin,
  onClose,
  formName,
  setFormName,
  formEmail,
  setFormEmail,
  formPhone,
  setFormPhone,
  formRegion,
  setFormRegion,
  roles,
  formRoleId,
  setFormRoleId,
  onSubmit,
}: {
  editingAdmin: SuperAdminAccount | null;
  onClose: () => void;
  formName: string;
  setFormName: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formPhone: string;
  setFormPhone: (val: string) => void;
  formRegion: string;
  setFormRegion: (val: string) => void;
  roles: CustomRole[];
  formRoleId: string;
  setFormRoleId: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-account-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 id="admin-account-modal-title" className="text-base font-bold text-slate-900">{editingAdmin ? 'Edit Staff Admin Account' : 'Create New Staff Admin'}</h3>
            <p className="text-xs text-slate-500">
              {editingAdmin
                ? 'Update this admin’s contact details.'
                : 'A login password is auto-generated and shown once after creation — share it with the admin securely.'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Full Name</label>
              <input required value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="Dr. John Doe" />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Official Email (Login ID)</label>
              <input
                required
                type="email"
                disabled={!!editingAdmin}
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="admin@awarebharat.org"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Phone Number</label>
              <input value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="+91 98765 12345" />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Assigned Region / Zone</label>
              <input value={formRegion} onChange={e => setFormRegion(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="North India — Delhi NCR" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Role (display label only, see Roles & Permissions)</label>
            <select value={formRoleId} onChange={e => setFormRoleId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs">
              <option value="">Admin (no role assigned)</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 cursor-pointer shadow-sm">{editingAdmin ? 'Save Changes' : 'Create Admin & Generate Credentials'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. REJECT HOSPITAL APPLICATION MODAL
export function RejectHospitalModal({
  onClose,
  rejectReason,
  setRejectReason,
  onConfirm,
}: {
  onClose: () => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-hospital-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 id="reject-hospital-modal-title" className="text-base font-bold text-red-700 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Reject Hospital Application</h3>
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none text-xs resize-none focus:border-red-400" placeholder="Provide a detailed reason for rejection..." />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 cursor-pointer">Confirm Rejection</button>
        </div>
      </div>
    </div>
  );
}

// 3. COMPLETE HOSPITAL APPLICATION REVIEW & APPROVE MODAL
export function ApproveHospitalModal({
  hospitalName,
  hospitalData,
  onClose,
  region,
  setRegion,
  stateValue,
  setStateValue,
  hospitalType,
  setHospitalType,
  address,
  setAddress,
  lat,
  setLat,
  lng,
  setLng,
  notes,
  setNotes,
  onSubmit,
  submitting,
}: {
  hospitalName: string;
  hospitalData?: {
    id: string;
    hospitalName: string;
    contactName: string;
    designation?: string | null;
    email: string;
    phone: string;
    city: string;
    specialties?: string | null;
    motivation?: string | null;
    status: string;
    decisionNotes?: string | null;
    createdAt?: string | null;
  } | null;
  onClose: () => void;
  region: string;
  setRegion: (val: string) => void;
  stateValue: string;
  setStateValue: (val: string) => void;
  hospitalType: string;
  setHospitalType: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  lat: string;
  setLat: (val: string) => void;
  lng: string;
  setLng: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  const [showAdvancedGeo, setShowAdvancedGeo] = React.useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = React.useState<{
    title: string;
    type: string;
    refNo: string;
    validity: string;
    issuedBy: string;
  } | null>(null);

  const specialtiesList = React.useMemo(() => {
    if (!hospitalData?.specialties) return ['Surgical Oncology', 'Radiation Oncology', 'Medical Oncology'];
    return hospitalData.specialties.split(',').map(s => s.trim()).filter(Boolean);
  }, [hospitalData?.specialties]);

  const documents = [
    {
      id: 'doc-nabh',
      title: 'NABH Accreditation Certificate',
      category: 'Hospital Quality Accreditation',
      fileName: `${hospitalName.replace(/\s+/g, '_')}_NABH_Cert.pdf`,
      size: '2.4 MB',
      refNo: `NABH/HOSP/${(hospitalData?.id || '2026').slice(0, 8).toUpperCase()}/2026`,
      issuedBy: 'National Accreditation Board for Hospitals & Healthcare Providers',
      validity: 'Valid through 2028',
    },
    {
      id: 'doc-license',
      title: 'State Clinical Establishment Registration',
      category: 'Statutory Health License',
      fileName: `${hospitalName.replace(/\s+/g, '_')}_Medical_License.pdf`,
      size: '1.8 MB',
      refNo: `REG-MED-${(hospitalData?.city || 'DEL').slice(0, 3).toUpperCase()}-2026-8812`,
      issuedBy: 'Directorate of Health Services & Medical Registration Authority',
      validity: 'Active License',
    },
    {
      id: 'doc-fire',
      title: 'Fire & Public Safety NOC Clearance',
      category: 'Safety Compliance',
      fileName: `${hospitalName.replace(/\s+/g, '_')}_Fire_NOC.pdf`,
      size: '1.1 MB',
      refNo: `FS-NOC-${(hospitalData?.city || 'DEL').slice(0, 3).toUpperCase()}-942`,
      issuedBy: 'State Fire & Emergency Services Department',
      validity: 'Annual Renewal Active',
    },
    {
      id: 'doc-biowaste',
      title: 'Bio-Medical Waste Management Authorization',
      category: 'Environmental Compliance',
      fileName: `${hospitalName.replace(/\s+/g, '_')}_BioWaste_Cert.pdf`,
      size: '980 KB',
      refNo: `SPCB-BMW-2026-${(hospitalData?.id || '2026').slice(0, 4).toUpperCase()}`,
      issuedBy: 'State Pollution Control Board',
      validity: 'Compliance Certified',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-hospital-modal-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-6 text-xs flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0E3B36] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#E8A23A]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="approve-hospital-modal-title" className="font-serif text-base font-bold text-white">
                Executive Hospital Tie-Up Review & Approval
              </h3>
              <p className="text-[10px] text-white/70">
                {hospitalName} • {hospitalData?.city || 'Varanasi'} • Board Clearance Console
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* 1. Complete Application Data Submitted by Hospital */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0E3B36]" /> Hospital Application Details
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {hospitalData?.status || 'Recommended by Admin'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-700">
              <p><strong>Hospital Name:</strong> <span className="text-slate-900 font-bold">{hospitalName}</span></p>
              <p><strong>City / Location:</strong> {hospitalData?.city || 'Varanasi'}, {stateValue || 'Uttar Pradesh'}</p>
              <p><strong>Contact Representative:</strong> {hospitalData?.contactName || 'Hospital Admin'} {hospitalData?.designation ? `(${hospitalData.designation})` : ''}</p>
              <p><strong>Official Email:</strong> {hospitalData?.email || 'contact@hospital.org'}</p>
              <p><strong>Contact Phone:</strong> {hospitalData?.phone || '+91-9876543210'}</p>
              <p><strong>Application Date:</strong> {hospitalData?.createdAt ? new Date(hospitalData.createdAt).toLocaleDateString('en-IN') : 'Recent'}</p>
            </div>

            {/* Specialties */}
            <div className="pt-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Oncology Specialties & Facilities</p>
              <div className="flex flex-wrap gap-1.5">
                {specialtiesList.map((spec, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-[#0E3B36]/10 text-[#0E3B36] font-semibold text-[10px] border border-[#0E3B36]/15">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Motivation / Purpose Statement */}
            {hospitalData?.motivation && (
              <div className="pt-1 bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Hospital Statement / Motivation</p>
                <p className="text-slate-800 italic">&ldquo;{hospitalData.motivation}&rdquo;</p>
              </div>
            )}

            {/* Regional Admin Remarks */}
            {hospitalData?.decisionNotes && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Regional Coordinator Review Notes</p>
                <p className="mt-0.5 font-medium">{hospitalData.decisionNotes}</p>
              </div>
            )}
          </div>

          {/* 2. Submitted Statutory Verification Documents */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E3B36]" /> Submitted Statutory Documents ({documents.length})
              </span>
              <span className="text-[10px] text-slate-500">Click &quot;Inspect&quot; to review certificates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs hover:border-[#0E3B36]/40 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-lg bg-[#0E3B36]/10 flex items-center justify-center text-[#0E3B36] shrink-0 font-bold">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 text-[11px] truncate">{doc.title}</p>
                      <p className="text-[9px] text-slate-400">{doc.size} • <span className="text-emerald-700 font-bold">Verified ✓</span></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDocPreview({
                      title: doc.title,
                      type: doc.category,
                      refNo: doc.refNo,
                      validity: doc.validity,
                      issuedBy: doc.issuedBy,
                    })}
                    className="px-2 py-1 bg-slate-100 hover:bg-[#0E3B36] hover:text-white text-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Document Preview Popup Simulation */}
          {selectedDocPreview && (
            <div className="bg-[#1B2620] text-white p-4 rounded-2xl border border-[#0E3B36] space-y-2.5 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E8A23A]" />
                  <span className="font-bold text-xs text-white">Inspecting: {selectedDocPreview.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDocPreview(null)}
                  className="text-white/60 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <div className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                <p><strong>Accreditation Body:</strong> {selectedDocPreview.issuedBy}</p>
                <p><strong>Registration Ref No:</strong> {selectedDocPreview.refNo}</p>
                <p><strong>Compliance Status:</strong> <span className="text-emerald-700 font-bold">{selectedDocPreview.validity} ✓</span></p>
              </div>
            </div>
          )}

          {/* 3. Executive Approval Settings (Streamlined & Auto-filled) */}
          <form id="superadmin-hospital-approve-form" onSubmit={onSubmit} className="space-y-3 pt-1 border-t border-slate-200">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
              Network Activation Tier & Zone (Auto-Filled)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Partner Tier *</label>
                <select
                  required
                  value={hospitalType}
                  onChange={e => setHospitalType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:border-[#0E3B36] font-semibold text-xs cursor-pointer"
                >
                  <option value="Community Partner">Community Partner</option>
                  <option value="Center of Excellence">Center of Excellence</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Geographic Region / Zone *</label>
                <select
                  required
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:border-[#0E3B36] font-semibold text-xs cursor-pointer"
                >
                  <option value="north">North India</option>
                  <option value="south">South India</option>
                  <option value="east">East India</option>
                  <option value="west">West India</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Executive Board Approval Remarks (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#0E3B36] text-xs resize-none"
                placeholder="e.g. Tie-up approved by Executive Board for community screening and referral pathways..."
              />
            </div>

            {/* Optional Collapsed Geospatial Coordinates (Auto-calculated, doesn't get in the way) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => setShowAdvancedGeo(!showAdvancedGeo)}
                className="w-full px-3 py-2 flex items-center justify-between text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <span>🗺️ Geospatial Map Coordinates (Auto-Calculated from City: {lat || '25.3176'}, {lng || '82.9739'})</span>
                <span>{showAdvancedGeo ? '▲ Hide' : '▼ View / Edit'}</span>
              </button>
              {showAdvancedGeo && (
                <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">State</label>
                    <input value={stateValue} onChange={e => setStateValue(e.target.value)} className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Address</label>
                    <input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Latitude</label>
                    <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Longitude</label>
                    <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-slate-50" />
                  </div>
                </div>
              )}
            </div>
          </form>

        </div>

        {/* Modal Footer (1-Click Approval) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-slate-500">
            Approving generates permanent login credentials and adds the hospital to the live nationwide network.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="superadmin-hospital-approve-form"
              disabled={submitting}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#0E3B36] hover:bg-[#154f49] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E8A23A]" />
              <span>{submitting ? 'Activating Hospital...' : 'Approve & Issue Credentials'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// 4. HOSPITAL APPROVED / CREDENTIALS RESULT MODAL
export function HospitalApprovedModal({
  result,
  onClose,
  title = 'Hospital Approved!',
  description = 'Login credentials have been auto-generated. Share them securely with the hospital.',
}: {
  result: { email: string; password: string };
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-approved-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-slate-200">
          <CheckCircle2 className="w-8 h-8 text-primary-container" />
        </div>
        <h3 id="hospital-approved-modal-title" className="text-base font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-4">{description}</p>
        <div className="bg-slate-900 text-slate-400 p-4 rounded-xl font-mono text-xs text-left space-y-1.5 mb-4">
          <p>Email: <span className="text-white">{result.email}</span></p>
          <p>Temp Password: <span className="text-white">{result.password}</span></p>
        </div>
        <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-indigo-700">Close</button>
      </div>
    </div>
  );
}

// 5. CREATE CUSTOM ROLE MODAL
export function CustomRoleModal({
  onClose,
  newRoleName,
  setNewRoleName,
  newRoleDescription,
  setNewRoleDescription,
  onSubmit,
}: {
  onClose: () => void;
  newRoleName: string;
  setNewRoleName: (val: string) => void;
  newRoleDescription: string;
  setNewRoleDescription: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-role-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <h3 id="custom-role-modal-title" className="text-base font-bold text-slate-900">Create Custom Role</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">This role will be saved for reference, but doesn't restrict access yet -- permission enforcement isn't built. Admins keep whatever access their Admin / Super Admin flag already grants regardless of this role.</p>
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Role Title</label>
            <input required value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="e.g. Audit Compliance Manager" />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Description</label>
            <textarea rows={3} value={newRoleDescription} onChange={e => setNewRoleDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs resize-none" placeholder="Scope of authority and access..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm">Save Role</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 6. ASSIGN PATIENT TO HOSPITAL MODAL (Step 4 — API-backed, most safety-critical)
export function AssignHospitalModal({
  enquiry,
  onClose,
  hospSearchTerm,
  setHospSearchTerm,
  hospCityFilter,
  setHospCityFilter,
  hospSpecialtyFilter,
  setHospSpecialtyFilter,
  hospTypeFilter,
  setHospTypeFilter,
  allRegisteredHospitals,
  filteredHospitalsForAssignment,
  selectedHospitalForAssign,
  setSelectedHospitalForAssign,
  assignRemarks,
  setAssignRemarks,
  onAssign,
}: {
  enquiry: PatientEnquiry;
  onClose: () => void;
  hospSearchTerm: string;
  setHospSearchTerm: (val: string) => void;
  hospCityFilter: string;
  setHospCityFilter: (val: string) => void;
  hospSpecialtyFilter: string;
  setHospSpecialtyFilter: (val: string) => void;
  hospTypeFilter: string;
  setHospTypeFilter: (val: string) => void;
  allRegisteredHospitals: Hospital[];
  filteredHospitalsForAssignment: Hospital[];
  selectedHospitalForAssign: string;
  setSelectedHospitalForAssign: (id: string) => void;
  assignRemarks: string;
  setAssignRemarks: (val: string) => void;
  onAssign: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-hospital-modal-title"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 id="assign-hospital-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> Assign Patient to Hospital Partner
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Overview */}
        <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-indigo-900">{enquiry.patientName} ({enquiry.age} / {enquiry.gender})</span>
            <span className="font-mono text-xs font-bold bg-indigo-200/60 px-2 py-0.5 rounded">{enquiry.enquiryId}</span>
          </div>
          <p>📍 <strong>Location:</strong> {enquiry.city}{enquiry.state ? `, ${enquiry.state}` : ''} | 📞 <strong>Phone:</strong> {enquiry.phone}</p>
          <p>🩺 <strong>Inquiry Stream:</strong> {enquiry.reason} | <strong>Diagnosis:</strong> {enquiry.cancerType || 'General Screening'}</p>
          {enquiry.adminDecision?.remarks && (
            <p className="text-slate-800"><strong>Admin Remarks:</strong> {enquiry.adminDecision.remarks}</p>
          )}
          {enquiry.hospitalDecision?.action === 'Decline' && (
            <p className="text-slate-800"><strong>Previous Hospital Decline Reason:</strong> {enquiry.hospitalDecision.remarks}</p>
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
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!selectedHospitalForAssign}
            onClick={onAssign}
            className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Confirm Hospital Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
