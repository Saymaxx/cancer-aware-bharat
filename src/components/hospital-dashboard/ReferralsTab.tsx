import { UserCheck } from 'lucide-react';
import type { NgoReferral } from '../../hospitalDashboardData';

export default function ReferralsTab({
  referrals,
  setSelectedReferralModal,
}: {
  referrals: NgoReferral[];
  setSelectedReferralModal: (ref: NgoReferral) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl text-xs flex items-start gap-3">
        <UserCheck className="w-5 h-5 shrink-0 text-primary-container mt-0.5" />
        <div>
          <p className="font-bold">NGO Patient Referral Channel</p>
          <p className="text-slate-800/85 mt-0.5">Review patient referrals sent by Cancer Aware Bharat caseworkers. Accept referrals to assign clinical intake slots or decline with justification notes.</p>
        </div>
      </div>

      {referrals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Incoming NGO Referrals</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Pre-screened cancer patient referrals sent by regional CAB Trust coordinators will be listed here for clinical intake review.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                  <th className="p-4">Referral Code & Patient</th>
                  <th className="p-4">Referred By NGO Agent</th>
                  <th className="p-4">Priority Level</th>
                  <th className="p-4">Cancer Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50/60">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{ref.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{ref.id} • {ref.age} / {ref.gender}</p>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{ref.referredByNgoAgent}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        ref.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                        ref.priority === 'Urgent' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {ref.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-medium">{ref.cancerType}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        ref.status === 'Accepted' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        ref.status === 'Declined' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {ref.status === 'Pending Action' ? (
                        <button onClick={() => setSelectedReferralModal(ref)} className="px-3 py-1.5 bg-[#063b42] text-white rounded-lg text-[10px] font-bold hover:opacity-90 cursor-pointer">
                          Accept / Decline
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Process Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
