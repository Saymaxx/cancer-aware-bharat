import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, Bell, LogOut, CheckCircle2, Terminal, UserCheck, Menu,
  BarChart3, Timer, GraduationCap, MessageSquare, IdCard, Globe, Clock3,
} from 'lucide-react';
import { useToast } from './common/Toast';
import { ApiError, ApiVolunteer, checkInToCampaign, enrollInCampaign, getMyVolunteerProfile, logMyVolunteerHours, markNotificationRead, submitMyVolunteerFeedback, submitMyVolunteerIssue, updateMyTrainingProgress } from '../api/client';
import { useApiNotifications, useEvents, useMyCampaigns, useMyTrainingProgress, useMyVolunteerFeedback, useMyVolunteerHours } from '../api/hooks';
import DashboardSidebar, { SidebarFooterButton } from './common/DashboardSidebar';
import { useSidebarState } from '../hooks/useSidebarState';
import { useEscapeKey } from '../hooks/useEscapeKey';

import {
  MOTIVATIONAL_QUOTES, DEFAULT_VOLUNTEER_STATS,
  TODAYS_SCHEDULE,
  TRAINING_RESOURCES,
  type ActiveCampaign, type Notification as NotifType, type ScheduleItem,
  type TrainingResource,
} from '../volunteerDashboardData';

import OverviewTab from './volunteer-dashboard/OverviewTab';
import CampaignsTab from './volunteer-dashboard/CampaignsTab';
import ScheduleTab from './volunteer-dashboard/ScheduleTab';
import NotificationsPanel from './volunteer-dashboard/NotificationsPanel';
import TrainingTab from './volunteer-dashboard/TrainingTab';
import FeedbackTab from './volunteer-dashboard/FeedbackTab';
import HoursTab from './volunteer-dashboard/HoursTab';
import ProfileTab from './volunteer-dashboard/ProfileTab';
import {
  EventPassModal, ProtocolModal, LeadContactModal, TrainingModuleModal, ReportIssueModal,
} from './volunteer-dashboard/Modals';

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
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, toggleSidebar } = useSidebarState();
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

  // Real notifications from the backend (broadcasts from Admin/Super Admin,
  // see POST /notifications/broadcast) -- the backend has no "type"
  // (campaign/announcement/reminder/achievement) concept, so every
  // notification is bucketed as 'announcement'. Read state is real and
  // per-recipient (POST /notifications/{id}/read, see NotificationRead);
  // locallyReadIds is just an optimistic overlay so the UI updates
  // instantly instead of waiting for the next poll. "Clearing" a
  // notification has no backend equivalent (no archive/delete endpoint) --
  // locallyClearedIds only hides it from this browser tab.
  const { notifications: apiNotifications, refetch: refetchNotifications } = useApiNotifications(volunteer?.accessToken || null);
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(new Set());
  const [locallyClearedIds, setLocallyClearedIds] = useState<Set<string>>(new Set());
  const notifications: NotifType[] = useMemo(() => apiNotifications
    .filter(n => !locallyClearedIds.has(n.id))
    .map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.timestamp,
      type: 'announcement' as const,
      read: n.read || locallyReadIds.has(n.id),
    })), [apiNotifications, locallyReadIds, locallyClearedIds]);

  // Real campaign enrollment (Event model) -- organizer/organizerPhone and
  // targetDate have no backing field on Event (freeform date/time strings,
  // no coordinator contact), so those are left blank rather than fabricated;
  // CampaignsTab hides the countdown/coordinator UI when they're empty.
  const { campaigns: myEnrollments, refetch: refetchMyCampaigns } = useMyCampaigns(volunteer?.accessToken || null);
  const { events: allEvents } = useEvents();
  const myCampaigns: ActiveCampaign[] = useMemo(() => myEnrollments.map(e => ({
    id: e.eventId,
    name: e.event.title,
    type: e.event.type,
    date: e.event.date,
    time: e.event.time,
    location: e.event.location,
    organizer: '',
    organizerPhone: '',
    attendanceStatus:
      e.status === 'Rejected' ? 'Rejected' as const :
      e.status === 'Pending' ? 'Pending' as const :
      e.checkedInAt ? 'Checked In' as const : 'Confirmed' as const,
    decisionNotes: e.decisionNotes || undefined,
    targetDate: '',
    image: e.event.image || '',
  })), [myEnrollments]);
  const enrolledEventIds = useMemo(() => new Set(myEnrollments.map(e => e.eventId)), [myEnrollments]);
  const openCampaigns = useMemo(
    () => allEvents.filter(ev => ev.status === 'Scheduled' && !enrolledEventIds.has(ev.id)),
    [allEvents, enrolledEventIds],
  );

  const handleEnroll = async (eventId: string) => {
    if (!volunteer?.accessToken) return;
    try {
      await enrollInCampaign(eventId, volunteer.accessToken);
      showToast('Enrollment request submitted! Awaiting Admin approval.');
      refetchMyCampaigns();
    } catch (err) {
      toast.error('Enrollment Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(TODAYS_SCHEDULE);
  // Real per-volunteer completion progress merged onto the static resource
  // catalog -- a resource with no backend row yet is 0% for this volunteer,
  // not the catalog's old hardcoded per-resource "everyone sees the same
  // progress" numbers.
  const { progress: trainingProgress, refetch: refetchTrainingProgress } = useMyTrainingProgress(volunteer?.accessToken || null);
  const trainingModules: TrainingResource[] = useMemo(() => {
    const byResource = new Map(trainingProgress.map(p => [p.resourceId, p.progress]));
    return TRAINING_RESOURCES.map(res => ({ ...res, progress: byResource.get(res.id) ?? 0 }));
  }, [trainingProgress]);
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
  const { feedback: myFeedback, loading: myFeedbackLoading, refetch: refetchMyFeedback } = useMyVolunteerFeedback(volunteer?.accessToken || null);
  const [feedbackCampaignName, setFeedbackCampaignName] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Hours Tracking State
  const { hoursLogs: myHoursLogs, loading: myHoursLoading, refetch: refetchMyHours } = useMyVolunteerHours(volunteer?.accessToken || null);
  const [hoursActivity, setHoursActivity] = useState('');
  const [hoursValue, setHoursValue] = useState('');
  const [hoursLogDate, setHoursLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hoursSubmitting, setHoursSubmitting] = useState(false);
  const [hoursSubmitError, setHoursSubmitError] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEscapeKey(() => {
    setActivePassModal(null);
    setActiveProtocolModal(null);
    setActiveLeadContactModal(null);
    setActiveTrainingModal(null);
    setShowReportIssueModal(false);
  });

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
  const handleCheckIn = async (campId: string) => {
    if (!volunteer?.accessToken) return;
    try {
      await checkInToCampaign(campId, volunteer.accessToken);
      showToast(`✓ Checked in successfully at ${new Date().toLocaleTimeString()}!`);
      refetchMyCampaigns();
    } catch (err) {
      toast.error('Check-In Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
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
    setLocallyReadIds(prev => new Set(prev).add(id));
    showToast('Notification marked as read');
    if (!volunteer?.accessToken) return;
    // Notifications are non-critical (matches useApiNotifications' own
    // fail-silently stance) -- locallyReadIds already reflects "read" for
    // this session even if the real call fails.
    markNotificationRead(id, volunteer.accessToken).then(() => refetchNotifications()).catch(() => {});
  };

  const handleClearReadNotifs = () => {
    setLocallyClearedIds(prev => {
      const updated = new Set(prev);
      notifications.filter(n => n.read).forEach(n => updated.add(n.id));
      return updated;
    });
    showToast('Read notifications cleared.');
  };

  const handleCompleteTraining = async (resId: string) => {
    if (!volunteer?.accessToken) return;
    const res = TRAINING_RESOURCES.find(r => r.id === resId);
    try {
      await updateMyTrainingProgress(resId, 100, volunteer.accessToken);
      showToast(`🎉 Congratulations! Course "${res?.title ?? ''}" completed. +100 XP Earned!`);
      refetchTrainingProgress();
    } catch (err) {
      toast.error('Could Not Save Progress', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
    setActiveTrainingModal(null);
    setTrainingQuizAnswer(null);
  };

  const handleReportIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim() || !volunteer?.accessToken) return;
    try {
      await submitMyVolunteerIssue({ category: issueCategory, description: issueDescription.trim() }, volunteer.accessToken);
      setShowReportIssueModal(false);
      setIssueDescription('');
      showToast('Issue report submitted for admin review.');
    } catch (err) {
      toast.error('Could Not Submit Report', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!(feedbackRating > 0 && feedbackCampaignName.trim() && feedbackText.trim() && volunteer?.accessToken)) return;
    setFeedbackSubmitting(true);
    setFeedbackSubmitError('');
    try {
      await submitMyVolunteerFeedback(
        { campaignName: feedbackCampaignName.trim(), rating: feedbackRating, comment: feedbackText.trim() },
        volunteer.accessToken,
      );
      setFeedbackSubmitted(true);
      refetchMyFeedback();
      showToast('Thank you! Your feedback has been submitted to the regional team.');
    } catch (err) {
      setFeedbackSubmitError(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleLogHours = async () => {
    const hoursNum = Number(hoursValue);
    if (!(hoursActivity.trim() && hoursLogDate && hoursNum > 0 && volunteer?.accessToken)) return;
    setHoursSubmitting(true);
    setHoursSubmitError('');
    try {
      await logMyVolunteerHours(
        { activity: hoursActivity.trim(), hours: hoursNum, logDate: hoursLogDate },
        volunteer.accessToken,
      );
      setHoursActivity('');
      setHoursValue('');
      setHoursLogDate(new Date().toISOString().slice(0, 10));
      refetchMyHours();
      getMyVolunteerProfile(volunteer.accessToken).then(setProfile).catch(() => {});
      showToast('Hours logged successfully.');
    } catch (err) {
      setHoursSubmitError(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setHoursSubmitting(false);
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

  // Sidebar navigation links
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'My Campaigns', icon: Calendar, badge: myCampaigns.filter(c => c.attendanceStatus !== 'Rejected').length },
    { id: 'schedule', label: 'Today\'s Agenda', icon: Timer },
    { id: 'training', label: 'Training Modules', icon: GraduationCap },
    { id: 'hours', label: 'My Hours', icon: Clock3 },
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

      <DashboardSidebar
        items={sidebarItems}
        activeTab={activeTab}
        onSelect={(id) => {
          setActiveTab(id);
          setMobileSidebarOpen(false);
        }}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        bgClass="bg-[#3d2e12]"
        brandIcon={UserCheck}
        brandIconWrapperClass="bg-white/10 backdrop-blur-md border border-white/20"
        brandLabel="CAB Volunteer Portal"
        activeAccentBorderClass="border-amber-400"
        badgeClass="bg-amber-400 text-[#3d2e12]"
        footer={
          <SidebarFooterButton
            icon={Globe}
            label="Return to Main Website"
            onClick={() => navigate('/')}
            expanded={!sidebarCollapsed || mobileSidebarOpen}
          />
        }
      />

      {/* =====================================================
          MAIN WORKSPACE & STICKY HEADER
      ===================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9ff]">

        {/* Sticky Header Bar */}
        <header className="bg-white border-b border-outline-variant/30 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer focus:outline-none"
              title="Toggle Navigation Menu"
              aria-label="Toggle menu"
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

          {activeTab === 'dashboard' && (
            <OverviewTab
              volunteerInitials={volunteerInitials}
              volunteerName={volunteerName}
              volunteerId={volunteerId}
              volunteerDomain={volunteerDomain}
              volunteerCity={volunteerCity}
              currentQuote={currentQuote}
              myCampaigns={myCampaigns}
              userStats={{ ...userStats, volunteerHours: profile?.totalHours ?? 0 }}
              notifications={notifications}
              setActiveTab={setActiveTab}
              handleCheckIn={handleCheckIn}
              markNotifRead={markNotifRead}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsTab
              myCampaigns={myCampaigns}
              openCampaigns={openCampaigns}
              handleEnroll={handleEnroll}
              handleCheckIn={handleCheckIn}
              setActivePassModal={setActivePassModal}
              setActiveProtocolModal={setActiveProtocolModal}
              setActiveLeadContactModal={setActiveLeadContactModal}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              scheduleList={scheduleList}
              handleScheduleToggle={handleScheduleToggle}
              setShowReportIssueModal={setShowReportIssueModal}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel
              unreadCount={unreadCount}
              notifFilter={notifFilter}
              setNotifFilter={setNotifFilter}
              filteredNotifications={filteredNotifications}
              markNotifRead={markNotifRead}
              markAllRead={() => {
                const unread = notifications.filter(n => !n.read);
                setLocallyReadIds(prev => {
                  const updated = new Set(prev);
                  notifications.forEach(n => updated.add(n.id));
                  return updated;
                });
                showToast('All notifications marked as read');
                if (volunteer?.accessToken) {
                  Promise.all(unread.map(n => markNotificationRead(n.id, volunteer.accessToken)))
                    .then(() => refetchNotifications())
                    .catch(() => {});
                }
              }}
              handleClearReadNotifs={handleClearReadNotifs}
            />
          )}

          {activeTab === 'training' && (
            <TrainingTab
              trainingModules={trainingModules}
              setActiveTrainingModal={setActiveTrainingModal}
            />
          )}

          {activeTab === 'hours' && (
            <HoursTab
              totalHours={profile?.totalHours ?? 0}
              hoursLogs={myHoursLogs}
              hoursLoading={myHoursLoading}
              activity={hoursActivity}
              setActivity={setHoursActivity}
              hoursValue={hoursValue}
              setHoursValue={setHoursValue}
              logDate={hoursLogDate}
              setLogDate={setHoursLogDate}
              submitting={hoursSubmitting}
              submitError={hoursSubmitError}
              handleLogHours={handleLogHours}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackTab
              campaignName={feedbackCampaignName}
              setCampaignName={setFeedbackCampaignName}
              feedbackRating={feedbackRating}
              setFeedbackRating={setFeedbackRating}
              feedbackText={feedbackText}
              setFeedbackText={setFeedbackText}
              submitting={feedbackSubmitting}
              submitError={feedbackSubmitError}
              handleFeedbackSubmit={handleFeedbackSubmit}
              justSubmitted={feedbackSubmitted}
              resetFeedback={() => {
                setFeedbackSubmitted(false);
                setFeedbackRating(0);
                setFeedbackText('');
                setFeedbackCampaignName('');
                setFeedbackSubmitError('');
              }}
              myFeedback={myFeedback}
              myFeedbackLoading={myFeedbackLoading}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profileLoading={profileLoading}
              profileError={profileError}
              profile={profile}
              volunteerName={volunteerName}
              volunteerInitials={volunteerInitials}
              volunteerId={volunteerId}
              volunteerDomain={volunteerDomain}
              volunteerCity={volunteerCity}
              volunteerEmail={volunteer?.email}
            />
          )}

        </div>
      </main>

      {/* =====================================================
          INTERACTIVE MODALS
      ===================================================== */}

      {activePassModal && (
        <EventPassModal
          campaign={activePassModal}
          onClose={() => setActivePassModal(null)}
          volunteerName={volunteerName}
          volunteerId={volunteerId}
          volunteerDomain={volunteerDomain}
          showToast={showToast}
        />
      )}

      {activeProtocolModal && (
        <ProtocolModal campaign={activeProtocolModal} onClose={() => setActiveProtocolModal(null)} />
      )}

      {activeLeadContactModal && (
        <LeadContactModal
          campaign={activeLeadContactModal}
          onClose={() => setActiveLeadContactModal(null)}
          showToast={showToast}
        />
      )}

      {activeTrainingModal && (
        <TrainingModuleModal
          resource={activeTrainingModal}
          onClose={() => setActiveTrainingModal(null)}
          quizAnswer={trainingQuizAnswer}
          setQuizAnswer={setTrainingQuizAnswer}
          onComplete={handleCompleteTraining}
        />
      )}

      {showReportIssueModal && (
        <ReportIssueModal
          onClose={() => setShowReportIssueModal(false)}
          issueCategory={issueCategory}
          setIssueCategory={setIssueCategory}
          issueDescription={issueDescription}
          setIssueDescription={setIssueDescription}
          onSubmit={handleReportIssueSubmit}
        />
      )}

    </div>
  );
}
