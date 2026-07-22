import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, Calendar, Clock, MapPin, Users, Award, Bell, BookOpen,
  FileText, Image, MessageSquare, LogOut, ChevronRight, ChevronDown,
  CheckCircle, Star, TrendingUp, Shield, Phone, ExternalLink,
  Download, X, Eye, Send, Sparkles, Target, Zap, BarChart3,
  GraduationCap, Play, FileCheck, AlertCircle, User, ArrowRight,
  Timer, CircleCheck, Circle, Flame, Medal, Terminal, CheckCircle2, UserCheck, Menu,
  QrCode, Share2, PlusCircle, Check, Printer, RefreshCw, Filter,
  ShieldCheck, AlertTriangle, PhoneCall, Mail, Globe
} from 'lucide-react';

import {
  MOTIVATIONAL_QUOTES, DEFAULT_VOLUNTEER_STATS,
  MY_ACTIVE_CAMPAIGNS, TODAYS_SCHEDULE, ACHIEVEMENTS, NOTIFICATIONS,
  TRAINING_RESOURCES, CERTIFICATES, GALLERY_PHOTOS, MONTHLY_IMPACT,
  type ActiveCampaign, type Notification as NotifType, type ScheduleItem,
  type TrainingResource, type Certificate, type Achievement, type GalleryPhoto
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

  // State Management
  const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [toastMessage, setToastMessage] = useState('');
  
  // Data States
  const [myCampaigns, setMyCampaigns] = useState<ActiveCampaign[]>(MY_ACTIVE_CAMPAIGNS);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(TODAYS_SCHEDULE);
  const [notifications, setNotifications] = useState<NotifType[]>(NOTIFICATIONS);
  const [trainingModules, setTrainingModules] = useState<TrainingResource[]>(TRAINING_RESOURCES);
  const [galleryList, setGalleryList] = useState<GalleryPhoto[]>(GALLERY_PHOTOS);
  const [notifFilter, setNotifFilter] = useState<string>('All');
  const [userStats, setUserStats] = useState(DEFAULT_VOLUNTEER_STATS);

  // Modal States
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [activePassModal, setActivePassModal] = useState<ActiveCampaign | null>(null);
  const [activeProtocolModal, setActiveProtocolModal] = useState<ActiveCampaign | null>(null);
  const [activeLeadContactModal, setActiveLeadContactModal] = useState<ActiveCampaign | null>(null);
  const [activeTrainingModal, setActiveTrainingModal] = useState<TrainingResource | null>(null);
  const [trainingQuizAnswer, setTrainingQuizAnswer] = useState<number | null>(null);
  const [activeCertModal, setActiveCertModal] = useState<Certificate | null>(null);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<Achievement | null>(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCampaign, setNewPhotoCampaign] = useState('Oral Screening Drive');
  
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);
  const [loggedHoursCount, setLoggedHoursCount] = useState<number>(4);
  const [loggedHoursActivity, setLoggedHoursActivity] = useState('');
  
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

  const handlePhotoUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoCaption.trim()) return;
    const newPhoto: GalleryPhoto = {
      id: 'photo-' + Date.now(),
      image: newPhotoUrl.trim() || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      caption: newPhotoCaption,
      campaign: newPhotoCampaign,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setGalleryList(prev => [newPhoto, ...prev]);
    setShowPhotoUploadModal(false);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    showToast('Photo successfully submitted to campaign gallery!');
  };

  const handleLogHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loggedHoursCount <= 0 || !loggedHoursActivity.trim()) return;
    setUserStats(prev => ({
      ...prev,
      volunteerHours: prev.volunteerHours + loggedHoursCount
    }));
    setShowLogHoursModal(false);
    setLoggedHoursActivity('');
    showToast(`✓ ${loggedHoursCount} volunteer hours logged successfully for approval!`);
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
    { id: 'campaigns', label: 'Approved Campaigns', icon: Calendar, badge: myCampaigns.length },
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

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-[fadeInUp_0.3s_ease-out]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
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
            onClick={() => onPageChange('home')}
            className="w-full flex items-center rounded-xl p-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <Globe className={`w-4.5 h-4.5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3'}`} />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span>Return to Main Website</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center rounded-xl p-2.5 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/20 cursor-pointer transition-colors"
          >
            <LogOut className={`w-4.5 h-4.5 shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : 'mr-3'}`} />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span>Secure Logout</span>}
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
                      View All ({myCampaigns.length})
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {myCampaigns.map((camp) => (
                      <div key={camp.id} className="p-4 border border-outline-variant/30 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            ✓ Admin Approved
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1.5">{camp.name}</h4>
                          <p className="text-slate-500 mt-0.5">{camp.date} • {camp.location}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            camp.attendanceStatus === 'Checked In' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'
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
                      <Bell className="w-4.5 h-4.5 text-amber-500" /> Recent Alerts & Updates
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
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs flex items-start gap-3 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold">Verified & Admin-Approved Campaigns Only</p>
                  <p className="text-emerald-800/85 mt-0.5">
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
                              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
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
                        className={`relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 border-2 transition-transform hover:scale-110 cursor-pointer ${item.status === 'completed' ? 'bg-emerald-50 border-emerald-400 text-emerald-600' :
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
                                item.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              TAB 4: IMPACT ANALYTICS
          ===================================================== */}
          {activeTab === 'impact' && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div className="flex items-center justify-between">
                <SectionHeader icon={TrendingUp} title="Volunteer Impact Metrics" subtitle="Quantifiable healthcare contributions tracked by Cancer Aware Bharat" />
                <button
                  onClick={() => setShowLogHoursModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Log Extra Hours
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Volunteer Hours Logged', value: userStats.volunteerHours, suffix: ' hrs', icon: Clock, color: 'text-primary bg-primary/10 border-primary/20' },
                  { label: 'Approved Campaigns Done', value: userStats.campaignsCompleted, suffix: '', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { label: 'Citizens Educated', value: userStats.peopleReached, suffix: '+', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
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
                    onClick={() => setSelectedBadgeModal(badge)}
                    className={`rounded-2xl border p-5 text-center transition-all cursor-pointer ${badge.unlocked
                        ? 'bg-white border-outline-variant/30 shadow-xs hover:shadow-md hover:scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
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
                        <button
                          onClick={() => setActiveCertModal(cert)}
                          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                          title="View / Download Certificate"
                        >
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
              <SectionHeader 
                icon={Image} 
                title="Campaign Photo Gallery" 
                subtitle="Moments captured from screening drives and outreach events" 
                action={
                  <button
                    onClick={() => setShowPhotoUploadModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Submit Photo
                  </button>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryList.map((photo) => (
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
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
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
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Operational & Safety Protocol Guidelines
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
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Quiz & Complete Course (+100 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL CERTIFICATE PREVIEW MODAL */}
      {activeCertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveCertModal(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border-4 border-amber-300 relative space-y-6 text-slate-900" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveCertModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center space-y-2">
              <Award className="w-16 h-16 text-amber-500 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Certificate of Healthcare Contribution</p>
              <h2 className="text-2xl font-black text-slate-900 font-headline-lg">{activeCertModal.title}</h2>
              <p className="text-xs text-slate-500">Issued by <strong>Cancer Aware Bharat Trust</strong></p>
            </div>
            <div className="text-center space-y-3 py-4 border-y border-amber-200">
              <p className="text-xs text-slate-600">This is to certify that</p>
              <p className="text-xl font-bold text-primary font-headline-lg">{volunteerName}</p>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully served as an active healthcare volunteer for <strong>{activeCertModal.campaignName}</strong> logging <strong>{activeCertModal.hours} hours</strong> of dedicated community outreach and patient navigation.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Issue Date</p>
                <p className="font-bold text-slate-800">{activeCertModal.issuedDate}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-[10px] text-slate-400">{activeCertModal.certificateId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Authorized Signatory</p>
                <p className="font-bold text-slate-800">Dr. Ramesh Sharma, Director</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                  showToast(`Printing Certificate: ${activeCertModal.title}`);
                }}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. BADGE DETAILS MODAL */}
      {selectedBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedBadgeModal(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center text-xs" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-2">{selectedBadgeModal.icon}</div>
            <h3 className="font-bold text-base text-slate-900">{selectedBadgeModal.name}</h3>
            <p className="text-slate-600 leading-relaxed">{selectedBadgeModal.description}</p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requirement</p>
              <p className="font-semibold text-slate-800 mt-0.5">{selectedBadgeModal.requirement}</p>
            </div>
            {selectedBadgeModal.unlocked ? (
              <p className="text-emerald-600 font-bold text-xs">✓ Earned on {selectedBadgeModal.unlockedDate}</p>
            ) : (
              <p className="text-slate-400 font-bold text-xs">🔒 Complete requirement to unlock +150 XP</p>
            )}
            <button
              onClick={() => setSelectedBadgeModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 7. SUBMIT PHOTO MODAL */}
      {showPhotoUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowPhotoUploadModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" /> Submit Photo to Gallery
              </h3>
              <button onClick={() => setShowPhotoUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePhotoUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Caption Description *</label>
                <input
                  type="text"
                  required
                  value={newPhotoCaption}
                  onChange={e => setNewPhotoCaption(e.target.value)}
                  placeholder="e.g. Doctor counseling patient during screening..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Campaign Drive</label>
                <select
                  value={newPhotoCampaign}
                  onChange={e => setNewPhotoCampaign(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                >
                  <option value="Oral Screening Drive">Free Oral Cancer Screening Drive</option>
                  <option value="Community Blood Donation">Community Blood Donation Camp</option>
                  <option value="Rural Village Outreach">Rural Village Outreach - Rewari</option>
                  <option value="Women's Health Awareness">Women's Breast Health Drive</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoUploadModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Upload Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. LOG EXTRA HOURS MODAL */}
      {showLogHoursModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowLogHoursModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Log Extra Volunteer Hours
              </h3>
              <button onClick={() => setShowLogHoursModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLogHoursSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hours Spent *</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  required
                  value={loggedHoursCount}
                  onChange={e => setLoggedHoursCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Activity Description *</label>
                <textarea
                  rows={3}
                  required
                  value={loggedHoursActivity}
                  onChange={e => setLoggedHoursActivity(e.target.value)}
                  placeholder="e.g. Conducted phone counseling for 12 patients and distributed awareness pamphlets in local sector..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogHoursModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Submit Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. REPORT SCHEDULE ISSUE MODAL */}
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
