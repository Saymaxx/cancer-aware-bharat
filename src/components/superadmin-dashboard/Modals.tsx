import React from 'react';
import { X, AlertTriangle, CheckCircle2, Building2 } from 'lucide-react';
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

// 3b. APPROVE HOSPITAL MODAL -- collects the fields HospitalPartnerRequest
// never gathered but a real Hospital row requires (region/state/type/
// address/lat/lng), matching backend/app/schemas/hospital.py's
// HospitalApproveIn exactly.
export function ApproveHospitalModal({
  hospitalName,
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
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-hospital-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 my-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 id="approve-hospital-modal-title" className="text-base font-bold text-slate-900">Approve & Activate Hospital</h3>
            <p className="text-xs text-slate-500 mt-0.5">{hospitalName}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Region *</label>
              <select required value={region} onChange={e => setRegion(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs">
                <option value="">Select region</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Center Type *</label>
              <select required value={hospitalType} onChange={e => setHospitalType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs">
                <option value="">Select type</option>
                <option value="Center of Excellence">Center of Excellence</option>
                <option value="Community Partner">Community Partner</option>
              </select>
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">State *</label>
            <input required value={stateValue} onChange={e => setStateValue(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="e.g. Delhi" />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Full Address *</label>
            <input required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="Street, area, city, PIN" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Latitude *</label>
              <input required type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="e.g. 28.6139" />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Longitude *</label>
              <input required type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="e.g. 77.2090" />
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Notes (optional)</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs resize-none" placeholder="Any internal notes for this approval..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-slate-700 cursor-pointer disabled:opacity-60">
              {submitting ? 'Activating...' : 'Approve & Activate'}
            </button>
          </div>
        </form>
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
