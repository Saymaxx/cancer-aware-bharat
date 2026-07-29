import { Timer, AlertTriangle, CircleCheck, Circle, MapPin } from 'lucide-react';
import { SectionHeader } from './shared';
import type { ScheduleItem } from '../../volunteerDashboardData';

export default function ScheduleTab({
  scheduleList,
  handleScheduleToggle,
  setShowReportIssueModal,
}: {
  scheduleList: ScheduleItem[];
  handleScheduleToggle: (id: string) => void;
  setShowReportIssueModal: (show: boolean) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs animate-[fadeInUp_0.4s_ease-out] space-y-4">
      <SectionHeader
        icon={Timer}
        title="Today's Operational Schedule"
        subtitle="Your step-by-step agenda for today's active campaign"
        action={
          <button
            onClick={() => setShowReportIssueModal(true)}
            className="px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" /> Report Schedule Issue
          </button>
        }
      />
      <div className="relative mt-6">
        <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-slate-200" />
        <div className="space-y-2">
          {scheduleList.map((item) => (
            <div key={item.id} className="relative flex items-start gap-4 py-3">
              <button
                onClick={() => handleScheduleToggle(item.id)}
                className={`relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 border-2 transition-transform hover:scale-110 cursor-pointer ${item.status === 'completed' ? 'bg-slate-50 border-slate-400 text-primary-container' :
                    item.status === 'current' ? 'bg-primary border-primary text-white animate-pulse' :
                      'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                title="Click to toggle status"
              >
                {item.status === 'completed' ? <CircleCheck className="w-5 h-5" /> :
                  item.status === 'current' ? <Circle className="w-5 h-5 fill-current" /> :
                    <Circle className="w-5 h-5" />}
              </button>
              <div className={`flex-1 rounded-xl p-4 transition-colors border ${item.status === 'current' ? 'bg-primary/5 border-primary/20' :
                  item.status === 'completed' ? 'bg-slate-50 border-slate-200/60 opacity-75' :
                    'bg-white border-slate-200/80'
                }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${item.status === 'current' ? 'text-primary' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{item.time}</span>
                    <button
                      onClick={() => handleScheduleToggle(item.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                        item.status === 'completed' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.status === 'completed' ? 'Done ✓' : 'Mark Done'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {item.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
