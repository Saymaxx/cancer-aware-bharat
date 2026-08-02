import { Timer, PlusCircle, Clock3 } from 'lucide-react';
import { SectionHeader } from './shared';
import type { ApiVolunteerHoursLog } from '../../api/client';

export default function HoursTab({
  totalHours,
  hoursLogs,
  hoursLoading,
  activity,
  setActivity,
  hoursValue,
  setHoursValue,
  logDate,
  setLogDate,
  submitting,
  submitError,
  handleLogHours,
}: {
  totalHours: number;
  hoursLogs: ApiVolunteerHoursLog[];
  hoursLoading: boolean;
  activity: string;
  setActivity: (v: string) => void;
  hoursValue: string;
  setHoursValue: (v: string) => void;
  logDate: string;
  setLogDate: (v: string) => void;
  submitting: boolean;
  submitError: string;
  handleLogHours: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs h-fit space-y-5">
        <SectionHeader icon={Timer} title="Log Your Volunteer Hours" subtitle="Record time spent on campaigns, outreach, and other activities" />

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Hours Logged</p>
            <p className="text-2xl font-black text-primary tabular-nums">{totalHours}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="hours-activity" className="text-xs font-bold text-slate-700 mb-1 block">Activity</label>
            <input
              id="hours-activity"
              value={activity}
              onChange={e => setActivity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all text-xs"
              placeholder="e.g. Registration desk, Free Early Detection Camp"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="hours-value" className="text-xs font-bold text-slate-700 mb-1 block">Hours</label>
              <input
                id="hours-value"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={hoursValue}
                onChange={e => setHoursValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all text-xs"
                placeholder="e.g. 4"
              />
            </div>
            <div>
              <label htmlFor="hours-date" className="text-xs font-bold text-slate-700 mb-1 block">Date</label>
              <input
                id="hours-date"
                type="date"
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all text-xs"
              />
            </div>
          </div>
          {submitError && <p className="text-xs text-red-600">{submitError}</p>}
          <button
            onClick={handleLogHours}
            disabled={!activity.trim() || !hoursValue || !logDate || submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> {submitting ? 'Logging...' : 'Log Hours'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
        <SectionHeader icon={Clock3} title="Your Hours History" subtitle="Every activity you've logged, most recent first" />
        <div className="mt-4 space-y-2">
          {hoursLoading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>
          ) : hoursLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">You haven't logged any hours yet.</p>
          ) : (
            hoursLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between border border-slate-200 rounded-xl p-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-800">{log.activity}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(log.logDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg tabular-nums shrink-0">{log.hours} hrs</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
