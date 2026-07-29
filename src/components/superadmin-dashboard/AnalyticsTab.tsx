import { DollarSign, Users } from 'lucide-react';
import { MONTHLY_DONATION_TREND, MONTHLY_VOLUNTEER_HOURS } from '../../superAdminDashboardData';

export default function AnalyticsTab() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Donation Trends */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary-container" /> Monthly Donation Trends (INR)</h3>
        <div className="flex items-end justify-between gap-3 h-48 pt-4">
          {MONTHLY_DONATION_TREND.map((m, i) => {
            const max = Math.max(...MONTHLY_DONATION_TREND.map(x => x.amount));
            const pct = (m.amount / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">₹{(m.amount / 1000).toFixed(0)}K</span>
                <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-container to-slate-400 transition-all duration-700 group-hover:from-primary-container group-hover:to-slate-400" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volunteer Hours */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary-container" /> Monthly Volunteer Hours</h3>
        <div className="flex items-end justify-between gap-3 h-44 pt-4">
          {MONTHLY_VOLUNTEER_HOURS.map((m, i) => {
            const max = Math.max(...MONTHLY_VOLUNTEER_HOURS.map(x => x.hours));
            const pct = (m.hours / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{m.hours}h</span>
                <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-container to-cyan-400 transition-all duration-700 group-hover:from-indigo-600 group-hover:to-slate-400" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
