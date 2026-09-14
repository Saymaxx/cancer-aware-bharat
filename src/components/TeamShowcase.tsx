import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from './icons/SocialIcons';
import PremiumSection from './common/PremiumSection';

/* ─────────── Section Reveal on Scroll ─────────── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// TEAM DATA
// ────────────────────────────────────────────────────────

export const doctorsData = [
  { name: 'Dr. Ajay Kumar', spec: 'Senior Surgical Oncologist', hosp: 'IMS-BHU • Gold Medalist', img: '/dr-ajay-kumar.jpg' },
  { name: 'Dr. Neha Sharma', spec: 'Breast Oncology Specialist', hosp: 'AIIMS Alum • Clinical Lead', img: '/dr-neha-sharma.jpg' },
  { name: 'Dr. Rahul Singh', spec: 'Radiation Oncologist', hosp: 'Tata Memorial Panel Alum', img: '/dr-rahul-singh.jpg' },
  { name: 'Dr. Priya Verma', spec: 'Surgical Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1594824436998-d40328c87113?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Dr. Vikram Desai', spec: 'Hemato-Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Dr. Sneha Patil', spec: 'Pediatric Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Dr. Anil Kapoor', spec: 'Onco-Surgeon', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1537368910025-7028a609b13c?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Dr. Meera Reddy', spec: 'Gynecologic Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400&h=500' },
];

export const healthcareData = [
  { name: 'Anjali Desai', spec: 'Chief Oncology Nurse', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1582750433449-648ed127d09e?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Rohan Mehta', spec: 'Medical Coordinator', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Pooja Iyer', spec: 'Clinical Psychologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1590611936760-eeb9bc598548?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Kiran Joshi', spec: 'Physiotherapist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1623854767648-e7bf80040f11?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Snehal Kulkarni', spec: 'Nutritionist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Amit Bansal', spec: 'Patient Navigator', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Ritu Sharma', spec: 'Palliative Care Nurse', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1605684954998-685c79d6a018?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Manish Tiwari', spec: 'Lab Technician', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1537368910025-7028a609b13c?auto=format&fit=crop&q=80&w=400&h=500' },
];

export const volunteersData = [
  { name: 'Arjun Das', spec: 'Camp Organizer', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Divya Nair', spec: 'Awareness Speaker', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Rahul Chawla', spec: 'Field Coordinator', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Simran Kaur', spec: 'Social Media Lead', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Vikram Singh', spec: 'Rural Outreach', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Megha Gupta', spec: 'Patient Support', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Aditya Sen', spec: 'Logistics Head', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Sneha Roy', spec: 'Fundraising Coord', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=500' },
];

export const leadershipData = [
  { name: 'Dr. Ramesh Sharma', spec: 'Founder & Chairman', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Sunita Menon', spec: 'Executive Director', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Karan Bhatia', spec: 'Head of Operations', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Nisha Verma', spec: 'Chief Medical Officer', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Deepak Raj', spec: 'Director of Outreach', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Meena Iyer', spec: 'Head of Partnerships', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=500' },
];

// ────────────────────────────────────────────────────────
// REUSABLE CARD COMPONENT WITH SUNRISE ARC TEAL DUOTONE
// ────────────────────────────────────────────────────────

export const TeamCard = ({ member, delay }: { member: any; delay: number }) => (
  <RevealSection delay={delay}>
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full border border-[#D5DFD7]">
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EEF3EF]">
        <img 
          src={member.img} 
          alt={member.name} 
          className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105" 
        />
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E3B36]/80 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Active Social / Professional Links (Slide in from right on hover) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-400 ease-out z-10">
          {[
            { Icon: Instagram, url: 'https://instagram.com/cancerawarebharat', label: 'Instagram' },
            { Icon: Facebook, url: 'https://facebook.com/cancerawarebharat', label: 'Facebook' },
            { Icon: Linkedin, url: 'https://linkedin.com/company/cancer-aware-bharat', label: 'LinkedIn' },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-[#0E3B36] hover:bg-[#E8A23A] hover:text-[#1B2620] transition-colors shadow-sm cursor-pointer"
              style={{ transitionDelay: `${80 + idx * 40}ms` }}
            >
              <item.Icon className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="font-serif text-[#0E3B36] text-[18px] sm:text-[19px] font-bold mb-1 leading-tight line-clamp-1">{member.name}</h3>
          <p className="text-[#E8A23A] font-semibold text-[13px] mb-1 line-clamp-1">{member.spec}</p>
        </div>
        <p className="text-[#7A8E83] text-[12px] font-medium pt-2 border-t border-[#D5DFD7]/60 mt-2 line-clamp-1">{member.hosp}</p>
      </div>
    </div>
  </RevealSection>
);

// ────────────────────────────────────────────────────────
// MAIN SHOWCASE COMPONENT
// ────────────────────────────────────────────────────────

export default function TeamShowcase() {
  const navigate = useNavigate();

  return (
    <PremiumSection variant="warm-1">
      <div className="space-y-12 max-w-6xl mx-auto">
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">
              <Stethoscope className="w-3.5 h-3.5 text-[#E8A23A]" /> Medical Advisory Board
            </span>
            <h2 className="section-title text-3xl md:text-5xl">
              Our Specialized Doctors
            </h2>
            <p className="section-subtitle">
              Our experienced oncologists, surgeons, and cancer specialists guide Cancer Aware Bharat with clinical integrity, early detection protocols, and compassionate patient care.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {doctorsData.slice(0, 3).map((doc, i) => (
            <TeamCard key={i} member={doc} delay={i * 100} />
          ))}
        </div>

        <RevealSection delay={250}>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/our-team')}
              className="btn-primary py-3.5 px-9 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Full Medical Advisory Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </RevealSection>
      </div>
    </PremiumSection>
  );
}
