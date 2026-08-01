import { HardDrive, Database, Layers, Activity, FolderArchive, Info } from 'lucide-react';
import type { ApiBackupRecord, ApiDatabaseHealth } from '../../api/client';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function DatabaseTab({
  health,
  healthLoading,
  backups,
  creatingBackup,
  handleCreateBackupNow,
}: {
  health: ApiDatabaseHealth | null;
  healthLoading: boolean;
  backups: ApiBackupRecord[];
  creatingBackup: boolean;
  handleCreateBackupNow: () => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Database Size', value: healthLoading || !health ? '—' : formatBytes(health.totalSizeBytes), icon: HardDrive },
          { label: 'Tables', value: healthLoading || !health ? '—' : String(health.tablesCount), icon: Database },
          { label: 'Total Records', value: healthLoading || !health ? '—' : health.totalRecords.toLocaleString(), icon: Layers },
          { label: 'Uptime', value: healthLoading || !health ? '—' : formatUptime(health.uptimeSeconds), icon: Activity },
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
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <button onClick={handleCreateBackupNow} disabled={creatingBackup} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm">
          <FolderArchive className="w-4 h-4" /> {creatingBackup ? 'Backing up...' : 'Create Backup Now'}
        </button>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Restoring from a backup is a destructive, manual operations action -- it isn't offered as a one-click button here.
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Timestamp</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {backups.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">No backups yet.</td></tr>
              ) : backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-600">{new Date(b.createdAt).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{formatBytes(b.sizeBytes)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDuration(b.durationMs)}</td>
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
