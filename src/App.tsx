import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { clearAppLocalStorage, getHospitalSession, getPatientSession, getStaffSession, getVolunteerSession, logout } from './api/client';
import { isTokenExpired } from './utils/jwt';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TeamPortal from './components/TeamPortal';
import CancerAwareness from './components/CancerAwareness';

// Common Polish Components
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';

// Modals -- always mounted (visibility toggled by isOpen), used from
// essentially every page, so lazy-loading these would add Suspense
// overhead without shrinking the bundle that actually matters.
import ChatAssistant from './components/ChatAssistant';
import SitemapModal from './components/SitemapModal';
import DonateModal from './components/DonateModal';
import RiskAssessmentModal from './components/common/RiskAssessmentModal';
import FastTrackTriageFab from './components/common/FastTrackTriageFab';

// Helper to safely load lazy chunks and auto-retry/reload if a new version was deployed
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.name === 'ChunkLoadError';

      const key = 'cab_last_chunk_reload';
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();

      // Only auto-reload once within 10 seconds to prevent infinite loops
      if (isChunkError && (!lastReload || now - parseInt(lastReload, 10) > 10000)) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
      throw error;
    }
  });
}

// Lazy Loaded Route-Level Pages (Code Splitting & Performance)
const HomeTab = lazyWithRetry(() => import('./components/HomeTab'));
const AboutTab = lazyWithRetry(() => import('./components/AboutTab'));
const HospitalsTab = lazyWithRetry(() => import('./components/HospitalsTab'));
const EventsTab = lazyWithRetry(() => import('./components/EventsTab'));
const BlogsTab = lazyWithRetry(() => import('./components/BlogsTab'));
const NewsTab = lazyWithRetry(() => import('./components/NewsTab'));
const GalleryTab = lazyWithRetry(() => import('./components/GalleryTab'));
const MissionTab = lazyWithRetry(() => import('./components/MissionTab'));
const JoinUsTab = lazyWithRetry(() => import('./components/JoinUsTab'));
const DoctorsTab = lazyWithRetry(() => import('./components/DoctorsTab'));
const VolunteerAuthPage = lazyWithRetry(() => import('./components/VolunteerAuthPage'));
const AdminAuthPage = lazyWithRetry(() => import('./components/AdminAuthPage'));
const HospitalAuthPage = lazyWithRetry(() => import('./components/HospitalAuthPage'));
const PatientAuthPage = lazyWithRetry(() => import('./components/PatientAuthPage'));

const VolunteerDashboard = lazyWithRetry(() => import('./components/VolunteerDashboard'));
const AdminDashboard = lazyWithRetry(() => import('./components/AdminDashboard'));
const SuperAdminDashboard = lazyWithRetry(() => import('./components/SuperAdminDashboard'));
const HospitalDashboard = lazyWithRetry(() => import('./components/HospitalDashboard'));
const PatientDashboard = lazyWithRetry(() => import('./components/PatientDashboard'));

// Loading Fallback Spinner for Suspense
function PageLoadingFallback() {
  return (
    <div className="min-h-[500px] w-full flex items-center justify-center p-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-[3px] border-primary/10 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-primary animate-pulse">Loading...</p>
          <p className="text-xs text-on-surface-variant/60">Cancer Aware Bharat Portal</p>
        </div>
      </div>
    </div>
  );
}

// ---------- Scroll to Top ----------
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 1. Disable browser's native scroll restoration to prevent it fighting our smooth scroll
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (!hash) {
      // 2. Ensure the DOM has time to commit (important when Suspense/lazy loading is involved)
      // requestAnimationFrame ensures we wait for the next paint, followed by a slight timeout
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }, 10);
      });
    }
  }, [pathname, hash]);

  return null;
}

// ---------- Auth Guard ----------
// Exported (not just used locally) so it can be unit-tested in isolation --
// see src/App.test.tsx.
export function AuthGuard({ storageKey, requiredRole, redirectTo = '/', children }: {
  storageKey: string;
  requiredRole?: string;
  redirectTo?: string;
  children: React.ReactNode;
}) {
  try {
    const stored = localStorage.getItem(storageKey);
    const session = stored ? JSON.parse(stored) : null;
    if (!session || (requiredRole && session.role !== requiredRole)) {
      return <Navigate to={redirectTo} replace />;
    }
    // Presence + role alone let a forged localStorage entry render the
    // dashboard shell (no real data would load -- every fetch still 401s
    // server-side -- but the shell itself shouldn't render at all). Checking
    // the token's own exp claim closes that gap without needing a network
    // round-trip just to decide whether to show the route.
    if (session.accessToken && isTokenExpired(session.accessToken)) {
      localStorage.removeItem(storageKey);
      return <Navigate to={redirectTo} replace />;
    }
  } catch {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

// ---------- Public Layout ----------
function PublicLayout({
  children,
  onOpenVolunteer,
  onOpenEnquiry,
  onOpenSitemap,
  onOpenDonate,
  onOpenAssessment,
}: {
  children: React.ReactNode;
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
  onOpenSitemap: () => void;
  onOpenDonate: () => void;
  onOpenAssessment: () => void;
}) {
  const location = useLocation();
  const isAuthPage = ['/admin', '/superadmin', '/volunteer/login', '/hospital/login', '/patient/login'].includes(location.pathname);

  return (
    <>
      {/* Main Sticky Navbar */}
      <Navbar
        onOpenVolunteer={onOpenVolunteer}
        onOpenEnquiry={onOpenEnquiry}
        onOpenDonate={onOpenDonate}
      />

      {/* Page Content */}
      <Suspense fallback={<PageLoadingFallback />}>
        {children}
      </Suspense>

      {/* Footer */}
      <Footer
        onOpenVolunteer={onOpenVolunteer}
        onOpenEnquiry={onOpenEnquiry}
        onOpenSitemap={onOpenSitemap}
      />

      {/* Global Fast-Track Emergency Triage FAB (hidden on backoffice dashboard routes) */}
      {!isAuthPage && (
        <FastTrackTriageFab
          onOpenAssessment={onOpenAssessment}
          onOpenEnquiry={onOpenEnquiry}
        />
      )}
    </>
  );
}

// ---------- App Inner Component ----------
function AppContent() {
  const navigate = useNavigate();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [sitemapOpen, setSitemapOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  // To allow pre-selecting a hospital when opening the Enquiry modal
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>(undefined);

  const handleOpenEnquiryForHospital = (hospitalId?: string) => {
    setSelectedHospitalId(hospitalId);
    setEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
    setEnquiryOpen(false);
    setSelectedHospitalId(undefined);
  };

  const publicLayoutProps = {
    onOpenVolunteer: () => navigate('/volunteer/login?mode=register'),
    onOpenEnquiry: () => handleOpenEnquiryForHospital(undefined),
    onOpenSitemap: () => setSitemapOpen(true),
    onOpenDonate: () => setDonateOpen(true),
    onOpenAssessment: () => setAssessmentOpen(true),
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between">
      <Routes>
        {/* ===== Public Pages (with Navbar/Footer layout) ===== */}
        <Route path="/" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <HomeTab
                onOpenVolunteer={() => navigate('/volunteer/login?mode=register')}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/about" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <AboutTab
                onOpenVolunteer={() => navigate('/volunteer/login?mode=register')}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/hospitals" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <HospitalsTab
                onOpenEnquiry={handleOpenEnquiryForHospital}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/events" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <EventsTab
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/blogs" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <BlogsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/news" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <NewsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/gallery" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <GalleryTab
                onOpenVolunteer={() => navigate('/volunteer/login?mode=register')}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/mission" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <MissionTab
                onOpenVolunteer={() => navigate('/volunteer/login?mode=register')}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/join-us" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <JoinUsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/doctors" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <DoctorsTab
                onOpenEnquiry={(hName) => handleOpenEnquiryForHospital(hName)}
                onOpenVolunteer={() => navigate('/volunteer/login?mode=register')}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/cancer-awareness" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full">
              <CancerAwareness />
            </main>
          </PublicLayout>
        } />
        <Route path="/our-team" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full">
              <TeamPortal />
            </main>
          </PublicLayout>
        } />

        {/* ===== Auth Pages (with Navbar/Footer layout) ===== */}
        <Route path="/volunteer/login" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full mx-auto">
              <VolunteerAuthPage />
            </main>
          </PublicLayout>
        } />
        <Route path="/hospital/login" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full mx-auto">
              <HospitalAuthPage />
            </main>
          </PublicLayout>
        } />
        {/* Patient Portal is deliberately disabled for now (product
            decision, not removed -- PatientAuthPage/PatientDashboard and
            the entire backend /patients/* API stay intact underneath).
            Re-enable by uncommenting this route, the /patient/dashboard
            route below, and the two "Patient Login" nav entries in
            Navbar.tsx. */}
        {/* <Route path="/patient/login" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full mx-auto">
              <PatientAuthPage />
            </main>
          </PublicLayout>
        } /> */}

        {/* ===== Hidden Admin Auth Pages ===== */}
        <Route path="/admin" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full mx-auto">
              <AdminAuthPage initialRole="admin" lockedRole="admin" />
            </main>
          </PublicLayout>
        } />
        <Route path="/superadmin" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full mx-auto">
              <AdminAuthPage initialRole="superadmin" lockedRole="superadmin" />
            </main>
          </PublicLayout>
        } />

        {/* ===== Protected Dashboard Pages (Lazy Loaded for Performance) ===== */}
        <Route path="/volunteer/dashboard" element={
          <AuthGuard storageKey="aware_bharat_logged_in_volunteer" redirectTo="/volunteer/login">
            <main className="flex-grow w-full mx-auto">
              <Suspense fallback={<PageLoadingFallback />}>
                <VolunteerDashboard
                  onLogout={() => {
                    const token = getVolunteerSession()?.accessToken;
                    clearAppLocalStorage();
                    navigate('/volunteer/login');
                    if (token) logout(token);
                  }}
                />
              </Suspense>
            </main>
          </AuthGuard>
        } />
        <Route path="/hospital/dashboard" element={
          <AuthGuard storageKey="aware_bharat_logged_in_hospital" redirectTo="/hospital/login">
            <main className="flex-grow w-full mx-auto">
              <Suspense fallback={<PageLoadingFallback />}>
                <HospitalDashboard
                  onLogout={() => {
                    const token = getHospitalSession()?.accessToken;
                    clearAppLocalStorage();
                    navigate('/hospital/login');
                    if (token) logout(token);
                  }}
                />
              </Suspense>
            </main>
          </AuthGuard>
        } />
        <Route path="/admin/dashboard" element={
          <AuthGuard storageKey="aware_bharat_logged_in_staff" requiredRole="admin" redirectTo="/admin">
            <main className="flex-grow w-full mx-auto">
              <Suspense fallback={<PageLoadingFallback />}>
                <AdminDashboard
                  onLogout={() => {
                    const token = getStaffSession()?.accessToken;
                    clearAppLocalStorage();
                    navigate('/admin');
                    if (token) logout(token);
                  }}
                />
              </Suspense>
            </main>
          </AuthGuard>
        } />
        <Route path="/superadmin/dashboard" element={
          <AuthGuard storageKey="aware_bharat_logged_in_staff" requiredRole="superadmin" redirectTo="/superadmin">
            <main className="flex-grow w-full mx-auto">
              <Suspense fallback={<PageLoadingFallback />}>
                <SuperAdminDashboard
                  onLogout={() => {
                    const token = getStaffSession()?.accessToken;
                    clearAppLocalStorage();
                    navigate('/superadmin');
                    if (token) logout(token);
                  }}
                />
              </Suspense>
            </main>
          </AuthGuard>
        } />

        {/* <Route path="/patient/dashboard" element={
          <AuthGuard storageKey="aware_bharat_logged_in_patient" redirectTo="/patient/login">
            <main className="flex-grow w-full mx-auto">
              <Suspense fallback={<PageLoadingFallback />}>
                <PatientDashboard
                  onLogout={() => {
                    const token = getPatientSession()?.accessToken;
                    clearAppLocalStorage();
                    navigate('/patient/login');
                    if (token) logout(token);
                  }}
                />
              </Suspense>
            </main>
          </AuthGuard>
        } /> */}

        {/* ===== Catch-all ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* High-fidelity Interactive Modals */}
      <ChatAssistant
        isOpen={enquiryOpen}
        onClose={handleCloseEnquiry}
      />

      <SitemapModal
        isOpen={sitemapOpen}
        onClose={() => setSitemapOpen(false)}
        onOpenVolunteer={() => navigate('/volunteer/login?mode=register')}
        onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
      />

      <DonateModal
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
      />

      <RiskAssessmentModal
        isOpen={assessmentOpen}
        onClose={() => setAssessmentOpen(false)}
        onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
      />
    </div>
  );
}

// Global Provider Wrapper Export
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          <ScrollToTop />
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
