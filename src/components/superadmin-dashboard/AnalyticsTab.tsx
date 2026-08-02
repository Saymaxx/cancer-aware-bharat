import { DollarSign, Activity, Clock3 } from 'lucide-react';
import { useDonationsMonthly, usePatientIntakeMonthly, useVolunteerHoursMonthly } from '../../api/hooks';

// "2026-08" -> "Aug"
function shortMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export default function AnalyticsTab({ apiToken }: { apiToken: string | null }) {
  const { data: donationsMonthly, loading: donationsLoading } = useDonationsMonthly(apiToken);
  const { data: intakeMonthly, loading: intakeLoading } = usePatientIntakeMonthly(apiToken);
  const { data: hoursMonthly, loading: hoursLoading } = useVolunteerHoursMonthly(apiToken);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Donation Trends */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary-container" /> Monthly Donation Trends (INR)</h3>
        {donationsLoading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>
        ) : donationsMonthly.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No donations recorded yet.</p>
        ) : (
          <div className="flex items-end justify-between gap-3 h-48 pt-4">
            {donationsMonthly.map((m, i) => {
              const max = Math.max(...donationsMonthly.map(x => x.amount));
              const pct = max > 0 ? (m.amount / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">₹{(m.amount / 1000).toFixed(0)}K</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-container to-slate-400 transition-all duration-700 group-hover:from-primary-container group-hover:to-slate-400" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{shortMonthLabel(m.month)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient Intake Trends */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary-container" /> Monthly Patient Intake</h3>
        {intakeLoading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>
        ) : intakeMonthly.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No patient enquiries recorded yet.</p>
        ) : (
          <div className="flex items-end justify-between gap-3 h-44 pt-4">
            {intakeMonthly.map((m, i) => {
              const max = Math.max(...intakeMonthly.map(x => x.count));
              const pct = max > 0 ? (m.count / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-container to-cyan-400 transition-all duration-700 group-hover:from-indigo-600 group-hover:to-slate-400" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{shortMonthLabel(m.month)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Volunteer Hours */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock3 className="w-4 h-4 text-primary-container" /> Monthly Volunteer Hours</h3>
        {hoursLoading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>
        ) : hoursMonthly.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No volunteer hours logged yet.</p>
        ) : (
          <div className="flex items-end justify-between gap-3 h-44 pt-4">
            {hoursMonthly.map((m, i) => {
              const max = Math.max(...hoursMonthly.map(x => x.hours));
              const pct = max > 0 ? (m.hours / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{m.hours}h</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-container to-amber-400 transition-all duration-700" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{shortMonthLabel(m.month)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
