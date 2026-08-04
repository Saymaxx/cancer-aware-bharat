import { Crown, Search, MapPin, Mail, Building2, Calendar, Check, Clock, X, MessageSquare } from 'lucide-react';
import type { HospitalApplication } from '../../superAdminDashboardData';

export default function HospitalsTab({
  searchTerm,
  setSearchTerm,
  hospitalFilter,
  setHospitalFilter,
  filteredHospitals,
  hospitalStatusBadge,
  approveHospital,
  setShowRejectDialog,
  requestMoreInfo,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  hospitalFilter: string;
  setHospitalFilter: (val: string) => void;
  filteredHospitals: HospitalApplication[];
  hospitalStatusBadge: (s: string) => string;
  approveHospital: (id: string) => void;
  setShowRejectDialog: (id: string | null) => void;
  requestMoreInfo: (id: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-2xl text-xs flex items-start gap-3">
        <Crown className="w-5 h-5 shrink-0 text-purple-600 mt-0.5" />
        <div>
          <p className="font-bold">Super Admin Executive Authority — Hospital Partnership Approvals & Tie-ups</p>
          <p className="text-purple-800/85 mt-0.5">As Super Admin, you hold executive authority to <strong>Approve & Activate</strong> or <strong>Reject</strong> hospital tie-ups nationwide as soon as they arrive — no Admin recommendation is required first, though Admin's document review notes will show here if one was submitted.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search hospital applications..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Pending Review', 'Recommended by Admin', 'Info Requested', 'Approved', 'Rejected'].map(f => (
            <button key={f} onClick={() => setHospitalFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${hospitalFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Hospital Cards */}
      <div className="space-y-4">
        {filteredHospitals.map(hosp => (
          <div key={hosp.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${hospitalStatusBadge(hosp.status)}`}>{hosp.status}</span>
                  {hosp.nabhAccredited && <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200">✓ NABH Accredited</span>}
                </div>
                <h3 className="text-base font-bold text-slate-900">{hosp.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{hosp.address}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-[11px] text-slate-600">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {hosp.city}, {hosp.state}</p>
                  <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {hosp.contactEmail}</p>
                  <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-indigo-500" /> {hosp.bedCount} beds</p>
                  <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Applied: {hosp.appliedDate}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hosp.specialties.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">{s}</span>
                  ))}
                </div>

                {/* Documents */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Submitted Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {hosp.documents.map((doc, di) => (
                      <span key={di} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 ${doc.verified ? 'bg-slate-50 text-slate-700 border border-slate-200' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                        {doc.verified ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {doc.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Admin recommendation */}
                {hosp.recommendedBy && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-primary-container uppercase tracking-wider mb-1">Regional Admin Recommendation</p>
                    <p className="text-xs text-slate-800 font-semibold">Submitted by: {hosp.recommendedBy}</p>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{hosp.recommendationNotes}</p>
                  </div>
                )}

                {/* Generated credentials display */}
                {hosp.generatedCredentials && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Hospital Tie-up Active — Login Credentials Generated</p>
                    <p className="text-xs text-slate-800 font-mono">Email: {hosp.generatedCredentials.email}</p>
                    <p className="text-xs text-slate-800 font-mono">Temp Password: {hosp.generatedCredentials.tempPassword}</p>
                  </div>
                )}

                {/* Rejection reason */}
                {hosp.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Application Rejected</p>
                    <p className="text-xs text-red-700">{hosp.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Super Admin Executive Approval Actions */}
              {(hosp.status === 'Pending Review' || hosp.status === 'Recommended by Admin' || hosp.status === 'Info Requested') && (
                <div className="flex flex-col gap-2 shrink-0 lg:w-48">
                  <button onClick={() => approveHospital(hosp.id)} className="w-full py-2 bg-primary-container text-white rounded-xl text-xs font-bold hover:bg-slate-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Approve & Activate
                  </button>
                  <button onClick={() => setShowRejectDialog(hosp.id)} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center justify-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Reject Tie-Up
                  </button>
                  <button onClick={() => requestMoreInfo(hosp.id)} className="w-full py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 cursor-pointer flex items-center justify-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Request Info
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
