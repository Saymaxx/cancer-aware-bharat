import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Menu, X, Heart, LogOut, Building2,
  ChevronDown, Home, Target, Stethoscope, BookOpen, Calendar, UserPlus, PhoneCall,
  Images, Users, ArrowRight, User, Shield, Gift, Sparkles, LayoutDashboard
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

  const moreLinks = [
    { path: '/mission', label: 'Our Mission', sublabel: 'Grassroots oncological vision', icon: Target },
    { path: '/doctors', label: 'Our Doctors / हमारे डॉक्टर', sublabel: 'Oncology specialists panel', icon: Stethoscope },
    { path: '/cancer-awareness', label: 'Cancer Awareness', sublabel: 'Education & prevention guides', icon: BookOpen },
    { path: '/events', label: 'Health Camps', sublabel: 'Free screening events', icon: Calendar },
  ];

  return (
    <>
      {/* ── Top Alert Bar (Sindoor Urgent Indicator Bar) ── */}
      <div className="bg-[#C8443C] text-white text-[12px] py-1.5 px-4 overflow-hidden relative z-40 border-b border-[#a8342d]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-200">Alert:</span>
            <span className="text-white/95 font-medium truncate">
              Free Early Detection & Screening Camps Active Across New Delhi, Pune & Lucknow.
            </span>
            <button
              onClick={() => handleNavClick('/events')}
              className="font-bold underline text-amber-200 hover:text-white transition-colors cursor-pointer ml-1 text-xs shrink-0"
            >
              Register Now
            </button>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-white/90 shrink-0">
            <span>National Helpline: <a href="tel:+919120110286" className="font-bold text-white hover:text-amber-200 transition-colors">+91-9120110286</a></span>
          </div>
        </div>
      </div>

      {/* ── Top Contact Bar (Ink Teal Dusk Strip) ── */}
      <div className="bg-[#0E3B36] text-white text-xs border-b border-white/10 hidden md:block">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a 
              href="tel:+919120110286" 
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#E8A23A]" />
              <span className="font-semibold text-white">24/7 Helpline:</span>
              <span className="text-white/80">+91-9120110286</span>
            </a>
            <a 
              href="https://wa.me/919120110286" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80">WhatsApp Support: +91 9120110286</span>
            </a>
          </div>

          <div className="flex items-center gap-5 text-xs text-white/80">
            <button
              onClick={() => handleNavClick('/events')}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#E8A23A]" />
              <span>Free Cancer Camps</span>
            </button>
            <span className="text-white/30">•</span>
            <button
              onClick={() => handleNavClick('/hospital/login')}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#E8A23A]" />
              <span>Hospital Partner Portal</span>
            </button>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-2.5">
              <a 
                href="https://facebook.com/cancerawarebharat" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook" 
                className="hover:text-[#E8A23A] text-white/70 transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://instagram.com/cancerawarebharat" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram" 
                className="hover:text-[#E8A23A] text-white/70 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://youtube.com/@cancerawarebharat" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="YouTube" 
                className="hover:text-[#E8A23A] text-white/70 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Sticky Navigation Header ── */}
      <nav
        ref={navRef}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${scrolled
            ? 'bg-[#FAFCF8]/98 backdrop-blur-xl shadow-[0_4px_24px_rgba(14,59,54,0.08)] border-b border-[#D5DFD7]'
            : 'bg-[#F3F6F1]/95 backdrop-blur-md border-b border-[#D5DFD7]/60'
          }`}
      >
        <div className={`transition-all duration-300 ease-out w-full px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto flex justify-between items-center gap-4 relative ${scrolled ? 'h-[70px]' : 'h-[78px]'}`}>

          {/* LEFT: Brand Logo & Typography */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center space-x-3 text-left hover:opacity-95 transition-opacity duration-200 focus:outline-none min-w-0 shrink-0 group z-10"
          >
            <img
              src="/brand-logo.jpeg"
              alt="Cancer Aware Bharat Logo"
              className={`rounded-full object-cover ring-2 ring-[#0E3B36]/15 group-hover:ring-[#0E3B36]/30 transition-all duration-200 shrink-0 ${scrolled ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-11 sm:h-11'}`}
            />
            <div className="flex flex-col min-w-0">
              <span className={`font-serif font-bold text-[#0E3B36] tracking-tight leading-none transition-all duration-200 truncate ${scrolled ? 'text-[18px] sm:text-[21px]' : 'text-[19px] sm:text-[23px]'}`}>
                Cancer Aware Bharat
              </span>
              <span className="font-serif-hindi text-[11px] font-medium text-[#0E3B36]/70 hidden sm:block mt-0.5">
                जीवन की नई किरण • कैंसर जागरूकता
              </span>
            </div>
          </button>

          {/* CENTER: Floating Navigation Pill (Desktop) */}
          <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-2 xl:px-4 z-10">
            <div className={`flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(14,59,54,0.06)] border border-[#D5DFD7]/80 px-2 xl:px-3.5 transition-all duration-300 ease-out hover:shadow-[0_6px_28px_rgba(14,59,54,0.1)] ${scrolled ? 'h-[48px] xl:h-[54px] gap-1' : 'h-[52px] xl:h-[58px] gap-1'}`}>
              <button
                onClick={() => handleNavClick('/')}
                className={`relative flex items-center px-3 xl:px-4 py-1.5 text-xs xl:text-[14.5px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none whitespace-nowrap ${
                  location.pathname === '/'
                    ? 'text-[#0E3B36] font-bold bg-[#EEF3EF]'
                    : 'text-[#1B2620]/80 hover:text-[#0E3B36] hover:bg-[#EEF3EF]/60'
                }`}
              >
                <span>Home</span>
                {location.pathname === '/' && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#E8A23A] rounded-full" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('/about')}
                className={`relative flex items-center px-3 xl:px-4 py-1.5 text-xs xl:text-[14.5px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none whitespace-nowrap ${
                  location.pathname === '/about'
                    ? 'text-[#0E3B36] font-bold bg-[#EEF3EF]'
                    : 'text-[#1B2620]/80 hover:text-[#0E3B36] hover:bg-[#EEF3EF]/60'
                }`}
              >
                <span>About</span>
                {location.pathname === '/about' && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#E8A23A] rounded-full" />
                )}
              </button>

              {/* Events Dropdown */}
              <div
                className="relative flex items-center h-full"
                key="events-dropdown"
                onMouseEnter={() => setActiveDropdown('events')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'events' ? null : 'events')}
                  className={`relative flex items-center gap-1 px-3 xl:px-4 py-1.5 text-xs xl:text-[14.5px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none whitespace-nowrap ${
                    location.pathname === '/events' || location.pathname === '/gallery'
                      ? 'text-[#0E3B36] font-bold bg-[#EEF3EF]'
                      : 'text-[#1B2620]/80 hover:text-[#0E3B36] hover:bg-[#EEF3EF]/60'
                  }`}
                >
                  <span>Events</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'events' ? 'rotate-180' : ''}`} />
                  {(location.pathname === '/events' || location.pathname === '/gallery') && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#E8A23A] rounded-full" />
                  )}
                </button>

                {activeDropdown === 'events' && (
                  <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-2 z-50 w-[210px]">
                    <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(14,59,54,0.12)] border border-[#D5DFD7] p-2 animate-fade-in-slide">
                      <button
                        onClick={() => handleNavClick('/events')}
                        className="w-full px-4 py-2.5 text-xs xl:text-[14px] font-semibold text-[#1B2620]/90 hover:bg-[#EEF3EF] hover:text-[#0E3B36] rounded-xl transition-colors text-left"
                      >
                        Screening Camps
                      </button>
                      <button
                        onClick={() => handleNavClick('/gallery')}
                        className="w-full px-4 py-2.5 text-xs xl:text-[14px] font-semibold text-[#1B2620]/90 hover:bg-[#EEF3EF] hover:text-[#0E3B36] rounded-xl transition-colors text-left"
                      >
                        Camp Gallery
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Health Centres */}
              <button
                onClick={() => handleNavClick('/hospitals')}
                className={`hidden xl:flex relative items-center px-3 xl:px-4 py-1.5 text-xs xl:text-[14.5px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none whitespace-nowrap ${
                  location.pathname === '/hospitals'
                    ? 'text-[#0E3B36] font-bold bg-[#EEF3EF]'
                    : 'text-[#1B2620]/80 hover:text-[#0E3B36] hover:bg-[#EEF3EF]/60'
                }`}
              >
                <span>Health Centres</span>
                {location.pathname === '/hospitals' && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#E8A23A] rounded-full" />
                )}
              </button>

              {/* More Dropdown */}
              <div
                className="relative flex items-center h-full"
                key="more-dropdown"
                onMouseEnter={() => setActiveDropdown('more')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
                  className={`relative flex items-center gap-1 px-3 xl:px-4 py-1.5 text-xs xl:text-[14.5px] font-semibold transition-all duration-200 rounded-full cursor-pointer focus:outline-none whitespace-nowrap ${
                    activeDropdown === 'more' ? 'text-[#0E3B36] bg-[#EEF3EF]' : 'text-[#1B2620]/80 hover:text-[#0E3B36] hover:bg-[#EEF3EF]/60'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'more' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'more' && (
                  <div className="absolute top-[100%] right-0 xl:right-auto xl:left-1/2 xl:-translate-x-1/2 pt-2 z-50 w-[300px]">
                    <div className="bg-white rounded-2xl shadow-[0_20px_48px_rgba(14,59,54,0.12)] border border-[#D5DFD7] p-2.5 animate-fade-in-slide max-h-[80vh] overflow-y-auto">
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7A8E83]">
                        Care & Centres
                      </p>
                      <button
                        onClick={() => handleNavClick('/hospitals')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#1B2620]/90 hover:bg-[#EEF3EF] hover:text-[#0E3B36] transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 group-hover:bg-[#E8A23A]/20 transition-colors duration-200">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] leading-tight">Health Centres</p>
                          <p className="text-[11px] text-[#7A8E83] font-medium mt-0.5">Partner hospitals & screening centres</p>
                        </div>
                      </button>

                      <div className="my-1.5 mx-3 kantha-divider" />
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7A8E83]">
                        Media & Resources
                      </p>
                      <button
                        onClick={() => handleNavClick('/blogs')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#1B2620]/90 hover:bg-[#EEF3EF] hover:text-[#0E3B36] transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 group-hover:bg-[#E8A23A]/20 transition-colors duration-200">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] leading-tight">Blogs & Articles</p>
                          <p className="text-[11px] text-[#7A8E83] font-medium mt-0.5">Cancer care insights & stories</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavClick('/gallery')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#1B2620]/90 hover:bg-[#EEF3EF] hover:text-[#0E3B36] transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 group-hover:bg-[#E8A23A]/20 transition-colors duration-200">
                          <Images className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] leading-tight">Gallery</p>
                          <p className="text-[11px] text-[#7A8E83] font-medium mt-0.5">Field camp photos & highlights</p>
                        </div>
                      </button>

                      <div className="my-1.5 mx-3 kantha-divider" />
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7A8E83]">
                        Specialist Info
                      </p>

                      {moreLinks.map(item => (
                        <button
                          key={item.path + item.label}
                          onClick={() => handleNavClick(item.path)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#1B2620]/90 hover:bg-[#EEF3EF] hover:text-[#0E3B36] transition-all duration-200 text-left group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 group-hover:bg-[#E8A23A]/20 transition-colors duration-200">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-[13px] leading-tight">{item.label}</p>
                            <p className="text-[11px] text-[#7A8E83] font-medium mt-0.5">{item.sublabel}</p>
                          </div>
                        </button>
                      ))}

                      <div className="my-1.5 mx-3 kantha-divider" />

                      <button
                        onClick={() => handleNavClick('/join-us')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#1B2620]/90 hover:bg-[#FDF4E5] hover:text-[#0E3B36] transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#FDF4E5] text-[#E8A23A] flex items-center justify-center shrink-0 group-hover:bg-[#E8A23A]/25 transition-colors duration-200">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] leading-tight">Join Us / मिशन से जुड़ें</p>
                          <p className="text-[11px] text-[#7A8E83] font-medium mt-0.5">Become a community advocate</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenEnquiry();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#1B2620]/90 hover:bg-[#EEF3EF] hover:text-[#0E3B36] transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 group-hover:bg-[#E8A23A]/20 transition-colors duration-200">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] leading-tight">Contact Us</p>
                          <p className="text-[11px] text-[#7A8E83] font-medium mt-0.5">Patient helpline & enquiry</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 shrink-0 z-10">
            {loggedInStaff ? (
              <>
                <button
                  onClick={() => navigate(loggedInStaff.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard')}
                  className="px-3 xl:px-4 py-1.5 xl:py-2 rounded-full bg-[#EEF3EF] text-[#0E3B36] border border-[#D5DFD7] text-xs xl:text-[13.5px] font-semibold hover:bg-[#0E3B36] hover:text-white transition-all duration-200 cursor-pointer inline-flex items-center space-x-1.5 focus:outline-none whitespace-nowrap"
                >
                  <Shield className="w-3.5 h-3.5 text-[#E8A23A]" />
                  <span>{loggedInStaff.role === 'superadmin' ? 'Super Admin' : 'Admin Console'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-red-50 text-[#C8443C] border border-red-100 flex items-center justify-center hover:bg-red-100 transition-all duration-200 cursor-pointer focus:outline-none shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : loggedInVolunteer ? (
              <>
                <button
                  onClick={() => navigate('/volunteer/dashboard')}
                  className="px-3 xl:px-4 py-1.5 xl:py-2 rounded-full bg-[#EEF3EF] text-[#0E3B36] text-xs xl:text-[13.5px] font-semibold hover:bg-[#0E3B36] hover:text-white transition-all duration-200 cursor-pointer inline-flex items-center space-x-2 border border-[#D5DFD7] focus:outline-none whitespace-nowrap"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0E3B36] text-white text-[10px] font-bold flex items-center justify-center">
                    {volunteerInitials}
                  </div>
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-red-50 text-[#C8443C] border border-red-100 flex items-center justify-center hover:bg-red-100 transition-all duration-200 cursor-pointer focus:outline-none shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : loggedInHospital ? (
              <>
                <button
                  onClick={() => navigate('/hospital/dashboard')}
                  className="px-3 xl:px-4 py-1.5 xl:py-2 rounded-full bg-[#EEF3EF] text-[#0E3B36] border border-[#D5DFD7] text-xs xl:text-[13.5px] font-semibold hover:bg-[#0E3B36] hover:text-white transition-all duration-200 cursor-pointer inline-flex items-center space-x-1.5 focus:outline-none whitespace-nowrap"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#E8A23A]" />
                  <span>Hospital Portal</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-red-50 text-[#C8443C] border border-red-100 flex items-center justify-center hover:bg-red-100 transition-all duration-200 cursor-pointer focus:outline-none shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
                  className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-white border border-[#D5DFD7] flex items-center justify-center text-[#0E3B36] hover:bg-[#EEF3EF] transition-all duration-200 shadow-sm focus:outline-none cursor-pointer"
                  title="Sign In"
                >
                  <User className="w-4 h-4" />
                </button>

                {activeDropdown === 'login' && (
                  <div className="absolute top-[100%] right-0 pt-2 z-50 w-56">
                    <div className="bg-white rounded-2xl shadow-[0_20px_48px_rgba(14,59,54,0.12)] border border-[#D5DFD7] p-2 animate-fade-in-slide">
                      <p className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7A8E83] border-b border-[#D5DFD7]/60 mb-1">
                        Portal Access
                      </p>
                      <button
                        onClick={() => handleNavClick('/volunteer/login')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13.5px] font-semibold text-[#1B2620] hover:bg-[#EEF3EF] hover:text-[#0E3B36] rounded-xl transition-colors text-left group"
                      >
                        <User className="w-4 h-4 text-[#7A8E83] group-hover:text-[#E8A23A]" />
                        <span>Volunteer Login</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('/hospital/login')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13.5px] font-semibold text-[#1B2620] hover:bg-[#EEF3EF] hover:text-[#0E3B36] rounded-xl transition-colors text-left group"
                      >
                        <Building2 className="w-4 h-4 text-[#7A8E83] group-hover:text-[#E8A23A]" />
                        <span>Hospital Login</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Donate Modal Trigger */}
            <button
              onClick={onOpenDonate}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[#0E3B36]/30 text-[#0E3B36] rounded-full font-semibold text-xs xl:text-[13.5px] transition-all duration-200 hover:bg-[#EEF3EF] hover:border-[#0E3B36] focus:outline-none whitespace-nowrap cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-[#E8A23A]" />
              <span>Donate</span>
            </button>
            
            {/* Primary Consultation Action */}
            <button
              onClick={onOpenEnquiry}
              className="btn-marigold text-xs xl:text-[13.5px] !py-2 !px-4.5 whitespace-nowrap cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Book Consultation</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenDonate}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-full border border-[#0E3B36] text-[#0E3B36] text-[11px] sm:text-[12px] font-semibold hover:bg-[#EEF3EF] transition-colors whitespace-nowrap"
            >
              Donate
            </button>
            <button
              onClick={() => onOpenEnquiry()}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-[#E8A23A] text-[#1B2620] text-[11px] sm:text-[12px] font-bold hover:bg-[#D58F26] transition-colors shadow-sm whitespace-nowrap"
            >
              Enquiry
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#0E3B36] hover:bg-[#EEF3EF] focus:outline-none transition-colors shrink-0"
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
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[6px] animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute top-0 left-0 h-full w-[88%] max-w-[360px] bg-[#FAFCF8] shadow-2xl rounded-r-3xl animate-slide-in-left flex flex-col overflow-hidden border-r border-[#D5DFD7]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5DFD7] shrink-0 bg-white">
              <button
                onClick={() => handleNavClick('/')}
                className="flex items-center gap-3 focus:outline-none"
              >
                <img
                  src="/brand-logo.jpeg"
                  alt="Cancer Aware Bharat"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0E3B36]/15"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-[17px] font-bold text-[#0E3B36] leading-tight">Cancer Aware Bharat</span>
                  <span className="font-serif-hindi text-[10px] font-medium text-[#0E3B36]/60">जीवन की नई किरण</span>
                </div>
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#EEF3EF] text-[#1B2620] transition-colors duration-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-1">
              {[
                { path: '/', label: 'Home', icon: Home },
                { path: '/about', label: 'About Us', icon: Users },
                { path: '/mission', label: 'Our Mission', icon: Target },
                { path: '/events', label: 'Screening Camps', icon: Calendar },
                { path: '/hospitals', label: 'Health Centres', icon: Building2 },
                { path: '/blogs', label: 'Blogs & Articles', icon: BookOpen },
                { path: '/gallery', label: 'Field Gallery', icon: Images },
                { path: '/doctors', label: 'Specialist Doctors', icon: Stethoscope },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-3.5 w-full text-left py-3 px-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-[#EEF3EF] text-[#0E3B36] font-bold'
                      : 'text-[#1B2620] hover:bg-[#EEF3EF]/60'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${location.pathname === item.path ? 'text-[#E8A23A]' : 'text-[#7A8E83]'}`} />
                  <span className="text-[14.5px]">{item.label}</span>
                </button>
              ))}

              <div className="my-2 kantha-divider" />

              <button
                onClick={() => handleNavClick('/join-us')}
                className="flex items-center gap-3.5 w-full text-left py-3 px-3 rounded-xl text-[#0E3B36] font-semibold bg-[#FDF4E5] hover:bg-[#FDF4E5]/80 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#E8A23A]" />
                <span className="text-[14.5px]">Join As Volunteer / मिशन से जुड़ें</span>
              </button>

              {/* Mobile Auth Access */}
              <div className="pt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7A8E83] mb-2 px-1">Access Portals</p>
                {loggedInStaff ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(loggedInStaff.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#EEF3EF] text-[#0E3B36] font-semibold text-[13.5px] flex items-center justify-center gap-2 mb-2"
                  >
                    <Shield className="w-4 h-4 text-[#E8A23A]" />
                    <span>Admin Console</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavClick('/volunteer/login')}
                      className="py-2.5 px-2 rounded-xl bg-white border border-[#D5DFD7] text-[#0E3B36] font-semibold text-[12px] flex items-center justify-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-[#7A8E83]" />
                      <span>Volunteer</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('/hospital/login')}
                      className="py-2.5 px-2 rounded-xl bg-white border border-[#D5DFD7] text-[#0E3B36] font-semibold text-[12px] flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#7A8E83]" />
                      <span>Hospital</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Footer CTA */}
            <div className="p-4 border-t border-[#D5DFD7] bg-white">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEnquiry();
                }}
                className="btn-marigold w-full !py-2.5 !text-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Book Free Consultation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
