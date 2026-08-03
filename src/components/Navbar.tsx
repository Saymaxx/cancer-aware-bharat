import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Menu, X, Heart, LogIn, LayoutDashboard, LogOut, Building2,
  ChevronDown, Home, Target, Stethoscope, BookOpen, Calendar, UserPlus, PhoneCall,
  Images, Users, ArrowRight, User, Shield, Gift
} from 'lucide-react';
import { Facebook, Instagram, Linkedin, Youtube } from './icons/SocialIcons';

interface NavbarProps {
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
  onOpenDonate: () => void;
}

export default function Navbar({
  onOpenVolunteer,
  onOpenEnquiry,
  onOpenDonate
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
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
    setActiveDropdown(null);
    setActiveMobileDropdown(null);
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
        ref={navRef}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${scrolled
            ? 'bg-white/97 backdrop-blur-xl shadow-[0_4px_24px_rgba(22,58,95,0.07),0_1px_3px_rgba(22,58,95,0.04)]'
            : 'bg-white/90 backdrop-blur-md'
          }`}
      >
        <div className={`transition-all duration-300 ease-out w-full px-6 sm:px-8 lg:px-10 xl:px-14 max-w-[1480px] mx-auto flex justify-between items-center relative ${scrolled ? 'h-[72px]' : 'h-[84px]'}`}>

          {/* LEFT: Brand Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center space-x-3 text-left hover:opacity-90 transition-opacity duration-200 focus:outline-none shrink-0 group z-10"
          >
            <img
              src="/brand-logo.jpeg"
              alt="Cancer Aware Bharat Logo"
              className={`rounded-full object-cover shadow-[0_2px_10px_rgba(22,58,95,0.12)] group-hover:shadow-[0_4px_14px_rgba(22,58,95,0.18)] transition-all duration-200 ${scrolled ? 'w-10 h-10' : 'w-11 h-11'}`}
            />
            <div className="flex flex-col">
              <span className={`font-outfit font-extrabold text-primary tracking-tight leading-none transition-all duration-200 ${scrolled ? 'text-[19px]' : 'text-[21px]'}`}>
                Cancer Aware Bharat
              </span>
              <span className="text-[10px] font-semibold text-primary/50 tracking-[0.08em] uppercase hidden sm:block mt-0.5">
                कैंसर जागरूकता अभियान
              </span>
            </div>
          </button>

          {/* CENTER: Floating Navigation Pill (Desktop) */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10">
            <div className={`flex items-center bg-white rounded-full shadow-[0_6px_28px_rgba(22,58,95,0.08),0_1px_4px_rgba(22,58,95,0.04)] border border-slate-100/70 px-3 transition-all duration-300 ease-out hover:shadow-[0_8px_36px_rgba(22,58,95,0.11)] ${scrolled ? 'h-[58px] gap-0.5' : 'h-[64px] gap-0.5'}`}>
              {mainNavLinks.map(link => {
                const isActive = location.pathname === link.path;

                if (link.label === 'Events') {
                  const isEventsActive = location.pathname === '/events' || location.pathname === '/gallery';
                  return (
                    <div
                      className="relative flex items-center h-full"
                      key="events-dropdown"
                      onMouseEnter={() => setActiveDropdown('events')}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === 'events' ? null : 'events')}
                        className={`relative flex items-center gap-1 px-4 py-2 text-[15px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none ${
                          isEventsActive
                            ? 'text-secondary'
                            : 'text-primary/80 hover:text-primary hover:bg-primary/[0.04]'
                        }`}
                      >
                        <span>Events</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'events' ? 'rotate-180' : ''}`} />
                        {isEventsActive && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-secondary rounded-full" />
                        )}
                      </button>

                      {activeDropdown === 'events' && (
                        <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-3 z-50 w-[220px]">
                          <div className="bg-white rounded-2xl shadow-[0_20px_48px_rgba(22,58,95,0.12),0_4px_12px_rgba(22,58,95,0.04)] border border-slate-100/60 p-2 animate-fade-in-slide">
                            <button
                              onClick={() => handleNavClick('/events')}
                              className="w-full px-4 py-3 text-[15px] font-semibold text-primary/80 hover:bg-primary/[0.04] hover:text-secondary rounded-xl transition-colors text-left"
                            >
                              Event Details
                            </button>
                            <button
                              onClick={() => handleNavClick('/gallery')}
                              className="w-full px-4 py-3 text-[15px] font-semibold text-primary/80 hover:bg-primary/[0.04] hover:text-secondary rounded-xl transition-colors text-left"
                            >
                              Event Gallery
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.label === 'Blogs') {
                  const isBlogsActive = location.pathname === '/blogs' || location.pathname === '/news';
                  return (
                    <div
                      className="relative flex items-center h-full"
                      key="blogs-dropdown"
                      onMouseEnter={() => setActiveDropdown('blogs')}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === 'blogs' ? null : 'blogs')}
                        className={`relative flex items-center gap-1 px-4 py-2 text-[15px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none ${
                          isBlogsActive
                            ? 'text-secondary'
                            : 'text-primary/80 hover:text-primary hover:bg-primary/[0.04]'
                        }`}
                      >
                        <span>Blogs</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'blogs' ? 'rotate-180' : ''}`} />
                        {isBlogsActive && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-secondary rounded-full" />
                        )}
                      </button>

                      {activeDropdown === 'blogs' && (
                        <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-3 z-50 w-[220px]">
                          <div className="bg-white rounded-2xl shadow-[0_20px_48px_rgba(22,58,95,0.12),0_4px_12px_rgba(22,58,95,0.04)] border border-slate-100/60 p-2 animate-fade-in-slide">
                            <button
                              onClick={() => handleNavClick('/blogs')}
                              className="w-full px-4 py-3 text-[15px] font-semibold text-primary/80 hover:bg-primary/[0.04] hover:text-secondary rounded-xl transition-colors text-left"
                            >
                              Articles
                            </button>
                            <button
                              onClick={() => handleNavClick('/news')}
                              className="w-full px-4 py-3 text-[15px] font-semibold text-primary/80 hover:bg-primary/[0.04] hover:text-secondary rounded-xl transition-colors text-left"
                            >
                              News
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`relative flex items-center px-4 py-2 text-[15px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none ${
                      isActive
                        ? 'text-secondary'
                        : 'text-primary/80 hover:text-primary hover:bg-primary/[0.04]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-secondary rounded-full" />
                    )}
                  </button>
                );
              })}

              {/* More Dropdown */}
              <div
                className="relative flex items-center h-full"
                key="more-dropdown"
                onMouseEnter={() => setActiveDropdown('more')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
                  className={`relative flex items-center gap-1 px-4 py-2 text-[15px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none ${
                    activeDropdown === 'more' ? 'text-secondary bg-primary/[0.04]' : 'text-primary/80 hover:text-primary hover:bg-primary/[0.04]'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'more' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'more' && (
                  <div className="absolute top-[100%] right-0 pt-3 z-50 w-[320px]">
                    <div className="bg-white rounded-2xl shadow-[0_20px_48px_rgba(22,58,95,0.12),0_4px_12px_rgba(22,58,95,0.04)] border border-slate-100/60 p-2.5 animate-fade-in-slide">
                      {moreLinks.map(item => (
                        <button
                          key={item.path + item.label}
                          onClick={() => handleNavClick(item.path)}
                          className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-primary/80 hover:bg-primary/[0.04] hover:text-secondary transition-all duration-200 text-left group"
                        >
                          <div className={`w-9 h-9 rounded-xl bg-primary/[0.06] ${item.color} flex items-center justify-center shrink-0 group-hover:bg-primary/[0.1] transition-colors duration-200`}>
                            <item.icon className="w-[18px] h-[18px]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[14px] leading-tight">{item.label}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.sublabel}</p>
                          </div>
                        </button>
                      ))}

                      <div className="my-1.5 mx-3 border-t border-slate-100/80" />

                      <button
                        onClick={() => handleNavClick('/join-us')}
                        className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-primary/80 hover:bg-primary/[0.04] hover:text-secondary transition-all duration-200 text-left group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary/15 transition-colors duration-200">
                          <UserPlus className="w-[18px] h-[18px]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[14px] leading-tight">Join Us / मिशन से जुड़ें</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Become a community advocate</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenEnquiry();
                        }}
                        className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-primary/80 hover:bg-primary/[0.04] hover:text-secondary transition-all duration-200 text-left group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/[0.06] text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/[0.1] transition-colors duration-200">
                          <PhoneCall className="w-[18px] h-[18px]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[14px] leading-tight">Contact Us</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Patient helpline & enquiry</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0 z-10">
            {loggedInVolunteer ? (
              <>
                <button
                  onClick={() => navigate('/volunteer/dashboard')}
                  className="px-5 py-2.5 rounded-full bg-primary/[0.06] text-primary text-[14px] font-semibold hover:bg-primary/[0.1] transition-all duration-200 cursor-pointer inline-flex items-center space-x-2.5 border border-primary/10 focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                    {volunteerInitials}
                  </div>
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-red-50 text-red-500 border border-red-100/80 flex items-center justify-center hover:bg-red-100 transition-all duration-200 cursor-pointer focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : loggedInHospital ? (
              <>
                <button
                  onClick={() => navigate('/hospital/dashboard')}
                  className="px-5 py-2.5 rounded-full bg-primary/[0.06] text-primary border border-primary/10 text-[14px] font-semibold hover:bg-primary/[0.1] transition-all duration-200 cursor-pointer inline-flex items-center space-x-2 focus:outline-none"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Hospital Portal</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-red-50 text-red-500 border border-red-100/80 flex items-center justify-center hover:bg-red-100 transition-all duration-200 cursor-pointer focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div
                className="relative"
                key="login-dropdown"
                onMouseEnter={() => setActiveDropdown('login')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'login' ? null : 'login')}
                  className="w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-primary/70 hover:text-primary hover:bg-primary/[0.04] hover:border-primary/20 transition-all duration-200 shadow-[0_1px_4px_rgba(22,58,95,0.04)] focus:outline-none cursor-pointer"
                >
                  <User className="w-[18px] h-[18px]" />
                </button>

                {/* Profile Login Dropdown */}
                {activeDropdown === 'login' && (
                  <div className="absolute top-[100%] right-0 pt-3 z-50 w-60">
                    <div className="bg-white rounded-2xl shadow-[0_20px_48px_rgba(22,58,95,0.12),0_4px_12px_rgba(22,58,95,0.04)] border border-slate-100/60 p-2 animate-fade-in-slide">
                      <p className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 border-b border-slate-100/80 mb-1.5">
                        Sign In Access
                      </p>
                      <button
                        onClick={() => handleNavClick('/volunteer/login')}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold text-primary/80 hover:bg-primary/[0.04] hover:text-secondary rounded-xl transition-colors duration-200 text-left group"
                      >
                        <User className="w-4 h-4 text-slate-400 group-hover:text-secondary transition-colors duration-200" />
                        <span>Volunteer Login</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('/hospital/login')}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold text-primary/80 hover:bg-primary/[0.04] hover:text-secondary rounded-xl transition-colors duration-200 text-left group"
                      >
                        <Building2 className="w-4 h-4 text-slate-400 group-hover:text-secondary transition-colors duration-200" />
                        <span>Hospital Login</span>
                      </button>
                      {/* Patient Login is deliberately disabled for now (product decision) */}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onOpenDonate}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary rounded-full font-semibold text-[14px] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/5 focus:outline-none"
            >
              <Gift className="w-4 h-4" />
              Donate
            </button>
            <button
              onClick={onOpenVolunteer}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-[14px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(22,58,95,0.25)] hover:bg-[#112d4a] focus:outline-none"
            >
              <Heart className="w-4 h-4" />
              Become a Volunteer
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-2.5">
            <button
              onClick={onOpenDonate}
              className="px-3.5 py-2 rounded-full border-2 border-primary text-primary text-[12px] font-semibold hover:bg-primary/5 transition-colors"
            >
              Donate
            </button>
            <button
              onClick={() => onOpenEnquiry()}
              className="px-3.5 py-2 rounded-full bg-primary text-white text-[12px] font-semibold hover:opacity-95 transition-opacity shadow-sm"
            >
              Enquiry
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/[0.05] focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          MOBILE OFF-CANVAS DRAWER
          ═══════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Dark Overlay + Backdrop Blur */}
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[7px] animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel — slides from LEFT */}
          <div className="absolute top-0 left-0 h-full w-[88%] max-w-[380px] bg-white shadow-[4px_0_30px_rgba(0,0,0,0.12)] rounded-r-3xl animate-slide-in-left flex flex-col overflow-hidden">

            {/* ── Drawer Header ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100/80 shrink-0">
              <button
                onClick={() => handleNavClick('/')}
                className="flex items-center gap-3 focus:outline-none"
              >
                <img
                  src="/brand-logo.jpeg"
                  alt="Cancer Aware Bharat"
                  className="w-10 h-10 rounded-full object-cover shadow-[0_2px_8px_rgba(22,58,95,0.12)]"
                />
                <div className="flex flex-col">
                  <span className="font-outfit text-[17px] font-bold text-primary leading-tight">Cancer Aware Bharat</span>
                  <span className="text-[9px] font-semibold text-primary/45 tracking-[0.06em] uppercase mt-0.5">कैंसर जागरूकता अभियान</span>
                </div>
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors duration-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* Navigation Links */}
              <div className="px-5 pt-5 pb-3">
                {[
                  { path: '/', label: 'Home', icon: Home },
                  { path: '/about', label: 'About Us', icon: Users },
                  { path: '/mission', label: 'Our Mission', icon: Target },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center gap-4 w-full text-left h-[58px] px-3 border-b border-slate-100/60 transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'text-secondary font-semibold'
                        : 'text-primary/80 hover:text-secondary'
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${location.pathname === item.path ? 'text-secondary' : 'text-primary/40'}`} />
                    <span className="text-[15px]">{item.label}</span>
                    {location.pathname === item.path && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />}
                  </button>
                ))}

                {/* Events Accordion */}
                <div>
                  <button
                    onClick={() => setActiveMobileDropdown(activeMobileDropdown === 'events' ? null : 'events')}
                    className={`flex items-center justify-between w-full text-left h-[58px] px-3 border-b border-slate-100/60 transition-all duration-200 ${
                      location.pathname === '/events' || location.pathname === '/gallery'
                        ? 'text-secondary font-semibold'
                        : 'text-primary/80 hover:text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className={`w-[18px] h-[18px] shrink-0 ${location.pathname === '/events' || location.pathname === '/gallery' ? 'text-secondary' : 'text-primary/40'}`} />
                      <span className="text-[15px]">Events & Camps</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-primary/40 transition-transform duration-300 ${activeMobileDropdown === 'events' ? 'rotate-180 text-secondary' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${activeMobileDropdown === 'events' ? 'max-h-[140px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-14 pr-3 py-2 space-y-1 bg-slate-50/50">
                      <button
                        onClick={() => handleNavClick('/events')}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-[14px] transition-all duration-200 ${
                          location.pathname === '/events' ? 'text-secondary font-semibold' : 'text-primary/70 hover:text-secondary'
                        }`}
                      >
                        Event Details
                      </button>
                      <button
                        onClick={() => handleNavClick('/gallery')}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-[14px] transition-all duration-200 ${
                          location.pathname === '/gallery' ? 'text-secondary font-semibold' : 'text-primary/70 hover:text-secondary'
                        }`}
                      >
                        Event Gallery
                      </button>
                    </div>
                  </div>
                </div>

                {/* Health Centres */}
                <button
                  onClick={() => handleNavClick('/hospitals')}
                  className={`flex items-center gap-4 w-full text-left h-[58px] px-3 border-b border-slate-100/60 transition-all duration-200 ${
                    location.pathname === '/hospitals'
                      ? 'text-secondary font-semibold'
                      : 'text-primary/80 hover:text-secondary'
                  }`}
                >
                  <Building2 className={`w-[18px] h-[18px] shrink-0 ${location.pathname === '/hospitals' ? 'text-secondary' : 'text-primary/40'}`} />
                  <span className="text-[15px]">Health Centres</span>
                  {location.pathname === '/hospitals' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />}
                </button>

                {/* Blogs Accordion */}
                <div>
                  <button
                    onClick={() => setActiveMobileDropdown(activeMobileDropdown === 'blogs' ? null : 'blogs')}
                    className={`flex items-center justify-between w-full text-left h-[58px] px-3 border-b border-slate-100/60 transition-all duration-200 ${
                      location.pathname === '/blogs' || location.pathname === '/news'
                        ? 'text-secondary font-semibold'
                        : 'text-primary/80 hover:text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <BookOpen className={`w-[18px] h-[18px] shrink-0 ${location.pathname === '/blogs' || location.pathname === '/news' ? 'text-secondary' : 'text-primary/40'}`} />
                      <span className="text-[15px]">Blogs</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-primary/40 transition-transform duration-300 ${activeMobileDropdown === 'blogs' ? 'rotate-180 text-secondary' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${activeMobileDropdown === 'blogs' ? 'max-h-[140px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-14 pr-3 py-2 space-y-1 bg-slate-50/50">
                      <button
                        onClick={() => handleNavClick('/blogs')}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-[14px] transition-all duration-200 ${
                          location.pathname === '/blogs' ? 'text-secondary font-semibold' : 'text-primary/70 hover:text-secondary'
                        }`}
                      >
                        Articles
                      </button>
                      <button
                        onClick={() => handleNavClick('/news')}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-[14px] transition-all duration-200 ${
                          location.pathname === '/news' ? 'text-secondary font-semibold' : 'text-primary/70 hover:text-secondary'
                        }`}
                      >
                        News
                      </button>
                    </div>
                  </div>
                </div>

                {/* More Accordion */}
                <div>
                  <button
                    onClick={() => setActiveMobileDropdown(activeMobileDropdown === 'more' ? null : 'more')}
                    className={`flex items-center justify-between w-full text-left h-[58px] px-3 border-b border-slate-100/60 transition-all duration-200 text-primary/80 hover:text-secondary`}
                  >
                    <div className="flex items-center gap-4">
                      <ArrowRight className={`w-[18px] h-[18px] shrink-0 text-primary/40 transition-transform duration-300 ${activeMobileDropdown === 'more' ? 'rotate-90' : ''}`} />
                      <span className="text-[15px]">More</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-primary/40 transition-transform duration-300 ${activeMobileDropdown === 'more' ? 'rotate-180 text-secondary' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${activeMobileDropdown === 'more' ? 'max-h-[280px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-14 pr-3 py-2 space-y-1 bg-slate-50/50">
                      {[
                        { path: '/doctors', label: 'Our Doctors' },
                        { path: '/cancer-awareness', label: 'Cancer Awareness' },
                        { path: '/join-us', label: 'Join Us' },
                      ].map(sub => (
                        <button
                          key={sub.path}
                          onClick={() => handleNavClick(sub.path)}
                          className={`w-full text-left py-2.5 px-3 rounded-xl text-[14px] transition-all duration-200 ${
                            location.pathname === sub.path ? 'text-secondary font-semibold' : 'text-primary/70 hover:text-secondary'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenEnquiry();
                        }}
                        className="w-full text-left py-2.5 px-3 rounded-xl text-[14px] text-primary/70 hover:text-secondary transition-all duration-200"
                      >
                        Contact Us
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Auth Section ── */}
              <div className="px-5 py-4 border-t border-slate-100/80">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-3 px-1">Account</p>
                {loggedInVolunteer ? (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/volunteer/dashboard');
                      }}
                      className="w-full h-[48px] rounded-xl bg-primary/[0.06] text-primary font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-primary/[0.1]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        localStorage.removeItem('aware_bharat_logged_in_volunteer');
                        navigate('/');
                      }}
                      className="w-full h-[44px] rounded-xl border border-red-100/80 text-red-500 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      { path: '/volunteer/login', label: 'Volunteer Login', icon: User },
                      { path: '/hospital/login', label: 'Hospital Login', icon: Building2 },
                      // Patient Login is deliberately disabled for now (product decision)
                    ].map(portal => (
                      <button
                        key={portal.path}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate(portal.path);
                        }}
                        className="w-full h-[46px] rounded-xl bg-slate-50 hover:bg-primary/[0.05] text-primary/80 hover:text-primary font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all duration-200 border border-slate-100/60"
                      >
                        <portal.icon className="w-4 h-4 text-primary/50" />
                        {portal.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── CTA Button ── */}
              <div className="px-5 pb-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenVolunteer();
                  }}
                  className="w-full h-[52px] bg-primary text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-[#112d4a] hover:shadow-[0_4px_16px_rgba(22,58,95,0.3)] active:scale-[0.98]"
                >
                  <Heart className="w-4.5 h-4.5" />
                  Become a Volunteer
                </button>
              </div>
            </div>

            {/* ── Social Footer ── */}
            <div className="shrink-0 px-6 py-4 border-t border-slate-100/80 bg-slate-50/50">
              <div className="flex items-center justify-center gap-4">
                {[
                  { icon: Facebook, label: 'Facebook', href: '#' },
                  { icon: Instagram, label: 'Instagram', href: '#' },
                  { icon: Linkedin, label: 'LinkedIn', href: '#' },
                  { icon: Youtube, label: 'YouTube', href: '#' },
                ].map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white border border-slate-100/80 flex items-center justify-center text-primary/50 hover:text-secondary hover:border-secondary/30 hover:shadow-[0_2px_8px_rgba(212,175,55,0.15)] transition-all duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="w-[18px] h-[18px]" />
                  </a>
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-3">© 2024 Cancer Aware Bharat</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
