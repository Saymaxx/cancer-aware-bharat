import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
  onOpenSitemap: () => void;
}

export default function Footer({
  onOpenVolunteer,
  onOpenEnquiry,
  onOpenSitemap
}: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant mt-16 w-full">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2 flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/brand-logo.jpeg"
                alt="Cancer Aware Bharat Logo"
                className="w-10 h-10 rounded-full object-cover border border-primary/20 shadow-xs"
              />
              <span className="font-headline-lg text-2xl font-black text-on-surface dark:text-inverse-on-surface">
                Cancer Aware Bharat
              </span>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant dark:text-outline-variant max-w-md">
              Bridging the gap between clinical authority and human empathy to support patients and caregivers across India. Dedicated to early detection, screening campaigns, and patient navigation.
            </p>
            <p className="font-caption text-xs text-on-surface-variant dark:text-outline-variant mt-auto pt-4">
              © 2026 Cancer Aware Bharat. All Rights Reserved. Dedicated to early detection and compassionate support.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1 flex flex-col space-y-3">
            <span className="font-title-md text-base font-semibold text-on-surface dark:text-inverse-on-surface mb-2">
              Our Initiatives
            </span>
            <button
              onClick={() => navigate('/about')}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Our Mission
            </button>
            <button
              onClick={() => navigate('/events')}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Screening Camps
            </button>
            <button
              onClick={() => navigate('/hospitals')}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Hospital Network
            </button>
            <button
              onClick={() => navigate('/blogs')}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Educational Blogs
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Impact & Platform Gallery
            </button>
          </div>

          {/* Connect Column */}
          <div className="col-span-1 flex flex-col space-y-3">
            <span className="font-title-md text-base font-semibold text-on-surface dark:text-inverse-on-surface mb-2">
              Connect & Support
            </span>
            <button
              onClick={() => onOpenEnquiry()}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Patient Guidance & Enquiry
            </button>
            <button
              onClick={onOpenSitemap}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Interactive Sitemap
            </button>
            <button
              onClick={() => navigate('/hospital/login')}
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2 font-semibold text-primary"
            >
              Hospital Partner Portal
            </button>
            <a
              href="mailto:support@awarebharat.org"
              className="text-left font-body-md text-sm text-on-surface-variant dark:text-outline-variant hover:text-primary transition-all cursor-pointer focus:underline focus:decoration-2"
            >
              Contact Us: info@awarebharat.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
