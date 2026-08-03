import { Download } from 'lucide-react';

interface SuperAdminCampaign {
  id: string;
  title: string;
  date: string;
  type: string;
  loc: string;
  registrations: string;
  status: string;
}

export default function CampaignsTab({
  campaigns,
  handleExportCampaignsCSV,
}: {
  campaigns: SuperAdminCampaign[];
  handleExportCampaignsCSV: () => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Drives', value: String(campaigns.length), color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
          { label: 'Scheduled', value: String(campaigns.filter(c => c.status === 'Scheduled').length), color: 'text-purple-700 bg-purple-50 border-purple-200' },
          { label: 'Completed', value: String(campaigns.filter(c => c.status === 'Completed').length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <h3 className="text-sm font-bold text-slate-900">National Healthcare Campaigns & Screening Drives</h3>
        <button
          onClick={handleExportCampaignsCSV}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-indigo-600" /> Export Campaigns CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Campaign Title</th>
                <th className="px-5 py-3">Schedule Date</th>
                <th className="px-5 py-3">Drive Type</th>
                <th className="px-5 py-3">Location Venue</th>
                <th className="px-5 py-3 text-right">Registrations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">{c.title}</td>
                  <td className="px-5 py-4 text-indigo-700 font-semibold">{c.date}</td>
                  <td className="px-5 py-4 font-medium text-slate-700">{c.type}</td>
                  <td className="px-5 py-4 text-slate-600">{c.loc}</td>
                  <td className="px-5 py-4 text-right font-bold text-purple-700">{c.registrations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
