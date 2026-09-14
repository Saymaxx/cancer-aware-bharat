import React, { useState } from 'react';
import { 
  Phone, MessageSquare, Stethoscope, HeartHandshake, 
  X, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router';

interface FastTrackTriageFabProps {
  onOpenAssessment: () => void;
  onOpenEnquiry: () => void;
}

export default function FastTrackTriageFab({ onOpenAssessment, onOpenEnquiry }: FastTrackTriageFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Expanded Drawer Popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-[#FAFCF8] rounded-3xl shadow-2xl border border-[#0E3B36]/20 overflow-hidden animate-[fadeIn_0.2s_ease-out] mb-2">
          
          {/* Drawer Header */}
          <div className="bg-[#0E3B36] p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#E8A23A]">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-normal text-white">Emergency Patient Navigation</h3>
                <p className="text-[10px] text-white/70">Fast-track guidance & clinical helpline</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/75 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions List */}
          <div className="p-4 space-y-2.5 text-left">
            
            {/* 1. National Helpline Call */}
            <a
              href="tel:+919120110286"
              className="p-3.5 rounded-2xl bg-[#EEF3EF] hover:bg-[#E2EAE3] border border-[#0E3B36]/10 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E3B36] text-white flex items-center justify-center font-bold shadow-xs">
                  <Phone className="w-4.5 h-4.5 text-[#E8A23A]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0E3B36]">Call Helpline Assistance</h4>
                  <p className="font-mono text-[11px] font-bold text-[#C8443C]">+91-9120110286</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#0E3B36] group-hover:translate-x-1 transition-transform">→</span>
            </a>

            {/* 2. WhatsApp Support */}
            <a
              href="https://wa.me/919120110286?text=Hello%20Cancer%20Aware%20Bharat,%20I%20need%20urgent%20guidance%20for%20cancer%20screening."
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-white hover:bg-[#F3F6F1] border border-[#0E3B36]/12 flex items-center justify-between transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center font-bold">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0E3B36]">WhatsApp Navigation Desk</h4>
                  <p className="text-[10px] text-[#1B2620]/65">Direct chat with verified caseworkers</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#0E3B36] group-hover:translate-x-1 transition-transform">→</span>
            </a>

            {/* 3. Symptom Self-Assessment Wizard */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAssessment();
              }}
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#F3F6F1] border border-[#0E3B36]/12 flex items-center justify-between transition-all group shadow-xs cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8A23A]/20 text-[#8B5E00] flex items-center justify-center font-bold">
                  <Stethoscope className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0E3B36]">Early Symptom Self-Check</h4>
                  <p className="text-[10px] text-[#1B2620]/65">4-step guided risk assessment</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#0E3B36] group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* 4. Request Patient Callback */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenEnquiry();
              }}
              className="w-full p-3.5 rounded-2xl bg-[#0E3B36] hover:bg-[#0E3B36]/90 text-white flex items-center justify-between transition-all group shadow-md cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#E8A23A] flex items-center justify-center font-bold">
                  <HeartHandshake className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Request Urgent Hospital Callback</h4>
                  <p className="text-[10px] text-white/75">Referral coordinator will contact within 4h</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#E8A23A] group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

          <div className="px-4 py-2.5 bg-[#EEF3EF] border-t border-[#0E3B36]/8 text-center text-[10px] text-[#1B2620]/60">
            Free & Confidential • 100% Non-Profit Initiative
          </div>

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-[#1B2620] text-white rotate-0'
            : 'bg-gradient-to-r from-[#0E3B36] via-[#134F49] to-[#0E3B36] text-white hover:scale-105 border border-[#E8A23A]/30'
        }`}
      >
        {/* Glow pulse behind FAB */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#E8A23A]/25 blur-sm group-hover:bg-[#E8A23A]/40 transition-all pointer-events-none animate-pulse" />
        )}

        <div className="relative flex items-center gap-2">
          {isOpen ? (
            <X className="w-5 h-5 text-[#E8A23A]" />
          ) : (
            <Phone className="w-5 h-5 text-[#E8A23A] animate-bounce" />
          )}

          <span className="font-serif text-xs font-normal tracking-wide text-white">
            {isOpen ? 'Close' : 'Emergency Triage & Helpline'}
          </span>
        </div>
      </button>

    </div>
  );
}
