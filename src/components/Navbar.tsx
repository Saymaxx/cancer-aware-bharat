import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Search, LogIn, LayoutDashboard, LogOut, Building2 } from 'lucide-react';

interface NavbarProps {
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function Navbar({
  onOpenVolunteer,
  onOpenEnquiry
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if staff is logged in
  const loggedInStaff = useMemo(() => {
    const stored = localStorage.getItem('aware_bharat_logged_in_staff');
    return stored ? JSON.parse(stored) : null;
  }, [location.pathname]);

  // Check if volunteer is logged in
  const loggedInVolunteer = useMemo(() => {
    const stored = localStorage.getItem('aware_bharat_logged_in_volunteer');
    return stored ? JSON.parse(stored) : null;
  }, [location.pathname]);

  // Check if hospital is logged in
  const loggedInHospital = useMemo(() => {
    const stored = localStorage.getItem('aware_bharat_logged_in_hospital');
    return stored ? JSON.parse(stored) : null;
  }, [location.pathname]);

  const volunteerInitials = loggedInVolunteer
    ? loggedInVolunteer.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('aware_bharat_logged_in_volunteer');
    localStorage.removeItem('aware_bharat_logged_in_staff');
    localStorage.removeItem('aware_bharat_logged_in_hospital');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-outline-variant/15 w-full transition-all duration-200">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 py-3.5 max-w-[1200px] mx-auto">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center space-x-2 text-left hover:opacity-90 transition-opacity focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-headline-lg text-lg sm:text-xl md:text-2xl font-black text-primary tracking-tight">
            Aware Bharat
          </span>
        </button>

        {/* Navigation Links (Web) */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <button
            onClick={() => handleNavClick('/about')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              location.pathname === '/about'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('/events')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              location.pathname === '/events'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => handleNavClick('/hospitals')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              location.pathname === '/hospitals'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Hospitals
          </button>
          <button
            onClick={() => handleNavClick('/blogs')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              location.pathname === '/blogs'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Blogs
          </button>
        </div>

        {/* Actions & Search */}
        <div className="hidden md:flex items-center space-x-3">
          {loggedInVolunteer ? (
            <>
              <button
                onClick={() => navigate('/volunteer/dashboard')}
                className="px-3.5 py-2 rounded-lg bg-primary/10 text-primary font-label-sm text-sm font-semibold hover:bg-primary/15 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
              >
                <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {volunteerInitials}
                </div>
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 font-label-sm text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : loggedInStaff ? (
            <>
              <button
                onClick={() => navigate(loggedInStaff.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard')}
                className="px-3.5 py-2 rounded-lg bg-primary/10 text-primary font-label-sm text-sm font-semibold hover:bg-primary/15 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{loggedInStaff.role === 'superadmin' ? 'Super Admin' : 'Admin Portal'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 font-label-sm text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : loggedInHospital ? (
            <>
              <button
                onClick={() => navigate('/hospital/dashboard')}
                className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-sm text-sm font-semibold hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hospital Portal</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 font-label-sm text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/hospital/login')}
                className="px-3 py-2 rounded-lg bg-surface-variant text-primary font-label-sm text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer inline-flex items-center space-x-1"
                title="Hospital Partner Login / Apply"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Login</span>
              </button>
              <button
                onClick={() => navigate('/volunteer/login')}
                className="px-3 py-2 rounded-lg bg-surface-variant text-primary font-label-sm text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer inline-flex items-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Volunteer Login</span>
              </button>
            </>
          )}
          <button
            onClick={() => onOpenEnquiry()}
            className="px-4 py-2 rounded-lg bg-primary text-white font-label-sm text-sm font-semibold hover:opacity-95 transition-opacity shadow-[0px_4px_20px_rgba(13,92,99,0.1)] cursor-pointer"
          >
            Patient Enquiry
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-1.5">
          <button
            onClick={() => onOpenEnquiry()}
            className="px-2.5 py-1.5 rounded-lg bg-primary text-white font-label-sm text-[11px] font-bold hover:opacity-95 transition-opacity"
          >
            Enquiry
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-on-surface hover:bg-surface-variant focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-outline-variant/25 px-5 py-4 space-y-2.5 shadow-xl transition-all duration-300">
          <button
            onClick={() => handleNavClick('/about')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              location.pathname === '/about' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('/events')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              location.pathname === '/events' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Events & Camps
          </button>
          <button
            onClick={() => handleNavClick('/hospitals')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              location.pathname === '/hospitals' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Hospitals Network
          </button>
          <button
            onClick={() => handleNavClick('/blogs')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              location.pathname === '/blogs' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Educational Blogs
          </button>
          <div className="pt-3 border-t border-outline-variant/10 flex flex-col space-y-2">
            {loggedInVolunteer ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/volunteer/dashboard');
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary text-center font-semibold text-sm active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    localStorage.removeItem('aware_bharat_logged_in_volunteer');
                    navigate('/');
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-red-200 text-red-600 text-center font-semibold text-sm active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/volunteer/login');
                }}
                className="w-full py-2 px-4 rounded-lg bg-surface-variant text-primary text-center font-semibold text-sm active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Volunteer Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
