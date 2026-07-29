import { AlertCircle } from 'lucide-react';
import type { PartnerHospital } from '../../adminDashboardData';

export default function HospitalsTab({
  hospitalRequests,
  handleVerifyDocument,
  handleRecommendHospital,
  setShowAdminDeclineModal,
}: {
  hospitalRequests: PartnerHospital[];
  handleVerifyDocument: (id: string) => void;
  handleRecommendHospital: (id: string) => void;
  setShowAdminDeclineModal: (id: string | null) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
        <AlertCircle className="w-5 h-5 shrink-0 text-slate-700" />
        <div>
          <p className="font-bold">Role-based Access Clearance Level: Regional Coordinator</p>
          <p className="text-slate-800/85 mt-0.5">As Admin, you can review partner applications, verify submitted accreditation documents, and recommend entries. Under CAB Trust guidelines, final tie-up approvals or rejections are restricted to the **Super Admin board console**.</p>
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
                      <span className="text-primary-container font-bold flex items-center gap-1">✓ Verified</span>
                    ) : (
                      <button
                        onClick={() => handleVerifyDocument(hosp.id)}
                        className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-100"
                      >
                        Check Document Uploads
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      hosp.status === 'Active Partner' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      hosp.status === 'Recommended to Super Admin' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      hosp.status === 'Declined by Admin' ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
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
                      <span className="text-[10px] font-bold text-primary-container bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        Recommended to Board
                      </span>
                    ) : hosp.status === 'Declined by Admin' ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                        Declined by Admin
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-primary-container bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
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
    </div>
  );
}
