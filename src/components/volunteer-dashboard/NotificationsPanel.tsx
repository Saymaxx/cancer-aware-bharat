import { Bell, Calendar, Sparkles, AlertCircle, Award } from 'lucide-react';
import { SectionHeader } from './shared';
import type { Notification as NotifType } from '../../volunteerDashboardData';

function notifIcon(type: string) {
  switch (type) {
    case 'campaign': return <Calendar className="w-4 h-4 text-primary" />;
    case 'announcement': return <Sparkles className="w-4 h-4 text-secondary" />;
    case 'reminder': return <AlertCircle className="w-4 h-4 text-secondary" />;
    case 'achievement': return <Award className="w-4 h-4 text-primary" />;
    default: return <Bell className="w-4 h-4 text-slate-400" />;
  }
}

export default function NotificationsPanel({
  unreadCount,
  notifFilter,
  setNotifFilter,
  filteredNotifications,
  markNotifRead,
  markAllRead,
  handleClearReadNotifs,
}: {
  unreadCount: number;
  notifFilter: string;
  setNotifFilter: (filter: string) => void;
  filteredNotifications: NotifType[];
  markNotifRead: (id: string) => void;
  markAllRead: () => void;
  handleClearReadNotifs: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <SectionHeader
        icon={Bell}
        title="Notification Center"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
        action={
          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 cursor-pointer"
            >
              Mark All Read
            </button>
            <button
              onClick={handleClearReadNotifs}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Clear Read
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
        {['All', 'campaign', 'announcement', 'reminder', 'achievement'].map(f => (
          <button
            key={f}
            onClick={() => setNotifFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
              notifFilter === f ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => markNotifRead(notif.id)}
            className={`flex items-start gap-4 py-4 px-3 rounded-xl transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              {notifIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`text-xs font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h4>
                {!notif.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 font-semibold">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
