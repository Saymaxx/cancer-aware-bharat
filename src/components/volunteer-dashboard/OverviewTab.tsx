import { Calendar, CheckCircle, Clock, Users, Award, Bell, CheckCircle2, MessageSquare, Timer } from 'lucide-react';
import { AnimatedCounter } from './shared';
import type { ActiveCampaign, Notification as NotifType } from '../../volunteerDashboardData';

interface Quote {
  text: string;
  author: string;
}

interface UserStats {
  campaignsCompleted: number;
  volunteerHours: number;
  peopleReached: number;
  certificatesEarned: number;
}

export default function OverviewTab({
  volunteerInitials,
  volunteerName,
  volunteerId,
  volunteerDomain,
  volunteerCity,
  currentQuote,
  myCampaigns,
  userStats,
  notifications,
  setActiveTab,
  handleCheckIn,
  markNotifRead,
}: {
  volunteerInitials: string;
  volunteerName: string;
  volunteerId: string;
  volunteerDomain: string;
  volunteerCity: string;
  currentQuote: Quote;
  myCampaigns: ActiveCampaign[];
  userStats: UserStats;
  notifications: NotifType[];
  setActiveTab: (tab: string) => void;
  handleCheckIn: (campId: string) => void;
  markNotifRead: (id: string) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">

      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-container to-primary p-6 sm:p-8 lg:p-10 text-white shadow-sm">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Greeting */}
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-xl sm:text-2xl font-black text-white">{volunteerInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Welcome back</p>
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-white truncate">{volunteerName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-wider text-secondary-container">
                  {volunteerId}
                </span>
                <span className="text-white/70 text-xs font-medium">{volunteerDomain} • {volunteerCity}</span>
              </div>
              {/* Quote */}
              <div className="mt-3 transition-all duration-700">
                <p className="text-white/80 text-xs sm:text-sm italic leading-relaxed max-w-lg">
                  "{currentQuote.text}"
                </p>
                <p className="text-white/50 text-[10px] mt-1">— {currentQuote.author}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 lg:max-w-lg">
            {[
              { label: 'Approved', value: myCampaigns.filter(c => c.attendanceStatus === 'Confirmed' || c.attendanceStatus === 'Checked In').length, icon: Calendar },
              { label: 'Done', value: userStats.campaignsCompleted, icon: CheckCircle },
              { label: 'Hours', value: userStats.volunteerHours, icon: Clock },
              { label: 'Reached', value: userStats.peopleReached, icon: Users },
              { label: 'Certs', value: userStats.certificatesEarned, icon: Award },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 text-center border border-white/10 hover:bg-white/15 transition-colors">
                <s.icon className="w-4 h-4 text-secondary-container mx-auto mb-1" />
                <p className="text-white font-black text-lg sm:text-xl">
                  <AnimatedCounter value={s.value} />
                </p>
                <p className="text-white/60 text-[9px] font-semibold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'My Campaigns', icon: Calendar, color: 'text-primary bg-primary/10 border-primary/20', tab: 'campaigns' },
          { label: 'Today\'s Agenda', icon: Timer, color: 'text-slate-700 bg-slate-50 border-slate-200', tab: 'schedule' },
          { label: 'Send Feedback', icon: MessageSquare, color: 'text-pink-700 bg-pink-50 border-pink-200', tab: 'feedback' },
        ].map((act, i) => {
          const IconC = act.icon;
          return (
            <button
              key={i}
              onClick={() => setActiveTab(act.tab)}
              className={`p-4 rounded-2xl border ${act.color} font-bold text-xs flex flex-col items-center justify-center text-center gap-2 hover:shadow-md transition-all cursor-pointer`}
            >
              <IconC className="w-5 h-5" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Grid: Active Campaigns Preview & Today's Agenda Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Active Campaigns Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary" /> My Campaigns
            </h3>
            <button onClick={() => setActiveTab('campaigns')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
              View All ({myCampaigns.filter(c => c.attendanceStatus !== 'Rejected').length})
            </button>
          </div>
          <div className="space-y-3.5">
            {myCampaigns.filter(c => c.attendanceStatus !== 'Rejected').map((camp) => (
              <div key={camp.id} className="p-4 border border-outline-variant/30 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs gap-3">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    camp.attendanceStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {camp.attendanceStatus === 'Pending' ? 'Awaiting Admin Approval' : '✓ Admin Approved'}
                  </span>
                  <h4 className="font-bold text-slate-900 mt-1.5">{camp.name}</h4>
                  <p className="text-slate-500 mt-0.5">{camp.date} • {camp.location}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    camp.attendanceStatus === 'Checked In' ? 'bg-slate-100 text-slate-800' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {camp.attendanceStatus}
                  </span>
                  {camp.attendanceStatus === 'Confirmed' && (
                    <button
                      onClick={() => handleCheckIn(camp.id)}
                      className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 shadow-xs cursor-pointer"
                    >
                      Check-In
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Announcements */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-secondary" /> Recent Alerts & Updates
            </h3>
            <div className="space-y-3">
              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} onClick={() => markNotifRead(notif.id)} className="flex items-start space-x-3 text-xs leading-relaxed border-b border-slate-100 pb-2.5 last:border-none cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? 'bg-slate-300' : 'bg-primary'}`} />
                  <div className="flex-1">
                    <p className={`font-bold ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</p>
                    <p className="text-slate-600 line-clamp-1">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('notifications')}
            className="w-full mt-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary hover:bg-slate-100 transition-colors"
          >
            View All Notifications
          </button>
        </div>

      </div>
    </div>
  );
}
