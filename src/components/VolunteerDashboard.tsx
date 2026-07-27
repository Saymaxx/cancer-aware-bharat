import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Calendar, Clock, MapPin, Users, Award, Bell, BookOpen,
  FileText, MessageSquare, LogOut,
  CheckCircle, Phone,
  Download, X, Send, Sparkles, Target, BarChart3,
  GraduationCap, Play, AlertCircle, User, ArrowRight,
  Timer, CircleCheck, Circle, Terminal, CheckCircle2, UserCheck, Menu,
  QrCode, Check,
  ShieldCheck, AlertTriangle, PhoneCall, Globe, IdCard, Mail
} from 'lucide-react';
import { useToast } from './common/Toast';
import { ApiError, ApiVolunteer, getMyVolunteerProfile } from '../api/client';

import {
  MOTIVATIONAL_QUOTES, DEFAULT_VOLUNTEER_STATS,
  MY_ACTIVE_CAMPAIGNS, TODAYS_SCHEDULE, NOTIFICATIONS,
  TRAINING_RESOURCES,
  type ActiveCampaign, type Notification as NotifType, type ScheduleItem,
  type TrainingResource,
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
  onPageChange?: (page: string) => void;
  onLogout: () => void;
}

export default function VolunteerDashboard({ onPageChange, onLogout }: VolunteerDashboardProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  // Live profile data straight from the backend (name/phone/area/availableDays/motivation/createdAt)
  const [profile, setProfile] = useState<ApiVolunteer | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!volunteer?.accessToken) {
      setProfileLoading(false);
      return;
    }
    getMyVolunteerProfile(volunteer.accessToken)
      .then(setProfile)
      .catch(err => setProfileError(err instanceof ApiError ? err.message : 'Unable to load your profile.'))
      .finally(() => setProfileLoading(false));
  }, [volunteer?.accessToken]);

  // State Management
  const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [toastMessage, setToastMessage] = useState('');
  
  // Data States
  const [myCampaigns, setMyCampaigns] = useState<ActiveCampaign[]>(MY_ACTIVE_CAMPAIGNS);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(TODAYS_SCHEDULE);
  const [notifications, setNotifications] = useState<NotifType[]>(NOTIFICATIONS);
  const [trainingModules, setTrainingModules] = useState<TrainingResource[]>(TRAINING_RESOURCES);
  const [notifFilter, setNotifFilter] = useState<string>('All');
  const [userStats] = useState(() => {
    const stored = localStorage.getItem('aware_bharat_volunteer_stats');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return DEFAULT_VOLUNTEER_STATS;
  });

  // Modal States
  const [activePassModal, setActivePassModal] = useState<ActiveCampaign | null>(null);
  const [activeProtocolModal, setActiveProtocolModal] = useState<ActiveCampaign | null>(null);
  const [activeLeadContactModal, setActiveLeadContactModal] = useState<ActiveCampaign | null>(null);
  const [activeTrainingModal, setActiveTrainingModal] = useState<TrainingResource | null>(null);
  const [trainingQuizAnswer, setTrainingQuizAnswer] = useState<number | null>(null);

  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [issueCategory, setIssueCategory] = useState('Kit Shortage');
  const [issueDescription, setIssueDescription] = useState('');

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Close open modals on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePassModal(null);
        setActiveProtocolModal(null);
        setActiveLeadContactModal(null);
        setActiveTrainingModal(null);
        setShowReportIssueModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Motivational quote cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  // Action Handlers
  const handleCheckIn = (campId: string) => {
    setMyCampaigns(prev => prev.map(c => {
      if (c.id === campId) {
        showToast(`✓ Checked in successfully for ${c.name} at ${new Date().toLocaleTimeString()}!`);
        return { ...c, attendanceStatus: 'Checked In' as const };
      }
      return c;
    }));
  };

  const handleScheduleToggle = (id: string) => {
    setScheduleList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'completed' ? 'upcoming' : 'completed';
        showToast(`Schedule task "${item.title}" marked as ${nextStatus}!`);
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    showToast('Notification marked as read');
  };

  const handleClearReadNotifs = () => {
    setNotifications(prev => prev.filter(n => !n.read));
    showToast('Read notifications cleared.');
  };

  const handleCompleteTraining = (resId: string) => {
    setTrainingModules(prev => prev.map(res => {
      if (res.id === resId) {
        showToast(`🎉 Congratulations! Course "${res.title}" completed. +100 XP Earned!`);
        return { ...res, progress: 100 };
      }
      return res;
    }));
    setActiveTrainingModal(null);
    setTrainingQuizAnswer(null);
  };

  const handleReportIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;
    setShowReportIssueModal(false);
    setIssueDescription('');
    showToast('Issue report dispatched to Regional Lead & Helpdesk.');
  };

  const handleFeedbackSubmit = () => {
    if (feedbackRating > 0 && feedbackText.trim()) {
      setFeedbackSubmitted(true);
      showToast('Thank you! Your feedback has been submitted to the regional team.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aware_bharat_logged_in_volunteer');
    onLogout();
  };

  const filteredNotifications = useMemo(() => {
    if (notifFilter === 'All') return notifications;
    return notifications.filter(n => n.type === notifFilter);
  }, [notifications, notifFilter]);

  const notifIcon = (type: string) => {
    switch (type) {
      case 'campaign': return <Calendar className="w-4 h-4 text-primary" />;
      case 'announcement': return <Sparkles className="w-4 h-4 text-secondary" />;
      case 'reminder': return <AlertCircle className="w-4 h-4 text-secondary" />;
      case 'achievement': return <Award className="w-4 h-4 text-primary" />;
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
    { id: 'campaigns', label: 'Approved Campaigns', icon: Calendar, badge: myCampaigns.length },
    { id: 'schedule', label: 'Today\'s Agenda', icon: Timer },
    { id: 'training', label: 'Training Modules', icon: GraduationCap },
    { id: 'feedback', label: 'Volunteer Feedback', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: IdCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-[fadeInUp_0.3s_ease-out]">
          <CheckCircle2 className="w-4 h-4 text-slate-400" /> {toastMessage}
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR NAVIGATION
      ===================================================== */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#004349] text-white transition-all duration-300 flex flex-col justify-between select-none ${
        mobileSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <UserCheck className="w-5 h-5 text-secondary-container" />
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="font-headline-lg text-lg font-black text-white tracking-tight truncate">
                  CAB Volunteer Portal
                </span>
              )}
            </div>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto">
            {sidebarItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all cursor-pointer ${isActive
                      ? 'bg-white/10 text-white shadow-sm border-l-4 border-secondary-container'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center">
                    <IconComp className={`w-5 h-5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3.5'}`} />
                    {(!sidebarCollapsed || mobileSidebarOpen) && <span>{item.label}</span>}
                  </div>
                  {(!sidebarCollapsed || mobileSidebarOpen) && item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-secondary-container text-primary">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center rounded-xl p-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <Globe className={`w-4.5 h-4.5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3'}`} />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span>Return to Main Website</span>}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN WORKSPACE & STICKY HEADER
      ===================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9ff]">

        {/* Sticky Header Bar */}
        <header className="bg-white border-b border-outline-variant/30 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer focus:outline-none"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 lg:hidden" />
              <Terminal className="w-5 h-5 hidden lg:block" />
            </button>
            <h2 className="font-headline-lg text-base sm:text-lg font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> volunteer-node-sync
            </span>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
              {volunteerInitials}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
              title="Secure Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Panel Workspace Container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">

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
                      { label: 'Approved', value: myCampaigns.length, icon: Calendar },
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
                  { label: 'Approved Campaigns', icon: Calendar, color: 'text-primary bg-primary/10 border-primary/20', tab: 'campaigns' },
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
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Admin Approved Campaigns
                    </h3>
                    <button onClick={() => setActiveTab('campaigns')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                      View All ({myCampaigns.length})
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {myCampaigns.map((camp) => (
                      <div key={camp.id} className="p-4 border border-outline-variant/30 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200">
                            ✓ Admin Approved
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
                          {camp.attendanceStatus !== 'Checked In' && (
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
          )}

          {/* =====================================================
              TAB 2: APPROVED CAMPAIGNS
          ===================================================== */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">

              {/* Notice Banner */}
              <div className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl text-xs flex items-start gap-3 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-primary-container mt-0.5" />
                <div>
                  <p className="font-bold">Verified & Admin-Approved Campaigns Only</p>
                  <p className="text-slate-800/85 mt-0.5">
                    Under CAB Regional Governance protocols, volunteers are assigned to campaigns verified and approved by the Regional Admin. Click on any campaign below to download your Digital Event Pass, access camp safety guidelines, or mark your check-in.
                  </p>
                </div>
              </div>

              {/* Cards Grid of Admin Approved Campaigns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCampaigns.map((camp) => (
                  <div key={camp.id} className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
                    {/* Campaign Image */}
                    <div className="h-44 relative overflow-hidden">
                      <img src={camp.image} alt={camp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
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
                        </div>
                      </div>

                      {/* Action Control Panel for Campaign */}
                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Starts In</p>
                            <CountdownDisplay targetDate={camp.targetDate} />
                          </div>
                          <div>
                            {camp.attendanceStatus === 'Checked In' ? (
                              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Checked In
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCheckIn(camp.id)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                              >
                                Check-In Now
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Buttons Bar */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                          <button
                            onClick={() => setActivePassModal(camp)}
                            className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Event Pass
                          </button>
                          <button
                            onClick={() => setActiveProtocolModal(camp)}
                            className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" /> Guidelines
                          </button>
                          <button
                            onClick={() => setActiveLeadContactModal(camp)}
                            className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" /> Contact Lead
                          </button>
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
          )}

          {/* =====================================================
              NOTIFICATION CENTER (accessed via the bell icon in the header)
          ===================================================== */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader
                icon={Bell}
                title="Notification Center"
                subtitle={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                action={
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        showToast('All notifications marked as read');
                      }}
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
          )}

          {/* =====================================================
              TAB 7: TRAINING MODULES
          ===================================================== */}
          {activeTab === 'training' && (
            <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
              <SectionHeader icon={GraduationCap} title="Volunteer Training Modules" subtitle="Complete certified skill courses to enhance patient care and camp readiness" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingModules.map((res) => (
                  <div key={res.id} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${res.progress === 100 ? 'bg-slate-50 text-primary-container' : 'bg-primary/10 text-primary'
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
                        <span className={res.progress === 100 ? 'text-primary-container font-bold' : 'text-primary font-bold'}>
                          {res.progress === 100 ? '✓ Completed' : `${res.progress}% Done`}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${res.progress === 100 ? 'bg-primary' : 'bg-primary'
                            }`}
                          style={{ width: `${res.progress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTrainingModal(res)}
                      className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 transition-colors cursor-pointer"
                    >
                      {res.progress === 100 ? 'Review Module' : res.progress > 0 ? 'Continue Module' : 'Start Course'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 8: VOLUNTEER FEEDBACK
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
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-slate-200">
                    <CheckCircle className="w-8 h-8 text-primary-container" />
                  </div>
                  <h3 className="font-title-md text-primary font-bold text-base">Feedback Submitted!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Thank you for sharing your experience. Our team will review your comments to continuously improve campaign operations.</p>
                  <button
                    onClick={() => { setFeedbackSubmitted(false); setFeedbackRating(0); setFeedbackText(''); }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Submit Another Response
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              TAB 9: MY PROFILE
          ===================================================== */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              {profileLoading ? (
                <div className="bg-white rounded-2xl border border-outline-variant/30 p-10 shadow-xs flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : profileError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-xs font-semibold">
                  {profileError}
                </div>
              ) : (
                <>
                  {/* Identity Card */}
                  <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-2xl font-black text-primary">{volunteerInitials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-headline-lg text-xl font-bold text-slate-900">{profile?.name || volunteerName}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {profile?.volunteerId || volunteerId}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                            {volunteerDomain}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location */}
                  <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
                    <SectionHeader icon={IdCard} title="Contact & Location" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                        <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                          <p className="font-semibold text-slate-800 mt-0.5 break-all">{profile?.email || volunteer?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                        <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{profile?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Area / City</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{profile?.area || volunteerCity}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                        <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {profile?.createdAt
                              ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  {profile && profile.availableDays.length > 0 && (
                    <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
                      <SectionHeader icon={Calendar} title="Availability" subtitle="Days you're generally free for campaign duty" />
                      <div className="flex flex-wrap gap-2">
                        {profile.availableDays.map(day => (
                          <span key={day} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motivation / Bio */}
                  {profile?.motivation && (
                    <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
                      <SectionHeader icon={Heart} title="Motivation" />
                      <p className="text-xs text-slate-600 leading-relaxed">{profile.motivation}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>

      {/* =====================================================
          INTERACTIVE MODALS
      ===================================================== */}

      {/* 1. DIGITAL VOLUNTEER EVENT PASS MODAL */}
      {activePassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActivePassModal(null)}>
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-xs" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#004349] to-primary p-6 text-white text-center relative">
              <button onClick={() => setActivePassModal(null)} className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-2 border border-white/20">
                <UserCheck className="w-6 h-6 text-secondary-container" />
              </div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-secondary-container">Official Event Pass</p>
              <h3 className="text-base font-bold mt-1">{activePassModal.name}</h3>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center border border-slate-200">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-900">{volunteerName}</p>
                <p className="text-xs text-slate-500 font-mono">ID: {volunteerId} • {volunteerDomain}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-left text-[11px] space-y-1.5 border border-slate-200/60">
                <p><strong className="text-slate-700">Date & Time:</strong> {activePassModal.date} ({activePassModal.time})</p>
                <p><strong className="text-slate-700">Venue:</strong> {activePassModal.location}</p>
                <p><strong className="text-slate-700">Coordinator:</strong> {activePassModal.organizer} ({activePassModal.organizerPhone})</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast(`Downloading Digital Pass for ${activePassModal.name}...`);
                    setActivePassModal(null);
                  }}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" /> Download Pass PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAMP GUIDELINES MODAL */}
      {activeProtocolModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActiveProtocolModal(null)}>
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-container" /> Operational & Safety Protocol Guidelines
              </h3>
              <button onClick={() => setActiveProtocolModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-slate-600 leading-relaxed font-semibold">Standard Operating Procedures for <strong>{activeProtocolModal.name}</strong>:</p>
              <ul className="space-y-2 text-slate-700 list-disc pl-4">
                <li>Arrive at venue by <strong>{activeProtocolModal.time.split('–')[0]}</strong> for morning briefing.</li>
                <li>Wear official CAB volunteer lanyard and badge at all times.</li>
                <li>Maintain strict patient confidentiality for all screening records and medical histories.</li>
                <li>Ensure hygiene kits (sanitizers, masks, gloves) are stocked at registration tables.</li>
                <li>For any emergency or medical escalation, contact Regional Lead <strong>{activeProtocolModal.organizer}</strong> immediately.</li>
              </ul>
            </div>
            <button
              onClick={() => setActiveProtocolModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* 3. CONTACT REGIONAL LEAD MODAL */}
      {activeLeadContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActiveLeadContactModal(null)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-primary" /> Regional Lead Direct Desk
              </h3>
              <button onClick={() => setActiveLeadContactModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-center">
              <User className="w-10 h-10 text-primary mx-auto bg-primary/10 p-2 rounded-full" />
              <p className="font-bold text-slate-900 text-sm">{activeLeadContactModal.organizer}</p>
              <p className="text-slate-500 text-xs">Regional Campaign Coordinator</p>
              <p className="font-mono text-xs font-bold text-primary pt-1">{activeLeadContactModal.organizerPhone}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${activeLeadContactModal.organizerPhone}`}
                onClick={() => showToast(`Calling ${activeLeadContactModal.organizer}...`)}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90"
              >
                <Phone className="w-4 h-4" /> Call Lead
              </a>
              <button
                onClick={() => {
                  showToast(`SMS alert dispatched to ${activeLeadContactModal.organizer}`);
                  setActiveLeadContactModal(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200"
              >
                <Send className="w-4 h-4" /> Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE TRAINING MODULE MODAL */}
      {activeTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActiveTrainingModal(null)}>
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> {activeTrainingModal.title}
              </h3>
              <button onClick={() => setActiveTrainingModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                <p className="font-bold text-primary text-xs mb-1">Course Overview & Protocol Lesson</p>
                <p className="text-slate-600 text-xs leading-relaxed">{activeTrainingModal.description}</p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="font-bold text-slate-900 text-xs">Quick Knowledge Test Question:</p>
                <p className="text-slate-700">What is the primary action when a citizen presents with suspicious oral mucosal lesions during a drive?</p>
                <div className="space-y-1.5">
                  {[
                    "Direct them to immediate oncologist consultation station & log registry",
                    "Advise them to return home and monitor for 6 months",
                    "Hand them general brochures without documentation"
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTrainingQuizAnswer(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                        trainingQuizAnswer === idx ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {idx === 0 ? '✓ ' : ''}{option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCompleteTraining(activeTrainingModal.id)}
                disabled={trainingQuizAnswer !== 0}
                className="w-full py-2.5 bg-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Quiz & Complete Course (+100 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. REPORT SCHEDULE ISSUE MODAL */}
      {showReportIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowReportIssueModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Report Camp Issue / Delay
              </h3>
              <button onClick={() => setShowReportIssueModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportIssueSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                <select
                  value={issueCategory}
                  onChange={e => setIssueCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                >
                  <option value="Kit Shortage">Screening Kit Shortage</option>
                  <option value="Venue Access">Venue Access / Power Issue</option>
                  <option value="Crowd Overflow">High Patient Crowd Surge</option>
                  <option value="Medical Escalation">Emergency Medical Transport Required</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Issue Details *</label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  placeholder="Describe the operational challenge for immediate coordinator dispatch..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportIssueModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 cursor-pointer shadow-xs"
                >
                  Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
