import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeTab from './components/HomeTab';
import AboutTab from './components/AboutTab';
import HospitalsTab from './components/HospitalsTab';
import EventsTab from './components/EventsTab';
import BlogsTab from './components/BlogsTab';
import VolunteerAuthPage from './components/VolunteerAuthPage';
import VolunteerDashboard from './components/VolunteerDashboard';
import AdminAuthPage from './components/AdminAuthPage';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import HospitalAuthPage from './components/HospitalAuthPage';
import HospitalDashboard from './components/HospitalDashboard';

// Modals
import VolunteerModal from './components/VolunteerModal';
import EnquiryModal from './components/EnquiryModal';
import SitemapModal from './components/SitemapModal';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
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

  const isDashboardPage = ['admin-dashboard', 'super-admin-dashboard', 'volunteer-dashboard', 'hospital-dashboard'].includes(activePage);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top Banner Alert (Only shown on public website pages) */}
      {!isDashboardPage && (
        <div className="bg-primary text-white text-xs py-2 px-4 text-center font-semibold leading-relaxed border-b border-primary-container">
          📢 <strong className="text-secondary-container">Campaign Alert:</strong> Free Early Detection & Screening Camps are now active across New Delhi & Pune. Register in 30 seconds for prioritized callback guidelines.
        </div>
      )}

      {/* Main Sticky Navbar (Only shown on public website pages) */}
      {!isDashboardPage && (
        <Navbar 
          activePage={activePage} 
          onPageChange={setActivePage}
          onOpenVolunteer={() => setVolunteerOpen(true)}
          onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
        />
      )}

      {/* Core Tab Routing Screen */}
      {activePage === 'volunteer-auth' ? (
        <main className="flex-grow w-full mx-auto">
          <VolunteerAuthPage onPageChange={setActivePage} />
        </main>
      ) : activePage === 'volunteer-dashboard' ? (
        <main className="flex-grow w-full mx-auto">
          <VolunteerDashboard
            onPageChange={setActivePage}
            onLogout={() => {
              localStorage.removeItem('aware_bharat_logged_in_volunteer');
              setActivePage('home');
            }}
          />
        </main>
      ) : activePage === 'admin-auth' ? (
        <main className="flex-grow w-full mx-auto">
          <AdminAuthPage onPageChange={setActivePage} initialRole="admin" />
        </main>
      ) : activePage === 'super-admin-auth' ? (
        <main className="flex-grow w-full mx-auto">
          <AdminAuthPage onPageChange={setActivePage} initialRole="superadmin" />
        </main>
      ) : activePage === 'admin-dashboard' ? (
        <main className="flex-grow w-full mx-auto">
          <AdminDashboard
            onPageChange={setActivePage}
            onLogout={() => {
              localStorage.removeItem('aware_bharat_logged_in_staff');
              setActivePage('home');
            }}
          />
        </main>
      ) : activePage === 'hospital-auth' ? (
        <main className="flex-grow w-full mx-auto">
          <HospitalAuthPage onPageChange={setActivePage} />
        </main>
      ) : activePage === 'hospital-dashboard' ? (
        <main className="flex-grow w-full mx-auto">
          <HospitalDashboard
            onPageChange={setActivePage}
            onLogout={() => {
              localStorage.removeItem('aware_bharat_logged_in_hospital');
              setActivePage('home');
            }}
          />
        </main>
      ) : activePage === 'super-admin-dashboard' ? (
        <main className="flex-grow w-full mx-auto">
          <SuperAdminDashboard
            onPageChange={setActivePage}
            onLogout={() => {
              localStorage.removeItem('aware_bharat_logged_in_staff');
              setActivePage('home');
            }}
          />
        </main>
      ) : (
        <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 md:px-12 py-8">
          {activePage === 'home' && (
            <HomeTab 
              onPageChange={setActivePage}
              onOpenVolunteer={() => setVolunteerOpen(true)}
              onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
            />
          )}
          {activePage === 'about' && (
            <AboutTab 
              onPageChange={setActivePage}
              onOpenVolunteer={() => setVolunteerOpen(true)}
            />
          )}
          {activePage === 'hospitals' && (
            <HospitalsTab 
              onPageChange={setActivePage}
              onOpenEnquiry={handleOpenEnquiryForHospital}
            />
          )}
          {activePage === 'events' && (
            <EventsTab 
              onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
            />
          )}
          {activePage === 'blogs' && (
            <BlogsTab />
          )}
        </main>
      )}

      {/* Consistent Footer (Only shown on public website pages) */}
      {!isDashboardPage && (
        <Footer 
          onPageChange={setActivePage}
          onOpenVolunteer={() => setVolunteerOpen(true)}
          onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
          onOpenSitemap={() => setSitemapOpen(true)}
        />
      )}

      {/* Interactive Floating Action Button for instant Support */}
      {!isDashboardPage && (
        <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
          <button
            onClick={() => handleOpenEnquiryForHospital(undefined)}
            className="bg-secondary text-white hover:opacity-95 font-bold text-sm px-6 py-3.5 rounded-full shadow-[0px_8px_24px_rgba(144,66,119,0.35)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Get Patient Support
          </button>
        </div>
      )}

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
        onNavigate={setActivePage}
        onOpenVolunteer={() => setVolunteerOpen(true)}
        onOpenEnquiry={() => handleOpenEnquiryForHospital(undefined)}
      />
    </div>
  );
}
