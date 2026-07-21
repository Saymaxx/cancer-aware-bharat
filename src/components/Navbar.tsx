import React, { useState } from 'react';
import { Menu, X, Heart, Search } from 'lucide-react';

interface NavbarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function Navbar({
  activePage,
  onPageChange,
  onOpenVolunteer,
  onOpenEnquiry
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    onPageChange(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-outline-variant/15 w-full transition-all duration-200">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-12 py-3.5 max-w-[1200px] mx-auto">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
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
            onClick={() => handleNavClick('about')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              activePage === 'about'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('events')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              activePage === 'events'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => handleNavClick('hospitals')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              activePage === 'hospitals'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Hospitals
          </button>
          <button
            onClick={() => handleNavClick('blogs')}
            className={`font-label-sm text-sm pb-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              activePage === 'blogs'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Blogs
          </button>
        </div>

        {/* Actions & Search */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => onOpenVolunteer()}
            className="px-4 py-2 rounded-lg bg-surface-variant text-primary font-label-sm text-sm font-semibold hover:bg-surface-container transition-colors cursor-pointer"
          >
            Volunteer
          </button>
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
            onClick={() => handleNavClick('about')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              activePage === 'about' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('events')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              activePage === 'events' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Events & Camps
          </button>
          <button
            onClick={() => handleNavClick('hospitals')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              activePage === 'hospitals' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Hospitals Network
          </button>
          <button
            onClick={() => handleNavClick('blogs')}
            className={`block w-full text-left py-2 px-3 rounded-lg font-label-sm text-sm transition-all ${
              activePage === 'blogs' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Educational Blogs
          </button>
          <div className="pt-3 border-t border-outline-variant/10 flex flex-col space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVolunteer();
              }}
              className="w-full py-2 px-4 rounded-lg bg-surface-variant text-primary text-center font-semibold text-sm active:scale-[0.98] transition-all"
            >
              Join as Volunteer
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
