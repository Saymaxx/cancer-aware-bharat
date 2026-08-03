import { Search, Download } from 'lucide-react';
import type { AdminVolunteer } from '../../adminDashboardData';

export default function VolunteersTab({
  volunteers,
  searchTerm,
  setSearchTerm,
  handleExportVolunteersCSV,
}: {
  volunteers: AdminVolunteer[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  handleExportVolunteersCSV: () => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Volunteers', value: volunteers.length.toLocaleString(), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Approved & Active', value: String(volunteers.filter(v => v.status === 'Approved').length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Pending Verification', value: String(volunteers.filter(v => v.status === 'Pending Approval').length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          // Real self-reported hours log now (see hoursLogged mapping in
          // SuperAdminDashboard.tsx) -- was dropped when this tab was built
          // because that data didn't exist yet.
          { label: 'Total Hours Logged', value: volunteers.reduce((sum, v) => sum + v.hoursLogged, 0).toLocaleString(), color: 'text-purple-700 bg-purple-50 border-purple-200' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search volunteers by name or domain..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full"
          />
        </div>
        <button
          onClick={handleExportVolunteersCSV}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4 text-indigo-600" /> Export Volunteers CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Volunteer ID</th>
                <th className="px-5 py-3">Volunteer Name</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Expertise / Domain</th>
                <th className="px-5 py-3">Hours Logged</th>
                <th className="px-5 py-3 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {volunteers.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.domain.toLowerCase().includes(searchTerm.toLowerCase())).map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-700">{v.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{v.name}</p>
                    <p className="text-[10px] text-slate-400">Registered: {v.registeredDate}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <p>{v.email}</p>
                    <p className="text-[10px] text-slate-400">{v.phone}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{v.domain}</td>
                  <td className="px-5 py-4 font-bold text-purple-700">{v.hoursLogged} hrs</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${v.status === 'Approved' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {v.status}
                    </span>
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
