import { Crown, Search, MapPin, Mail, Building2, Calendar, Check, Clock, X, MessageSquare, CheckCircle2, ExternalLink, KeyRound } from 'lucide-react';
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
  reissueCredentials,
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
  reissueCredentials?: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-4 flex items-start gap-3">
        <Crown className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Super Admin Executive Authority — Hospital Partnership Approvals &amp; Tie-ups</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            As Super Admin, you hold executive authority to <strong>Approve &amp; Activate</strong> or <strong>Reject</strong> hospital tie-ups nationwide as soon as they arrive — no Admin recommendation is required first, though Admin&apos;s document review notes will show here if one was submitted.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hospital applications..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Pending Review', 'Recommended by Admin', 'Info Requested', 'Approved', 'Rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setHospitalFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                hospitalFilter === filter ? 'bg-primary-container text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredHospitals.map(hosp => (
          <div key={hosp.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${hospitalStatusBadge(hosp.status)}`}>
                    {hosp.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{hosp.name}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500 mt-3">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {hosp.city}, {hosp.state}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {hosp.contactEmail}</span>
                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {hosp.bedCount} beds</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Applied: {hosp.appliedDate}</span>
                </div>

                {/* Specialties */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hosp.specialties.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Admin recommendation */}
                {hosp.recommendedBy && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-primary-container uppercase tracking-wider mb-1">Regional Admin Recommendation</p>
                    <p className="text-xs text-slate-800 font-semibold">Submitted by: {hosp.recommendedBy}</p>
                    {hosp.recommendationNotes && <p className="text-xs text-slate-700 mt-1 leading-relaxed">{hosp.recommendationNotes}</p>}
                  </div>
                )}

                {/* Approved hospital portal access & credentials banner */}
                {hosp.status === 'Approved' && (
                  <div className="mt-3 p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/90 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hospital Partner Active — Portal Access Ready
                      </span>
                      <a
                        href="/hospital/auth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                      >
                        Hospital Login Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 font-mono text-[11px] text-slate-800 space-y-1">
                      <p><strong className="font-sans text-slate-500 font-semibold">Official Login Email:</strong> <span className="text-emerald-950 font-bold">{hosp.generatedCredentials?.email || `${hosp.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'hospital'}@awarebharat.org`}</span></p>
                      {hosp.generatedCredentials?.tempPassword ? (
                        <p><strong className="font-sans text-slate-500 font-semibold">Temporary Password:</strong> <span className="text-emerald-950 font-bold">{hosp.generatedCredentials.tempPassword}</span></p>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Temporary password generated at approval and dispatched via email to <strong className="text-slate-700">{hosp.contactEmail}</strong>.
                        </p>
                      )}
                    </div>
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

              {/* Approved Hospital Actions: Re-issue credentials */}
              {hosp.status === 'Approved' && reissueCredentials && (
                <div className="flex flex-col gap-2 shrink-0 lg:w-48">
                  <button
                    onClick={() => reissueCredentials(hosp.id)}
                    className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Re-issue Password
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
