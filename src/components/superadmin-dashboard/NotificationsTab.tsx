import { Send } from 'lucide-react';

interface SuperAdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsTab({
  sendNotification,
  notifTitle,
  setNotifTitle,
  notifMessage,
  setNotifMessage,
  notifAudience,
  setNotifAudience,
  superAdminNotifications,
}: {
  sendNotification: (e: React.FormEvent) => void;
  notifTitle: string;
  setNotifTitle: (val: string) => void;
  notifMessage: string;
  setNotifMessage: (val: string) => void;
  notifAudience: string;
  setNotifAudience: (val: string) => void;
  superAdminNotifications: SuperAdminNotification[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs self-start">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-600" /> Broadcast Notification</h3>
        <form onSubmit={sendNotification} className="space-y-3 text-xs">
          <div><label className="font-bold text-slate-600 block mb-1">Title</label><input required value={notifTitle} onChange={e => setNotifTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" placeholder="System Announcement" /></div>
          <div><label className="font-bold text-slate-600 block mb-1">Message</label><textarea required value={notifMessage} onChange={e => setNotifMessage(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs resize-none" placeholder="Enter your broadcast message..." /></div>
          <div><label className="font-bold text-slate-600 block mb-1">Audience</label><select value={notifAudience} onChange={e => setNotifAudience(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer text-xs">
            <option>All Users</option><option>Admins</option><option>Volunteers</option><option>Hospitals</option><option>Patients</option>
          </select></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm cursor-pointer">Send Broadcast</button>
        </form>
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Enquiry Workflow Notifications</h3>
        <div className="space-y-3">
          {superAdminNotifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
          ) : (
            superAdminNotifications.map(n => (
              <div key={n.id} className={`p-4 border rounded-xl ${n.read ? 'border-slate-200/60' : 'border-indigo-300 bg-indigo-50/40'}`}>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{n.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-2">{n.timestamp}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
