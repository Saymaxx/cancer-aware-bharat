import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeTab from './components/HomeTab';
import AboutTab from './components/AboutTab';
import HospitalsTab from './components/HospitalsTab';
import EventsTab from './components/EventsTab';
import BlogsTab from './components/BlogsTab';
import GalleryTab from './components/GalleryTab';
import MissionTab from './components/MissionTab';
import JoinUsTab from './components/JoinUsTab';
import DoctorsTab from './components/DoctorsTab';
import VolunteerAuthPage from './components/VolunteerAuthPage';
import AdminAuthPage from './components/AdminAuthPage';
import HospitalAuthPage from './components/HospitalAuthPage';

// Common Polish Components
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';

// Modals
import VolunteerModal from './components/VolunteerModal';
import EnquiryModal from './components/EnquiryModal';
import SitemapModal from './components/SitemapModal';

// Lazy Loaded Heavy Dashboard Components (Code Splitting & Performance)
const VolunteerDashboard = lazy(() => import('./components/VolunteerDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const HospitalDashboard = lazy(() => import('./components/HospitalDashboard'));

// Loading Fallback Spinner for Suspense
function PageLoadingFallback() {
  return (
    <div className="min-h-[400px] w-full flex items-center justify-center p-12">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 animate-pulse">Loading Cancer Aware Bharat Portal...</p>
      </div>
    </div>
  );
}

// ---------- Auth Guard ----------
function AuthGuard({ storageKey, requiredRole, redirectTo = '/', children }: {
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
  const isAuthPage = ['/admin', '/superadmin', '/volunteer/login', '/hospital/login'].includes(location.pathname);

  return (
    <>
      {/* Top Banner Alert */}
      <div className="bg-primary text-white text-xs py-2 px-4 text-center font-semibold leading-relaxed border-b border-primary-container">
        📢 <strong className="text-secondary-container">Campaign Alert:</strong> Free Early Detection & Screening Camps active across New Delhi & Pune. Register for prioritized callback.
      </div>

      {/* Main Sticky Navbar */}
      <Navbar
        onOpenVolunteer={onOpenVolunteer}
        onOpenEnquiry={onOpenEnquiry}
      />

      {/* Page Content */}
      {children}

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
            className="bg-secondary text-white hover:opacity-95 font-bold text-sm px-6 py-3.5 rounded-full shadow-[0px_8px_24px_rgba(144,66,119,0.35)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
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
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      <Routes>
        {/* ===== Public Pages (with Navbar/Footer layout) ===== */}
        <Route path="/" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <HomeTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/about" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <AboutTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/hospitals" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <HospitalsTab
                onOpenEnquiry={handleOpenEnquiryForHospital}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/events" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <EventsTab
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/blogs" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <BlogsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/gallery" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <GalleryTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/mission" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <MissionTab
                onOpenVolunteer={() => setVolunteerOpen(true)}
                onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
              />
            </main>
          </PublicLayout>
        } />
        <Route path="/join-us" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <JoinUsTab />
            </main>
          </PublicLayout>
        } />
        <Route path="/doctors" element={
          <PublicLayout {...publicLayoutProps}>
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
              <DoctorsTab
                onOpenEnquiry={(hName) => handleOpenEnquiryForHospital(hName)}
                onOpenVolunteer={() => setVolunteerOpen(true)}
              />
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
                    localStorage.removeItem('aware_bharat_logged_in_volunteer');
                    navigate('/volunteer/login');
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
                    localStorage.removeItem('aware_bharat_logged_in_hospital');
                    navigate('/hospital/login');
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
                    localStorage.removeItem('aware_bharat_logged_in_staff');
                    navigate('/admin');
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
                    localStorage.removeItem('aware_bharat_logged_in_staff');
                    navigate('/superadmin');
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

      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={handleCloseEnquiry}
        selectedHospitalId={selectedHospitalId}
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
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
