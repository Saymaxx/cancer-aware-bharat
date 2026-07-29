import { DollarSign } from 'lucide-react';
import type { FinancialAidVerification } from '../../hospitalDashboardData';

export default function FinancialTab({
  financialVerifications,
  setShowVerifyCostModal,
  setVerifiedCostInput,
}: {
  financialVerifications: FinancialAidVerification[];
  setShowVerifyCostModal: (fa: FinancialAidVerification | null) => void;
  setVerifiedCostInput: (val: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 p-4 rounded-2xl text-xs flex items-start gap-3">
        <DollarSign className="w-5 h-5 shrink-0 text-cyan-600 mt-0.5" />
        <div>
          <p className="font-bold">NGO Financial Assistance Verification Portal</p>
          <p className="text-cyan-800/85 mt-0.5">Review treatment cost estimates submitted by NGO patients. Verify actual surgical/chemo costs and submit cost estimation reports for CAB Trust fund disbursement.</p>
        </div>
      </div>

      {financialVerifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto border border-cyan-200">
            <DollarSign className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Financial Verification Requests</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Subsidized treatment cost estimations requiring NGO grant verification will be listed here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                  <th className="p-4">Case ID & Patient</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">NGO Estimated Cost</th>
                  <th className="p-4">Verified Amount</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {financialVerifications.map(fa => (
                  <tr key={fa.id} className="hover:bg-slate-50/60">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{fa.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{fa.ngoCaseId} • {fa.requestDate}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{fa.department}</td>
                    <td className="p-4 font-bold text-slate-900">₹{fa.estimatedCost.toLocaleString()}</td>
                    <td className="p-4 font-bold text-slate-700">₹{fa.verifiedAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        fa.status === 'Aid Disbursed' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        fa.status === 'Cost Verified' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {fa.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {fa.status === 'Pending Verification' ? (
                        <button onClick={() => { setShowVerifyCostModal(fa); setVerifiedCostInput(fa.estimatedCost.toString()); }} className="px-3 py-1.5 bg-[#063b42] text-white rounded-lg text-[10px] font-bold hover:opacity-90 cursor-pointer">
                          Verify Cost
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">Verified</span>
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
