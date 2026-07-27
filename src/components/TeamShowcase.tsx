import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Plus, ArrowRight } from 'lucide-react';

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
// DUMMY DATA
// ────────────────────────────────────────────────────────

export const doctorsData = [
  { name: 'Dr. Ajay Kumar', spec: 'Medical Oncologist', hosp: 'Cancer Aware Bharat', img: '/dr-ajay-kumar.jpg' },
  { name: 'Dr. Neha Sharma', spec: 'Breast Cancer Specialist', hosp: 'Cancer Aware Bharat', img: '/dr-neha-sharma.jpg' },
  { name: 'Dr. Rahul Singh', spec: 'Radiation Oncologist', hosp: 'Cancer Aware Bharat', img: '/dr-rahul-singh.jpg' },
  { name: 'Dr. Priya Verma', spec: 'Surgical Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1594824436998-d40328c87113?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Dr. Vikram Desai', spec: 'Hemato-Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Dr. Sneha Patil', spec: 'Pediatric Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Dr. Anil Kapoor', spec: 'Onco-Surgeon', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1537368910025-7028a609b13c?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Dr. Meera Reddy', spec: 'Gynecologic Oncologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300&h=400' },
];

export const healthcareData = [
  { name: 'Anjali Desai', spec: 'Chief Oncology Nurse', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1582750433449-648ed127d09e?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Rohan Mehta', spec: 'Medical Coordinator', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Pooja Iyer', spec: 'Clinical Psychologist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1590611936760-eeb9bc598548?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Kiran Joshi', spec: 'Physiotherapist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1623854767648-e7bf80040f11?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Snehal Kulkarni', spec: 'Nutritionist', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Amit Bansal', spec: 'Patient Navigator', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Ritu Sharma', spec: 'Palliative Care Nurse', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1605684954998-685c79d6a018?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Manish Tiwari', spec: 'Lab Technician', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1537368910025-7028a609b13c?auto=format&fit=crop&q=80&w=300&h=400' },
];

export const volunteersData = [
  { name: 'Arjun Das', spec: 'Camp Organizer', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Divya Nair', spec: 'Awareness Speaker', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Rahul Chawla', spec: 'Field Coordinator', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Simran Kaur', spec: 'Social Media Lead', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Vikram Singh', spec: 'Rural Outreach', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Megha Gupta', spec: 'Patient Support', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Aditya Sen', spec: 'Logistics Head', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Sneha Roy', spec: 'Fundraising Coord', hosp: 'Community Hero', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300&h=400' },
];

export const leadershipData = [
  { name: 'Dr. Ramesh Sharma', spec: 'Founder & Chairman', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Sunita Menon', spec: 'Executive Director', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Karan Bhatia', spec: 'Head of Operations', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Nisha Verma', spec: 'Chief Medical Officer', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Deepak Raj', spec: 'Director of Outreach', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=400' },
  { name: 'Meena Iyer', spec: 'Head of Partnerships', hosp: 'Cancer Aware Bharat', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=400' },
];

// ────────────────────────────────────────────────────────
// REUSABLE CARD COMPONENT
// ────────────────────────────────────────────────────────

export const TeamCard = ({ member, delay }: { member: any; delay: number }) => (
  <RevealSection delay={delay}>
    <div className="group relative bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full border border-outline-variant/20 aspect-[9/16]">
      {/* Image Container */}
      <div className="relative h-[80%] w-full overflow-hidden rounded-t-[24px]">
        <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]" />
        
        {/* Social Icons (Slide in from right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
            <a key={idx} href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors shadow-md hover:scale-110" style={{ transitionDelay: `${100 + idx * 50}ms` }}>
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>

        {/* Yellow Circular Close Icon (Bottom Right of Image container) */}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg group-hover:rotate-[135deg] transition-transform duration-500 ease-in-out">
          <Plus className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Bottom Info */}
      <div className="h-[20%] p-4 flex flex-col justify-center items-center text-center">
        <h3 className="font-outfit text-primary text-[18px] sm:text-[20px] font-bold mb-1 leading-tight line-clamp-1">{member.name}</h3>
        <p className="text-secondary font-medium text-[13px] sm:text-[14px] mb-1 leading-tight line-clamp-1">{member.spec}</p>
        <p className="text-slate-500 text-[11px] sm:text-[12px] leading-tight line-clamp-1">{member.hosp}</p>
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
    <div className="bg-surface relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      {/* SECTION 1: MEDICAL ADVISORY BOARD */}
      <section className="py-16 md:py-24 relative z-10 border-b border-outline-variant/10">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">👨‍⚕️ Medical Experts</span>
              <h2 className="section-title text-3xl md:text-4xl">Meet Our <span className="text-secondary">Medical Advisory Board</span></h2>
              <p className="section-subtitle max-w-2xl mx-auto text-center">
                Our experienced oncologists, surgeons, physicians and cancer specialists guide Cancer Aware Bharat with clinical expertise, awareness initiatives and patient care.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
            {doctorsData.slice(0, 3).map((doc, i) => (
              <TeamCard key={i} member={doc} delay={i * 100} />
            ))}
          </div>

          <RevealSection delay={300}>
            <div className="flex justify-center">
              <button 
                onClick={() => navigate('/our-team')}
                className="bg-primary text-white text-[16px] font-semibold h-[52px] rounded-full px-10 flex items-center justify-center gap-2 hover:bg-secondary hover:text-slate-900 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group/btn"
              >
                View All Doctors <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

    </div>
  );
}
