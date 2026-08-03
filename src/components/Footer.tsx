import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Heart, Mail, Phone, MapPin, ArrowRight, ExternalLink, ChevronRight,
  Facebook, Twitter, Instagram, Linkedin, Youtube, CheckCircle2
} from 'lucide-react';

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
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  return (
    <footer className="bg-primary text-white mt-0 w-full">
      {/* Emergency Contact Bar */}
      <div className="border-b border-white/5">
        <div className="section-container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <span className="text-white/50 text-xs font-medium">24/7 Cancer Helpline:</span>
                <span className="ml-2 font-bold text-white">+91 11 4055 9200</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Helpline active — Average response time: 2 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/brand-logo.jpeg"
                alt="Cancer Aware Bharat Logo"
                className="w-11 h-11 rounded-full object-cover border-2 border-white/10 shadow-sm"
              />
              <div>
                <span className="font-outfit text-xl font-bold text-white block leading-tight">
                  Cancer Aware Bharat
                </span>
                <span className="text-[10px] text-white/40 tracking-wide">कैंसर जागरूकता अभियान</span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-sm">
              Bridging the gap between clinical authority and human empathy to support patients and caregivers across India. Dedicated to early detection, screening campaigns, and patient navigation.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Youtube, label: 'YouTube' },
              ].map(social => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-secondary transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-outfit font-semibold text-sm text-white mb-4 tracking-wide">Quick Links</h4>
            <div className="space-y-2.5">
              {[
                { label: 'About Us', action: () => navigate('/about') },
                { label: 'Our Mission', action: () => navigate('/mission') },
                { label: 'Screening Camps', action: () => navigate('/events') },
                { label: 'Hospital Network', action: () => navigate('/hospitals') },
                { label: 'Educational Blogs', action: () => navigate('/blogs') },
                { label: 'Impact Gallery', action: () => navigate('/gallery') },
              ].map(link => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="block text-sm text-white hover:text-secondary transition-colors cursor-pointer text-left group"
                >
                  <span className="group-hover:ml-1 transition-all duration-200">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Useful Links */}
          <div className="lg:col-span-2">
            <h4 className="font-outfit font-semibold text-sm text-white mb-4 tracking-wide">Useful Links</h4>
            <div className="space-y-2.5">
              {[
                { label: 'Patient Enquiry', action: () => onOpenEnquiry() },
                { label: 'Become a Volunteer', action: () => onOpenVolunteer() },
                { label: 'Join Us', action: () => navigate('/join-us') },
                { label: 'Our Doctors', action: () => navigate('/doctors') },
                { label: 'Interactive Sitemap', action: () => onOpenSitemap() },
                { label: 'Hospital Partner Portal', action: () => navigate('/hospital/login') },
              ].map(link => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="block text-sm text-white hover:text-secondary transition-colors cursor-pointer text-left group"
                >
                  <span className="group-hover:ml-1 transition-all duration-200">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h4 className="font-outfit font-semibold text-sm text-white mb-4 tracking-wide">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-white">
                  <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>Sector 7, Dwarka, New Delhi, Delhi 110075, India</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white">
                  <Mail className="w-4 h-4 text-secondary shrink-0" />
                  <a href="mailto:info@awarebharat.org" className="hover:text-secondary transition-colors">info@awarebharat.org</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-white">
                  <Phone className="w-4 h-4 text-secondary shrink-0" />
                  <a href="tel:+911140559200" className="hover:text-white transition-colors">+91 11 4055 9200</a>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-outfit font-semibold text-sm text-white mb-3 tracking-wide">Newsletter</h4>
              {!footerSubscribed ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (footerEmail.includes('@')) setFooterSubscribed(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-white text-primary text-sm font-semibold transition-all shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-secondary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Subscribed successfully!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="section-container py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
            <p>© {new Date().getFullYear()} Cancer Aware Bharat. All Rights Reserved. Dedicated to early detection and compassionate support.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => onOpenSitemap()} className="hover:text-white/60 transition-colors cursor-pointer">Sitemap</button>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
