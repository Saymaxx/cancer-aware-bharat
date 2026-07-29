import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import VolunteerModal from './components/VolunteerModal';
import ChatAssistant from './components/ChatAssistant';
import SitemapModal from './components/SitemapModal';

// Lazy Loaded Route-Level Pages (Code Splitting & Performance).
// Previously only the 4 dashboards were split out this way -- every public
// tab and auth page was eagerly bundled into the one entry chunk even
// though a visitor only ever loads one of them per page view.
const HomeTab = lazy(() => import('./components/HomeTab'));
const AboutTab = lazy(() => import('./components/AboutTab'));
const HospitalsTab = lazy(() => import('./components/HospitalsTab'));
const EventsTab = lazy(() => import('./components/EventsTab'));
const BlogsTab = lazy(() => import('./components/BlogsTab'));
const NewsTab = lazy(() => import('./components/NewsTab'));
const GalleryTab = lazy(() => import('./components/GalleryTab'));
const MissionTab = lazy(() => import('./components/MissionTab'));
const JoinUsTab = lazy(() => import('./components/JoinUsTab'));
const DoctorsTab = lazy(() => import('./components/DoctorsTab'));
const VolunteerAuthPage = lazy(() => import('./components/VolunteerAuthPage'));
const AdminAuthPage = lazy(() => import('./components/AdminAuthPage'));
const HospitalAuthPage = lazy(() => import('./components/HospitalAuthPage'));
const PatientAuthPage = lazy(() => import('./components/PatientAuthPage'));

const VolunteerDashboard = lazy(() => import('./components/VolunteerDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const HospitalDashboard = lazy(() => import('./components/HospitalDashboard'));
const PatientDashboard = lazy(() => import('./components/PatientDashboard'));

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
}: {
  children: React.ReactNode;
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
  onOpenSitemap: () => void;
}) {
  const location = useLocation();
  const isAuthPage = ['/admin', '/superadmin', '/volunteer/login', '/hospital/login', '/patient/login'].includes(location.pathname);

  return (
    <>
      {/* Top Banner Alert */}
      <div className="gradient-primary text-white text-xs py-2.5 overflow-hidden flex items-center relative">
        <div className="animate-marquee hover:[animation-play-state:paused]">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center gap-2 mx-6 shrink-0 whitespace-nowrap">
              <span className="text-base leading-none">📢</span>
              <span className="opacity-90">
                <strong className="font-semibold text-white tracking-wide">Campaign Alert:</strong> Free Early Detection & Screening Camps active across New Delhi & Pune.
              </span>
              <button
                onClick={onOpenEnquiry}
                className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity cursor-pointer shrink-0"
              >
                Register Now →
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <Navbar
        onOpenVolunteer={onOpenVolunteer}
        onOpenEnquiry={onOpenEnquiry}
      />

      {/* Page Content -- every route rendered through PublicLayout now
          points at a lazy-loaded component (see imports above), so one
          Suspense boundary here covers all of them without repeating it
          at each <Route>. */}
      <Suspense fallback={<PageLoadingFallback />}>
        {children}
      </Suspense>

      {/* Footer */}
      <Footer
        onOpenVolunteer={onOpenVolunteer}
        onOpenEnquiry={onOpenEnquiry}
        onOpenSitemap={onOpenSitemap}
      />

      {/* Floating Action Button */}
      {!isAuthPage && (
        <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
          <button
            onClick={onOpenEnquiry}
            className="group relative bg-primary text-white hover:bg-primary-container font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,67,73,0.25)] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,67,73,0.35)] active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-slate-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-slate-400 rounded-full" />
            Get Patient Support
          </button>
        </div>
      )}
    </>
  );
}

// ---------- App Inner Component ----------
function AppContent() {
  const navigate = useNavigate();
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [sitemapOpen, setSitemapOpen] = useState(false);

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
    onOpenVolunteer: () => setVolunteerOpen(true),
    onOpenEnquiry: () => handleOpenEnquiryForHospital(undefined),
    onOpenSitemap: () => setSitemapOpen(true),
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between">
      <Routes>
        {/* ===== Public Pages (with Navbar/Footer layout) ===== */}
        <Route path="/" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow">
              <HomeTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/about" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <AboutTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/hospitals" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <HospitalsTab
                onOpenEnquiry={handleOpenEnquiryForHospital}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/events" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <EventsTab
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/blogs" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <BlogsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/news" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <NewsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/gallery" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <GalleryTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/mission" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <MissionTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/join-us" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <JoinUsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/doctors" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow section-container py-10 md:py-14">
              <DoctorsTab
                onOpenEnquiry={(hName) => handleOpenEnquiryForHospital(hName)}
                onOpenVolunteer={() => setVolunteerOpen(true)}
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
        <Route path="/patient/login" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow w-full mx-auto">
              <PatientAuthPage />
            </main>
          </PublicLayout>
        } />

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

        <Route path="/patient/dashboard" element={
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
        } />

        {/* ===== Catch-all ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* High-fidelity Interactive Modals */}
      <VolunteerModal
        isOpen={volunteerOpen}
        onClose={() => setVolunteerOpen(false)}
      />

      <ChatAssistant
        isOpen={enquiryOpen}
        onClose={handleCloseEnquiry}
      />

      <SitemapModal
        isOpen={sitemapOpen}
        onClose={() => setSitemapOpen(false)}
        onOpenVolunteer={() => setVolunteerOpen(true)}
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
