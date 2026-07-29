import { Download } from 'lucide-react';
import { REPORT_CARDS } from '../../superAdminDashboardData';

export default function ReportsTab({
  showToast,
}: {
  showToast: (msg: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_CARDS.map(report => (
          <div key={report.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs hover:shadow-md transition-all">
            <div className="text-3xl mb-3">{report.icon}</div>
            <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{report.description}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400">Last: {report.lastGenerated}</span>
              <div className="flex gap-1.5">
                <button onClick={() => showToast(`${report.title} — PDF exported!`)} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold border border-red-200 hover:bg-red-100 cursor-pointer flex items-center gap-0.5"><Download className="w-3 h-3" /> PDF</button>
                <button onClick={() => showToast(`${report.title} — Excel exported!`)} className="px-2.5 py-1 rounded-lg bg-slate-50 text-primary-container text-[10px] font-bold border border-slate-200 hover:bg-slate-100 cursor-pointer flex items-center gap-0.5"><Download className="w-3 h-3" /> Excel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
