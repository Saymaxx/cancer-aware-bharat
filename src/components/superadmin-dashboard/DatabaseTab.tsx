import { HardDrive, Database, Layers, Activity, FolderArchive, RefreshCw } from 'lucide-react';
import { DATABASE_HEALTH } from '../../superAdminDashboardData';

interface BackupRecord {
  id: string;
  timestamp: string;
  type: string;
  size: string;
  duration: string;
  status: string;
  initiatedBy: string;
}

export default function DatabaseTab({
  backupRecords,
  handleCreateBackupNow,
  showToast,
}: {
  backupRecords: BackupRecord[];
  handleCreateBackupNow: () => void;
  showToast: (msg: string) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Database Size', value: DATABASE_HEALTH.totalSize, icon: HardDrive },
          { label: 'Tables', value: String(DATABASE_HEALTH.tablesCount), icon: Database },
          { label: 'Total Records', value: DATABASE_HEALTH.totalRecords.toLocaleString(), icon: Layers },
          { label: 'Uptime', value: DATABASE_HEALTH.uptime, icon: Activity },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-200">
              <s.icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div><p className="text-lg font-black text-slate-900">{s.value}</p><p className="text-[10px] text-slate-500 font-semibold">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleCreateBackupNow} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 shadow-sm"><FolderArchive className="w-4 h-4" /> Create Backup Now</button>
        <button onClick={() => showToast('Restore initiated from latest backup snapshot.')} className="px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-50 cursor-pointer flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Restore Latest</button>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Timestamp</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {backupRecords.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-600">{b.timestamp}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.type === 'Full' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{b.type}</span></td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{b.size}</td>
                  <td className="px-5 py-3 text-slate-500">{b.duration}</td>
                  <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${b.status === 'Completed' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{b.status}</span></td>
                  <td className="px-5 py-3 text-slate-500">{b.initiatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
