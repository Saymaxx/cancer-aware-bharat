import { Wifi, ShieldAlert, Lock } from 'lucide-react';
import type { StaffSession } from '../../api/client';
import type { AuditLogEntry } from '../../superAdminDashboardData';

export default function SecurityTab({
  staffSession,
  auditLogs,
}: {
  staffSession: StaffSession | null;
  auditLogs: AuditLogEntry[];
}) {
  // Failed Login Attempts is a real filter of the audit trail. Active
  // Sessions has no backing concept in this app -- auth is a stateless JWT
  // with a revocation list, not a session store, so there's no way to know
  // about anyone else's session. The one session genuinely known here is
  // the browser's own: shown for real rather than fabricating a roster of
  // other users.
  const failedLogins = auditLogs.filter(log => log.action === 'Login Failure');

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Your Session */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Wifi className="w-4 h-4 text-primary-container" /> Your Session</h3>
        {staffSession ? (
          <div className="p-4 border border-slate-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <div>
                <p className="text-xs font-bold text-slate-900">{staffSession.name} <span className="text-slate-400 font-normal">({staffSession.role})</span></p>
                <p className="text-[10px] text-slate-500 mt-0.5">{staffSession.email} • This browser</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-semibold">Last active: {new Date(staffSession.lastAccess).toLocaleString('en-IN')}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No active session.</p>
        )}
        <p className="text-[10px] text-slate-400 mt-3">
          Sessions for other users aren't tracked centrally -- auth is a stateless JWT with a revocation list, not a session store, so there's no roster of "who else is logged in" to show here.
        </p>
      </div>

      {/* Failed Login Attempts */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-600" /> Failed Login Attempts ({failedLogins.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-4 py-2">Account Type</th><th className="px-4 py-2">Detail</th><th className="px-4 py-2">IP Address</th><th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {failedLogins.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No failed login attempts recorded.</td></tr>
              ) : failedLogins.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{f.actor}</td>
                  <td className="px-4 py-3 text-slate-600">{f.target}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{f.ipAddress}</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">{f.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Policy -- reflects what's actually enforced in the
          Pydantic schemas for self-registered accounts (patient/volunteer).
          Staff/hospital accounts don't self-set a password (either created
          with a system-generated temp password, or not applicable), so
          this policy only meaningfully applies to those two. */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-600" /> Password Policy (Patient / Volunteer Registration)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Min Length</p><p className="font-black text-slate-900 text-lg">8</p></div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Special Characters</p><p className="font-black text-slate-900 text-lg">Not Enforced</p></div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60"><p className="text-[10px] font-bold text-slate-500 uppercase">Expiry</p><p className="font-black text-slate-900 text-lg">Not Enforced</p></div>
        </div>
      </div>
    </div>
  );
}
