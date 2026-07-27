import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { doctorsData, TeamCard } from './TeamShowcase';

export default function OurTeamDoctors() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      {/* ────────────────────────────────────────────────────────
          PREMIUM PAGE BANNER
          ──────────────────────────────────────────────────────── */}
      <section className="relative h-[350px] md:h-[450px] w-full flex items-center justify-center overflow-hidden">
        {/* Placeholder Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/events/event-1.jpeg)' }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-neutral-950/70" />

        <div className="relative z-10 text-center space-y-4 px-4">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-[13px] font-bold tracking-widest uppercase text-white/80">
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Our Team</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-lg tracking-tight">
            Meet Our <span className="text-slate-400">Expert Doctors</span>
          </h1>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          DOCTORS GRID
          ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctorsData.map((doc, i) => (
              <TeamCard key={i} member={doc} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
