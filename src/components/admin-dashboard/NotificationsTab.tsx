import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../../types';

export default function NotificationsTab({
  notifSuccessToast,
  lastBroadcastRecipientCount,
  handleSendAnnouncement,
  announcementTitle,
  setAnnouncementTitle,
  announcementMessage,
  setAnnouncementMessage,
  adminNotifications,
}: {
  notifSuccessToast: boolean;
  lastBroadcastRecipientCount: number;
  handleSendAnnouncement: (e: React.FormEvent) => void;
  announcementTitle: string;
  setAnnouncementTitle: (val: string) => void;
  announcementMessage: string;
  setAnnouncementMessage: (val: string) => void;
  adminNotifications: AppNotification[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">

      {/* Broadcast Form */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs self-start">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-4.5 h-4.5 text-primary" /> Broadcast announcement to Volunteers
        </h3>

        {notifSuccessToast && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5" /> Broadcast alert sent to {lastBroadcastRecipientCount} volunteer{lastBroadcastRecipientCount === 1 ? '' : 's'}!
          </div>
        )}

        <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Subject Header</label>
            <input
              type="text"
              required
              value={announcementTitle}
              onChange={e => setAnnouncementTitle(e.target.value)}
              placeholder="e.g. Schedule shift changes"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Message Body</label>
            <textarea
              rows={4}
              required
              value={announcementMessage}
              onChange={e => setAnnouncementMessage(e.target.value)}
              placeholder="Write message details here..."
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary resize-none"
            />
          </div>

          <button className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm">
            Broadcast Announcement
          </button>
        </form>
      </div>

      {/* Live notifications from the enquiry workflow */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Enquiry Workflow Notifications</h3>
        <div className="space-y-4">
          {adminNotifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
          ) : (
            adminNotifications.map((n) => (
              <div key={n.id} className={`p-3 border rounded-xl text-xs ${n.read ? 'border-outline-variant/40' : 'border-primary/30 bg-primary/5'}`}>
                <h4 className="font-bold text-slate-900">{n.title}</h4>
                <p className="text-slate-600 mt-1">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
