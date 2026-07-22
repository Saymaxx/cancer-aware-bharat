import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, Calendar, Clock, MapPin, Users, Award, Bell, BookOpen,
  FileText, Image, MessageSquare, LogOut, ChevronRight, ChevronDown,
  CheckCircle, Star, TrendingUp, Shield, Phone, ExternalLink,
  Download, X, Eye, Send, Sparkles, Target, Zap, BarChart3,
  GraduationCap, Play, FileCheck, AlertCircle, User, ArrowRight,
  Timer, CircleCheck, Circle, Flame, Medal, Terminal, CheckCircle2, UserCheck
} from 'lucide-react';

import {
  MOTIVATIONAL_QUOTES, DEFAULT_VOLUNTEER_STATS,
  MY_ACTIVE_CAMPAIGNS, TODAYS_SCHEDULE, ACHIEVEMENTS, NOTIFICATIONS,
  TRAINING_RESOURCES, CERTIFICATES, GALLERY_PHOTOS, MONTHLY_IMPACT,
  type ActiveCampaign, type Notification as NotifType
} from '../volunteerDashboardData';

// ===========================
// Animated Counter
// ===========================
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
}

// ===========================
// Countdown Timer Hook & Display
// ===========================
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
}

function CountdownDisplay({ targetDate }: { targetDate: string }) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  return (
    <div className="flex space-x-1.5">
      {[
        { val: days, label: 'd' },
        { val: hours, label: 'h' },
        { val: minutes, label: 'm' },
        { val: seconds, label: 's' },
      ].map((t, i) => (
        <div key={i} className="bg-primary/10 rounded-lg px-2 py-1 text-center min-w-[36px]">
          <span className="text-xs font-bold text-primary tabular-nums">{String(t.val).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-500 ml-0.5">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ===========================
// Section Header
// ===========================
function SectionHeader({ icon: Icon, title, subtitle, action }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between mb-5 flex-col sm:flex-row gap-2">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ===========================
// Main Volunteer Dashboard
// ===========================
interface VolunteerDashboardProps {
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export default function VolunteerDashboard({ onPageChange, onLogout }: VolunteerDashboardProps) {
  // Sidebar collapse & tab navigation state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Volunteer user profile data
  const volunteer = useMemo(() => {
    const stored = localStorage.getItem('aware_bharat_logged_in_volunteer');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const volunteerName = volunteer?.fullName || 'Anita Sharma';
  const volunteerInitials = volunteerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const volunteerId = volunteer?.volunteerId || 'V-2026-0842';
  const volunteerDomain = volunteer?.domain || 'Community Outreach';
  const volunteerCity = volunteer?.city || 'New Delhi';

  // Component states
  const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [showAllNotifs, setShowAllNotifs] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Motivational quote cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];
  const stats = DEFAULT_VOLUNTEER_STATS;

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleFeedbackSubmit = () => {
    if (feedbackRating > 0 && feedbackText.trim()) {
      setFeedbackSubmitted(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aware_bharat_logged_in_volunteer');
    onLogout();
  };

  const notifIcon = (type: string) => {
    switch (type) {
      case 'campaign': return <Calendar className="w-4 h-4 text-primary" />;
      case 'announcement': return <Sparkles className="w-4 h-4 text-secondary" />;
      case 'reminder': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'achievement': return <Award className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const resourceIcon = (type: string) => {
    switch (type) {
      case 'PDF Guide': return <FileText className="w-4 h-4" />;
      case 'Video': return <Play className="w-4 h-4" />;
      case 'Quiz': return <Target className="w-4 h-4" />;
      case 'Handbook': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Sidebar navigation links
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Approved Campaigns', icon: Calendar, badge: MY_ACTIVE_CAMPAIGNS.length },
    { id: 'schedule', label: 'Today\'s Agenda', icon: Timer },
    { id: 'impact', label: 'Impact Analytics', icon: TrendingUp },
    { id: 'achievements', label: 'Badges & Rewards', icon: Award },
    { id: 'notifications', label: 'Notification Center', icon: Bell, badge: unreadCount },
    { id: 'training', label: 'Training Modules', icon: GraduationCap },
    { id: 'certificates', label: 'Certificates', icon: FileCheck },
    { id: 'gallery', label: 'Photo Gallery', icon: Image },
    { id: 'feedback', label: 'Volunteer Feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">

      {/* =====================================================
          SIDEBAR NAVIGATION (Matching Admin Dashboard style)
      ===================================================== */}
      <aside className={`bg-[#004349] text-white transition-all duration-300 flex flex-col justify-between select-none ${sidebarCollapsed ? 'w-20' : 'w-72'
        }`}>
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <UserCheck className="w-5 h-5 text-secondary-container" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-headline-lg text-lg font-black text-white tracking-tight truncate">
                  CAB Volunteer Portal
                </span>
              )}
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="p-3 space-y-1">
            {sidebarItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all cursor-pointer ${isActive
                      ? 'bg-white/10 text-white shadow-sm border-l-4 border-secondary-container'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center">
                    <IconComp className={`w-5 h-5 shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-3.5'}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-secondary-container text-primary">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center rounded-xl p-3 text-sm font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/20 cursor-pointer transition-colors"
          >
            <LogOut className={`w-5 h-5 shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-3.5'}`} />
            {!sidebarCollapsed && <span>Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN WORKSPACE & STICKY HEADER
      ===================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9ff]">

        {/* Sticky Header Bar */}
        <header className="bg-white border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer focus:outline-none"
              title="Toggle Sidebar"
            >
              <Terminal className="w-5 h-5" />
            </button>
            <h2 className="font-headline-lg text-lg font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> volunteer-node-sync
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
              {volunteerInitials}
            </div>
          </div>
        </header>

        {/* Dynamic Panel Workspace Container */}
        <div className="p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

          {/* =====================================================
              TAB 1: DASHBOARD OVERVIEW
          ===================================================== */}
          {activeTab === 'dashboard' && (
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
                      { label: 'Approved', value: MY_ACTIVE_CAMPAIGNS.length, icon: Calendar },
                      { label: 'Done', value: stats.campaignsCompleted, icon: CheckCircle },
                      { label: 'Hours', value: stats.volunteerHours, icon: Clock },
                      { label: 'Reached', value: stats.peopleReached, icon: Users },
                      { label: 'Certs', value: stats.certificatesEarned, icon: Award },
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
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Approved Campaigns', icon: Calendar, color: 'text-primary bg-primary/10 border-primary/20', tab: 'campaigns' },
                  { label: 'Today\'s Agenda', icon: Timer, color: 'text-amber-700 bg-amber-50 border-amber-200', tab: 'schedule' },
                  { label: 'Impact Report', icon: TrendingUp, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', tab: 'impact' },
                  { label: 'Badges & XP', icon: Award, color: 'text-purple-700 bg-purple-50 border-purple-200', tab: 'achievements' },
                  { label: 'Certificates', icon: FileCheck, color: 'text-blue-700 bg-blue-50 border-blue-200', tab: 'certificates' },
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
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Admin Approved Campaigns
                    </h3>
                    <button onClick={() => setActiveTab('campaigns')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                      View All ({MY_ACTIVE_CAMPAIGNS.length})
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {MY_ACTIVE_CAMPAIGNS.map((camp) => (
                      <div key={camp.id} className="p-4 border border-outline-variant/30 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            ✓ Admin Approved
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1.5">{camp.name}</h4>
                          <p className="text-slate-500 mt-0.5">{camp.date} • {camp.location}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                            {camp.attendanceStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications & Announcements */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Bell className="w-4.5 h-4.5 text-amber-500" /> Recent Alerts & Updates
                    </h3>
                    <div className="space-y-3">
                      {notifications.slice(0, 4).map((notif) => (
                        <div key={notif.id} className="flex items-start space-x-3 text-xs leading-relaxed border-b border-slate-100 pb-2.5 last:border-none">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{notif.title}</p>
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
          )}

          {/* =====================================================
              TAB 2: APPROVED CAMPAIGNS (No open All-Campaigns section)
          ===================================================== */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">

              {/* Notice Banner */}
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs flex items-start gap-3 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold">Verified & Admin-Approved Campaigns Only</p>
                  <p className="text-emerald-800/85 mt-0.5">
                    Under CAB Regional Governance protocols, volunteers are strictly assigned to campaigns verified and approved by the Regional Admin. Self-enrollment for open unverified campaigns is restricted. If you need approval for an additional campaign, please contact your Regional Coordinator.
                  </p>
                </div>
              </div>

              {/* Cards Grid of Admin Approved Campaigns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MY_ACTIVE_CAMPAIGNS.map((camp) => (
                  <div key={camp.id} className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
                    {/* Campaign Image */}
                    <div className="h-44 relative overflow-hidden">
                      <img src={camp.image} alt={camp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Admin Approved
                      </span>
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                        {camp.type}
                      </span>
                    </div>

                    {/* Campaign Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-headline-lg text-base font-bold text-slate-900">{camp.name}</h3>
                        <div className="grid grid-cols-1 gap-2 mt-3 text-xs text-slate-600">
                          <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary shrink-0" /> {camp.date} • {camp.time}</p>
                          <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> {camp.location}</p>
                          <p className="flex items-center gap-2"><User className="w-4 h-4 text-primary shrink-0" /> Regional Lead: {camp.organizer}</p>
                          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary shrink-0" /> Emergency Line: {camp.organizerPhone}</p>
                        </div>
                      </div>

                      {/* Countdown & Status */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Starts In</p>
                          <CountdownDisplay targetDate={camp.targetDate} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${camp.attendanceStatus === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              camp.attendanceStatus === 'Checked In' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {camp.attendanceStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 3: TODAY'S AGENDA
          ===================================================== */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader icon={Timer} title="Today's Operational Schedule" subtitle="Your step-by-step agenda for today's active campaign" />
              <div className="relative mt-6">
                <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-slate-200" />
                <div className="space-y-2">
                  {TODAYS_SCHEDULE.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-4 py-3">
                      <div className={`relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 border-2 ${item.status === 'completed' ? 'bg-emerald-50 border-emerald-400 text-emerald-600' :
                          item.status === 'current' ? 'bg-primary border-primary text-white animate-pulse' :
                            'bg-slate-100 border-slate-300 text-slate-400'
                        }`}>
                        {item.status === 'completed' ? <CircleCheck className="w-5 h-5" /> :
                          item.status === 'current' ? <Circle className="w-5 h-5 fill-current" /> :
                            <Circle className="w-5 h-5" />}
                      </div>
                      <div className={`flex-1 rounded-xl p-4 transition-colors border ${item.status === 'current' ? 'bg-primary/5 border-primary/20' :
                          item.status === 'completed' ? 'bg-slate-50 border-slate-200/60 opacity-70' :
                            'bg-white border-slate-200/80'
                        }`}>
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-bold ${item.status === 'current' ? 'text-primary' : 'text-slate-900'}`}>
                            {item.title}
                          </h4>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{item.time}</span>
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
          )}

          {/* =====================================================
              TAB 4: IMPACT ANALYTICS
          ===================================================== */}
          {activeTab === 'impact' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Volunteer Hours Logged', value: stats.volunteerHours, suffix: ' hrs', icon: Clock, color: 'text-primary bg-primary/10 border-primary/20' },
                  { label: 'Approved Campaigns Done', value: stats.campaignsCompleted, suffix: '', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { label: 'Citizens Educated', value: stats.peopleReached, suffix: '+', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { label: 'Patients Navigated', value: 340, suffix: '+', icon: Heart, color: 'text-pink-600 bg-pink-50 border-pink-200' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">
                        <AnimatedCounter value={item.value} />{item.suffix}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Bar Chart */}
              <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Monthly Hours Contribution (2026)
                </h3>
                <div className="flex items-end justify-between gap-3 h-48 pt-6">
                  {MONTHLY_IMPACT.map((m, i) => {
                    const maxHours = Math.max(...MONTHLY_IMPACT.map(x => x.hours));
                    const heightPercent = (m.hours / maxHours) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {m.hours}h
                        </span>
                        <div className="w-full relative rounded-t-xl overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                          <div
                            className="absolute bottom-0 w-full rounded-t-xl bg-gradient-to-t from-primary to-primary-container transition-all duration-700 group-hover:from-secondary group-hover:to-secondary/80"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 5: ACHIEVEMENTS & REWARDS
          ===================================================== */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">

              {/* Level XP Bar */}
              <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border border-primary/20 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Medal className="w-6 h-6 text-secondary" />
                    <span className="text-base font-bold text-slate-900">Level 3 — Rising Star Volunteer</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-white px-3 py-1 rounded-full shadow-xs">750 / 1000 XP</span>
                </div>
                <div className="h-3.5 bg-slate-200 rounded-full overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary-container transition-all duration-1000" style={{ width: '75%' }} />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">250 XP remaining to unlock Level 4 — Community Champion</p>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border p-5 text-center transition-all ${badge.unlocked
                        ? 'bg-white border-outline-variant/30 shadow-xs hover:shadow-md'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                  >
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h4 className="text-xs font-bold text-slate-900">{badge.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{badge.description}</p>
                    {badge.unlocked ? (
                      <span className="inline-block mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        ✓ {badge.unlockedDate}
                      </span>
                    ) : (
                      <span className="inline-block mt-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 6: NOTIFICATION CENTER
          ===================================================== */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader
                icon={Bell}
                title="Notification Center"
                subtitle={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                action={
                  unreadCount > 0 ? (
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="px-3.5 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 cursor-pointer"
                    >
                      Mark All as Read
                    </button>
                  ) : undefined
                }
              />
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
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
          )}

          {/* =====================================================
              TAB 7: TRAINING MODULES
          ===================================================== */}
          {activeTab === 'training' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader icon={GraduationCap} title="Volunteer Training Modules" subtitle="Complete certified skill courses to enhance patient care and camp readiness" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRAINING_RESOURCES.map((res) => (
                  <div key={res.id} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${res.progress === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary'
                          }`}>
                          {resourceIcon(res.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{res.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-2">
                        <span>{res.duration}</span>
                        <span className={res.progress === 100 ? 'text-emerald-600 font-bold' : 'text-primary font-bold'}>
                          {res.progress === 100 ? '✓ Completed' : `${res.progress}% Done`}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${res.progress === 100 ? 'bg-emerald-500' : 'bg-primary'
                            }`}
                          style={{ width: `${res.progress}%` }}
                        />
                      </div>
                    </div>
                    <button className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 transition-colors cursor-pointer">
                      {res.progress === 100 ? 'Review Module' : res.progress > 0 ? 'Continue Module' : 'Start Course'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 8: CERTIFICATES
          ===================================================== */}
          {activeTab === 'certificates' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader icon={FileCheck} title="Earned Certificates" subtitle="Official appreciation certificates issued by Cancer Aware Bharat" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {CERTIFICATES.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all">
                    <div className="h-36 bg-gradient-to-br from-primary via-primary-container to-primary relative flex items-center justify-center p-4">
                      <div className="relative text-center text-white">
                        <Award className="w-10 h-10 mx-auto mb-1 text-secondary-container" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/80">Certificate of Appreciation</p>
                        <p className="text-xs font-bold mt-0.5">Cancer Aware Bharat</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{cert.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cert.campaignName}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-600">{cert.issuedDate} • {cert.hours} hrs</p>
                          <p className="font-mono text-slate-400 text-[9px] mt-0.5">{cert.certificateId}</p>
                        </div>
                        <button className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 9: PHOTO GALLERY
          ===================================================== */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader icon={Image} title="Campaign Photo Gallery" subtitle="Moments captured from screening drives and outreach events" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {GALLERY_PHOTOS.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightboxPhoto(photo.image)}
                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-slate-200 shadow-xs hover:shadow-md transition-all"
                  >
                    <img src={photo.image} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-[10px] font-bold leading-tight">{photo.caption}</p>
                      <p className="text-white/70 text-[9px] mt-0.5">{photo.campaign}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox Modal */}
          {lightboxPhoto && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxPhoto(null)}>
              <button onClick={() => setLightboxPhoto(null)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10">
                <X className="w-6 h-6" />
              </button>
              <img src={lightboxPhoto} alt="Gallery photo" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" referrerPolicy="no-referrer" onClick={e => e.stopPropagation()} />
            </div>
          )}

          {/* =====================================================
              TAB 10: VOLUNTEER FEEDBACK
          ===================================================== */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs max-w-2xl animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader icon={MessageSquare} title="Share Your Volunteer Experience" subtitle="Your insights help us refine our campaign execution and support" />
              {!feedbackSubmitted ? (
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-2">Overall Experience Rating</p>
                    <div className="flex gap-2">
                      {[
                        { emoji: '😞', label: 'Poor', value: 1 },
                        { emoji: '😐', label: 'Okay', value: 2 },
                        { emoji: '🙂', label: 'Good', value: 3 },
                        { emoji: '😊', label: 'Great', value: 4 },
                        { emoji: '🤩', label: 'Amazing', value: 5 },
                      ].map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setFeedbackRating(r.value)}
                          className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${feedbackRating === r.value
                              ? 'bg-primary/10 border-primary scale-105 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <span className="text-2xl">{r.emoji}</span>
                          <span className="text-[9px] font-semibold text-slate-600 mt-1">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="feedback-input" className="text-xs font-bold text-slate-700 mb-1 block">Comments & Suggestions</label>
                    <textarea
                      id="feedback-input"
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:bg-white outline-none transition-all text-xs resize-none"
                      placeholder="Share what went well and any operational challenges faced..."
                    />
                  </div>
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={feedbackRating === 0}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Feedback
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-emerald-200">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-title-md text-primary font-bold text-base mb-1">Feedback Submitted!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Thank you for sharing your experience. Our team will review your comments to continuously improve campaign operations.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
