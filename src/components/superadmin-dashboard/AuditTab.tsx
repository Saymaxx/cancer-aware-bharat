import { Search, Download } from 'lucide-react';
import type { AuditLogEntry } from '../../superAdminDashboardData';

export default function AuditTab({
  searchTerm,
  setSearchTerm,
  auditFilter,
  setAuditFilter,
  handleExportAuditLogsCSV,
  filteredLogs,
  severityBadge,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  auditFilter: string;
  setAuditFilter: (val: string) => void;
  handleExportAuditLogsCSV: () => void;
  filteredLogs: AuditLogEntry[];
  severityBadge: (s: string) => string;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {['All', 'Info', 'Warning', 'Critical'].map(f => (
            <button key={f} onClick={() => setAuditFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${auditFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
          ))}
          <button
            onClick={handleExportAuditLogsCSV}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-2"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-700">{log.actor}</p>
                    <p className="text-[10px] text-slate-400">{log.actorRole}</p>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{log.action}</td>
                  <td className="px-5 py-3 text-slate-600 text-[11px] max-w-[200px] truncate">{log.target}</td>
                  <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">{log.ipAddress}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${severityBadge(log.severity)}`}>{log.severity}</span>
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
