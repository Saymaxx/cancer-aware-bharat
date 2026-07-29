import { Wifi, ShieldAlert, Lock } from 'lucide-react';
import { INITIAL_ACTIVE_SESSIONS, INITIAL_FAILED_LOGINS } from '../../superAdminDashboardData';

export default function SecurityTab() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Active Sessions */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Wifi className="w-4 h-4 text-primary-container" /> Active Sessions ({INITIAL_ACTIVE_SESSIONS.length})</h3>
        <div className="space-y-3">
          {INITIAL_ACTIVE_SESSIONS.map(s => (
            <div key={s.id} className="p-4 border border-slate-200/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${s.status === 'Active' ? 'bg-primary animate-pulse' : 'bg-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-900">{s.user} <span className="text-slate-400 font-normal">({s.role})</span></p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{s.device} • {s.browser} • {s.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-semibold">{s.lastActivity}</p>
                <p className="text-[10px] font-mono text-slate-400">{s.ipAddress}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Failed Login Attempts */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-600" /> Failed Login Attempts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-4 py-2">Email</th><th className="px-4 py-2">IP Address</th><th className="px-4 py-2">Timestamp</th><th className="px-4 py-2">Reason</th><th className="px-4 py-2">Blocked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {INITIAL_FAILED_LOGINS.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{f.email}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{f.ipAddress}</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">{f.timestamp}</td>
                  <td className="px-4 py-3 text-slate-600">{f.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${f.blocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {f.blocked ? 'Blocked' : 'Allowed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-600" /> Password Policy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Min Length</p><p className="font-black text-slate-900 text-lg">12</p></div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Special Characters</p><p className="font-black text-slate-900 text-lg">Required</p></div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Expiry</p><p className="font-black text-slate-900 text-lg">90 Days</p></div>
        </div>
      </div>
    </div>
  );
}
