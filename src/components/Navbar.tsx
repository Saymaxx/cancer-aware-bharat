import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Heart, LogIn, LayoutDashboard, LogOut, Building2,
  ChevronDown, Home, Target, Stethoscope, BookOpen, Calendar, UserPlus, PhoneCall,
  Images, Users, ArrowRight, User, Shield
} from 'lucide-react';


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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('aware_bharat_logged_in_volunteer');
    localStorage.removeItem('aware_bharat_logged_in_staff');
    localStorage.removeItem('aware_bharat_logged_in_hospital');
    navigate('/');
  };

  const mainNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/events', label: 'Events' },
    { path: '/hospitals', label: 'Health Centres' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/gallery', label: 'Gallery' },
  ];

  const moreLinks = [
    { path: '/mission', label: 'Our Mission', sublabel: 'Grassroots oncological vision', icon: Target, color: 'text-primary' },
    { path: '/doctors', label: 'Our Doctors / हमारे डॉक्टर', sublabel: 'Oncology specialists panel', icon: Stethoscope, color: 'text-primary' },
    { path: '/cancer-awareness', label: 'Cancer Awareness', sublabel: 'Education & prevention guides', icon: BookOpen, color: 'text-secondary' },
    { path: '/events', label: 'Health Camps', sublabel: 'Free screening events', icon: Calendar, color: 'text-primary' },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border-b border-outline-variant/10'
            : 'bg-white/80 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-3 max-w-[1440px] mx-auto">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center space-x-3 text-left hover:opacity-90 transition-opacity focus:outline-none shrink-0 group"
          >
            <img
              src="/brand-logo.jpeg"
              alt="Cancer Aware Bharat Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-primary/15 shadow-sm group-hover:border-primary/30 transition-all"
            />
            <div className="flex flex-col">
              <span className="font-outfit text-lg sm:text-xl font-extrabold text-primary tracking-tight leading-tight">
                Cancer Aware Bharat
              </span>
              <span className="text-[10px] font-medium text-on-surface-variant/70 tracking-wide hidden sm:block">
                कैंसर जागरूकता अभियान
              </span>
            </div>
          </button>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainNavLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none cursor-pointer ${
                    isActive
                      ? 'text-secondary font-semibold border-b-2 border-secondary'
                      : 'text-primary hover:text-secondary hover:bg-secondary/[0.03]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* More Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownOpen(true)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary hover:text-secondary hover:bg-secondary/[0.03] transition-all cursor-pointer"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.05)] border border-outline-variant/20 py-2 z-50 animate-slide-down"
                >
                  {moreLinks.map(item => (
                    <button
                      key={item.path + item.label}
                      onClick={() => handleNavClick(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-secondary/[0.04] hover:text-secondary transition-colors text-left group"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-primary/5 ${item.color} flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-[13px] leading-tight">{item.label}</p>
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">{item.sublabel}</p>
                      </div>
                    </button>
                  ))}

                  <div className="my-1.5 mx-4 border-t border-slate-100" />

                  {/* Join Us */}
                  <button
                    onClick={() => handleNavClick('/join-us')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-secondary/[0.04] hover:text-secondary transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/5 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary/10 transition-colors">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[13px] leading-tight">Join Us / मिशन से जुड़ें</p>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">Become a community advocate</p>
                    </div>
                  </button>

                  {/* Contact Us */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenEnquiry();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-secondary/[0.04] hover:text-secondary transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[13px] leading-tight">Contact Us</p>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">Patient helpline & enquiry</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {loggedInVolunteer ? (
              <>
                <button
                  onClick={() => navigate('/volunteer/dashboard')}
                  className="px-3.5 py-2 rounded-xl bg-primary/[0.06] text-primary text-sm font-semibold hover:bg-primary/10 transition-all cursor-pointer inline-flex items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {volunteerInitials}
                  </div>
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-semibold hover:bg-red-100 transition-all cursor-pointer inline-flex items-center space-x-1.5"
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
                  className="px-3.5 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-semibold hover:bg-primary/20 transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Hospital Portal</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-semibold hover:bg-red-100 transition-all cursor-pointer inline-flex items-center space-x-1.5"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="relative" ref={loginDropdownRef}>
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  onMouseEnter={() => setLoginDropdownOpen(true)}
                  className="w-11 h-11 rounded-full bg-white border-[1.5px] border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm focus:outline-none cursor-pointer"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Profile Login Dropdown */}
                {loginDropdownOpen && (
                  <div
                    onMouseLeave={() => setLoginDropdownOpen(false)}
                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.05)] border border-outline-variant/20 py-2 z-50 animate-slide-down"
                  >
                    <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-2">
                      Sign In Access
                    </p>
                    <button
                      onClick={() => handleNavClick('/volunteer/login')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary/[0.04] hover:text-secondary transition-colors text-left group"
                    >
                      <User className="w-4 h-4" />
                      <span>Volunteer Login</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('/hospital/login')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary/[0.04] hover:text-secondary transition-colors text-left group"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Hospital Login</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('/super-admin/login')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary/[0.04] hover:text-secondary transition-colors text-left group"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Login</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onOpenVolunteer}
              className="btn-primary !py-2.5 !px-5 !text-[13px] !rounded-xl"
            >
              <Heart className="w-3.5 h-3.5" />
              Become a Volunteer
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => onOpenEnquiry()}
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-[12px] font-semibold hover:opacity-95 transition-opacity shadow-sm"
            >
              Enquiry
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-on-surface hover:bg-surface-variant/50 focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl animate-slide-down overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-2.5">
                <img
                  src="/brand-logo.jpeg"
                  alt="Cancer Aware Bharat"
                  className="w-9 h-9 rounded-full object-cover border border-primary/10"
                />
                <span className="font-outfit text-base font-bold text-primary">Cancer Aware Bharat</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-container transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="px-4 py-4 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Navigation</p>
              {[
                { path: '/', label: 'Home', icon: Home },
                { path: '/about', label: 'About Us', icon: Users },
                { path: '/mission', label: 'Our Mission / हमारा मिशन', icon: Target },
                { path: '/events', label: 'Events & Camps', icon: Calendar },
                { path: '/hospitals', label: 'Health Centres', icon: Building2 },
                { path: '/blogs', label: 'Educational Blogs', icon: BookOpen },
                { path: '/gallery', label: 'Media & Impact Gallery', icon: Images },
                { path: '/doctors', label: 'Our Doctors', icon: Stethoscope },
                { path: '/join-us', label: 'Join Us / मिशन से जुड़ें', icon: UserPlus },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-xl text-sm transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary/[0.06] text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-secondary'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${location.pathname === item.path ? 'text-primary' : 'text-on-surface-variant/60'}`} />
                  {item.label}
                  {location.pathname === item.path && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>

            {/* Mobile Auth Section */}
            <div className="px-4 py-4 border-t border-outline-variant/10 space-y-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Account</p>
              {loggedInVolunteer ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/volunteer/dashboard');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary/[0.06] text-primary text-center font-semibold text-sm flex items-center justify-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      localStorage.removeItem('aware_bharat_logged_in_volunteer');
                      navigate('/');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-red-100 text-red-600 text-center font-semibold text-sm flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Login Portals</p>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/volunteer/login');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-variant/40 text-primary text-center font-semibold text-sm flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Volunteer Login</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/hospital/login');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-variant/40 text-primary text-center font-semibold text-sm flex items-center justify-center space-x-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Hospital Login</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/super-admin/login');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-variant/40 text-primary text-center font-semibold text-sm flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Login</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile CTA */}
            <div className="px-4 pb-6">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVolunteer();
                }}
                className="w-full btn-primary !justify-center !rounded-xl !py-3"
              >
                <Heart className="w-4 h-4" />
                Become a Volunteer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
