import React from 'react';
import { X, Home, Info, Book, Heart, Network, Building2, Calendar } from 'lucide-react';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function SitemapModal({
  isOpen,
  onClose,
  onNavigate,
  onOpenVolunteer,
  onOpenEnquiry
}: SitemapModalProps) {
  if (!isOpen) return null;

  const handleLinkClick = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.15)] border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-secondary-container" />
            <span className="font-headline-lg text-lg font-bold">Interactive Portal Sitemap</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sitemap Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-xs text-on-surface-variant leading-relaxed text-center max-w-xl mx-auto">
            Welcome to the <strong>Aware Bharat</strong> map of resources. Click any bubble or node below to instantly navigate to that section of the portal or trigger that module.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            
            {/* Home Node */}
            <div className="border border-outline-variant/50 rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors bg-surface-container-low/20">
              <button 
                onClick={() => handleLinkClick('home')}
                className="flex items-center gap-2 text-left text-sm font-bold text-primary hover:underline"
              >
                <Home className="w-4 h-4" /> Home Dashboard
              </button>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
                <li>Clinical Screening Risk Tool</li>
                <li>Live Impact Statistics</li>
                <li>Pillars of Purpose cards</li>
                <li>Active Campaign highlight</li>
              </ul>
            </div>

            {/* About Node */}
            <div className="border border-outline-variant/50 rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors bg-surface-container-low/20">
              <button 
                onClick={() => handleLinkClick('about')}
                className="flex items-center gap-2 text-left text-sm font-bold text-primary hover:underline"
              >
                <Info className="w-4 h-4" /> About & Mission
              </button>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
                <li>Mission & Vision bento cards</li>
                <li>Interactive Milestone Timeline</li>
                <li>Message from Founder card</li>
                <li>Become a Volunteer trigger</li>
              </ul>
            </div>

            {/* Hospitals Node */}
            <div className="border border-outline-variant/50 rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors bg-surface-container-low/20">
              <button 
                onClick={() => handleLinkClick('hospitals')}
                className="flex items-center gap-2 text-left text-sm font-bold text-primary hover:underline"
              >
                <Building2 className="w-4 h-4 text-primary" /> Clinical Network
              </button>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
                <li>Interactive Pins Map with tooltips</li>
                <li>Region & Center Type filters</li>
                <li>Detailed Hospital inspector</li>
                <li>Partnership Request Form</li>
              </ul>
            </div>

            {/* Events Node */}
            <div className="border border-outline-variant/50 rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors bg-surface-container-low/20">
              <button 
                onClick={() => handleLinkClick('events')}
                className="flex items-center gap-2 text-left text-sm font-bold text-primary hover:underline"
              >
                <Calendar className="w-4 h-4 text-primary" /> Campaigns & Camps
              </button>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
                <li>Free Screening Camps scheduling</li>
                <li>Category & Search filters</li>
                <li>Active Slot remaining calculator</li>
                <li>Historic Assembly gallery</li>
              </ul>
            </div>

            {/* Blogs Node */}
            <div className="border border-outline-variant/50 rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors bg-surface-container-low/20">
              <button 
                onClick={() => handleLinkClick('blogs')}
                className="flex items-center gap-2 text-left text-sm font-bold text-primary hover:underline"
              >
                <Book className="w-4 h-4" /> Educational Hub
              </button>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
                <li>Oncology Prevention blogs</li>
                <li>Chemo-friendly Nutrition guides</li>
                <li>Full-view responsive Reader</li>
                <li>Survivor Stories submission form</li>
              </ul>
            </div>

            {/* Actions Node */}
            <div className="border border-outline-variant/50 rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors bg-surface-container-low/20">
              <span className="flex items-center gap-2 text-sm font-bold text-secondary">
                <Heart className="w-4 h-4" fill="currentColor" /> Live Assistance
              </span>
              <div className="flex flex-col gap-2 pt-1.5">
                <button
                  onClick={() => {
                    onOpenVolunteer();
                    onClose();
                  }}
                  className="w-full py-1.5 bg-surface-variant text-primary rounded text-xs font-bold hover:bg-surface-container transition-colors text-left pl-3"
                >
                  Volunteer Registration
                </button>
                <button
                  onClick={() => {
                    onOpenEnquiry();
                    onClose();
                  }}
                  className="w-full py-1.5 bg-primary text-white rounded text-xs font-bold hover:opacity-90 transition-opacity text-left pl-3"
                >
                  Patient Enquiry & Support
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container px-6 py-3.5 border-t border-outline-variant flex justify-between items-center">
          <span className="text-[10px] text-on-surface-variant font-medium">Cancer Aware Bharat Digital Ecosystem Navigation</span>
          <button 
            onClick={onClose}
            className="px-4 py-1 bg-white border border-outline rounded text-xs font-semibold hover:bg-surface-container-low"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
