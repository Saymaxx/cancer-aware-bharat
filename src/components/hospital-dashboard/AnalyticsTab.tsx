import { Download } from 'lucide-react';
import { DEPARTMENT_DISTRIBUTION } from '../../hospitalDashboardData';

export default function AnalyticsTab({
  showToast,
}: {
  showToast: (msg: string) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Clinical Analytics & Export</h3>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive analytics on NGO patients treated, referral conversion rates, and department distribution.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => showToast('Generated PDF Clinical Performance Report')} className="px-3.5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button onClick={() => showToast('Exported Excel Dataset (.xlsx)')} className="px-3.5 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900">Department-wise NGO Patient Distribution</h4>
        <div className="space-y-3">
          {DEPARTMENT_DISTRIBUTION.map((dept, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">{dept.department}</span>
                <span className="text-slate-900">{dept.count} Patients ({dept.percentage}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${dept.percentage}%` }} className="h-full bg-gradient-to-r from-[#063b42] to-primary rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
