import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Terminal, HeartPulse, Globe, LayoutDashboard, FileText, IdCard } from 'lucide-react';
import { useToast } from './common/Toast';
import { ApiError, ApiPatient, getMyPatientProfile, getPatientSession, updateMyPatientProfile } from '../api/client';
import DashboardSidebar, { SidebarFooterButton } from './common/DashboardSidebar';
import { useSidebarState } from '../hooks/useSidebarState';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useMyPatientEnquiries } from '../api/hooks';
import EnquiryModal from './EnquiryModal';
import EnquiryTimelineModal from './EnquiryTimelineModal';
import type { PatientEnquiry } from '../types';

import OverviewTab from './patient-dashboard/OverviewTab';
import MyEnquiriesTab from './patient-dashboard/MyEnquiriesTab';
import ProfileTab from './patient-dashboard/ProfileTab';

interface PatientDashboardProps {
  onLogout: () => void;
}

export default function PatientDashboard({ onLogout }: PatientDashboardProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, toggleSidebar } = useSidebarState();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const patient = useMemo(() => getPatientSession(), []);
  const patientName = patient?.name || 'Patient';
  const patientInitials = patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const [profile, setProfile] = useState<ApiPatient | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!patient?.accessToken) {
      setProfileLoading(false);
      return;
    }
    getMyPatientProfile(patient.accessToken)
      .then(setProfile)
      .catch(err => setProfileError(err instanceof ApiError ? err.message : 'Unable to load your profile.'))
      .finally(() => setProfileLoading(false));
  }, [patient?.accessToken]);

  const { enquiries, loading: enquiriesLoading, error: enquiriesError, refetch: refetchEnquiries } = useMyPatientEnquiries(patient?.accessToken || null);

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [timelineEnquiry, setTimelineEnquiry] = useState<PatientEnquiry | null>(null);

  useEscapeKey(() => {
    setShowEnquiryModal(false);
    setTimelineEnquiry(null);
  });

  const handleSaveProfile = async (name: string, phone: string) => {
    if (!patient?.accessToken) return;
    setSavingProfile(true);
    try {
      const updated = await updateMyPatientProfile(patient.accessToken, { name, phone });
      setProfile(updated);
      toast.success('Profile Updated');
    } catch (err) {
      toast.error('Update Failed', err instanceof ApiError ? err.message : 'Unable to reach the server.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aware_bharat_logged_in_patient');
    onLogout();
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'enquiries', label: 'My Enquiries', icon: FileText, badge: enquiries.length },
    { id: 'profile', label: 'My Profile', icon: IdCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      <DashboardSidebar
        items={sidebarItems}
        activeTab={activeTab}
        onSelect={(id) => { setActiveTab(id); setMobileSidebarOpen(false); }}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        bgClass="bg-[#00343a]"
        brandIcon={HeartPulse}
        brandIconWrapperClass="bg-white/10 backdrop-blur-md border border-white/20"
        brandLabel="CAB Patient Portal"
        activeAccentBorderClass="border-secondary"
        badgeClass="bg-secondary text-white"
        footer={
          <SidebarFooterButton
            icon={Globe}
            label="Return to Main Website"
            onClick={() => navigate('/')}
            expanded={!sidebarCollapsed || mobileSidebarOpen}
          />
        }
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9ff]">
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
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
              {patientInitials}
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

        <div className="p-4 sm:p-6 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <OverviewTab
              patientName={patientName}
              enquiries={enquiries}
              onSubmitNew={() => setShowEnquiryModal(true)}
              onViewTimeline={setTimelineEnquiry}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'enquiries' && (
            <MyEnquiriesTab
              enquiries={enquiries}
              loading={enquiriesLoading}
              error={enquiriesError}
              onSubmitNew={() => setShowEnquiryModal(true)}
              onViewTimeline={setTimelineEnquiry}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profileLoading={profileLoading}
              profileError={profileError}
              profile={profile}
              patientInitials={patientInitials}
              onSave={handleSaveProfile}
              saving={savingProfile}
            />
          )}
        </div>
      </main>

      <EnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        apiToken={patient?.accessToken}
        onSubmitted={() => refetchEnquiries()}
      />

      <EnquiryTimelineModal
        enquiry={timelineEnquiry}
        isOpen={!!timelineEnquiry}
        onClose={() => setTimelineEnquiry(null)}
        apiToken={patient?.accessToken}
      />
    </div>
  );
}
