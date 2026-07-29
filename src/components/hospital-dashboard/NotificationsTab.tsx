import { Bell } from 'lucide-react';
import type { AppNotification } from '../../types';

export default function NotificationsTab({
  hospitalNotifications,
}: {
  hospitalNotifications: AppNotification[];
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
        <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Notification Feed</h3>
      </div>

      <div className="space-y-3">
        {hospitalNotifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
        ) : (
          hospitalNotifications.map(notif => (
            <div key={notif.id} className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${notif.read ? 'bg-white border-slate-200/80' : 'bg-slate-50/40 border-slate-200'}`}>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
