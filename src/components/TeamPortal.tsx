import React, { useEffect, useState } from 'react';
import { 
  ChevronRight, Users, Stethoscope, HeartHandshake, Shield, Building2, Menu, X
} from 'lucide-react';
import { 
  doctorsData, healthcareData, volunteersData, leadershipData, TeamCard 
} from './TeamShowcase';

// ────────────────────────────────────────────────────────
// DUMMY DATA FOR HOSPITALS
// ────────────────────────────────────────────────────────
const partnerHospitalsData = [
  { name: 'Tata Memorial Hospital', spec: 'Comprehensive Cancer Center', hosp: 'Mumbai, Maharashtra', img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'AIIMS New Delhi', spec: 'Advanced Oncology Wing', hosp: 'New Delhi', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Apollo Proton Center', spec: 'Proton Therapy Specialist', hosp: 'Chennai, Tamil Nadu', img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=400&h=500' },
  { name: 'Rajiv Gandhi Cancer Institute', spec: 'Research & Treatment', hosp: 'Delhi', img: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=400&h=500' },
];

const TABS = [
  { id: 'doctors', label: 'Medical Advisory Board', icon: Stethoscope, data: doctorsData, badge: '👨‍⚕️' },
  { id: 'healthcare', label: 'Healthcare Professionals', icon: Users, data: healthcareData, badge: '👩‍⚕️' },
  { id: 'volunteers', label: 'Core Volunteers', icon: HeartHandshake, data: volunteersData, badge: '🤝' },
  { id: 'leadership', label: 'Leadership Team', icon: Shield, data: leadershipData, badge: '🏛️' },
  { id: 'hospitals', label: 'Partner Hospitals', icon: Building2, data: partnerHospitalsData, badge: '🏥' },
];

export default function TeamPortal() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [displayTab, setDisplayTab] = useState(TABS[0].id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (newTabId: string) => {
    if (newTabId === activeTab) return;
    
    // Smooth fade transition
    setFadeState('out');
    setActiveTab(newTabId);
    
    setTimeout(() => {
      setDisplayTab(newTabId);
      setFadeState('in');
    }, 300); // 300ms transition

    // Close mobile sidebar
    setIsSidebarOpen(false);
  };

  const currentTab = TABS.find(t => t.id === displayTab) || TABS[0];

  return (
    <div className="bg-surface min-h-screen pb-20">
      
      {/* ────────────────────────────────────────────────────────
          PREMIUM PAGE BANNER
          ──────────────────────────────────────────────────────── */}
      <section className="relative h-[250px] md:h-[350px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-primary/90"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 text-center space-y-4 px-4">
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-[13px] font-bold tracking-widest uppercase text-white/80">
            <span className="cursor-default">Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-secondary" />
            <span className="text-secondary">Our Team</span>
          </div>
          <h1 className="font-outfit text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight">
            Meet Our <span className="text-secondary">Team</span>
          </h1>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          PORTAL LAYOUT
          ──────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* MOBILE SIDEBAR TOGGLE */}
          <div className="lg:hidden w-full flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <span className="text-xl">{currentTab.badge}</span>
              {currentTab.label}
            </span>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-primary/10 text-primary rounded-xl">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* LEFT SIDEBAR */}
          <aside 
            className={`
              lg:sticky lg:top-24 w-full lg:w-[280px] shrink-0 bg-white rounded-3xl p-4 lg:p-6 shadow-sm border border-outline-variant/20 transition-all duration-300
              ${isSidebarOpen ? 'block' : 'hidden lg:block'}
            `}
          >
            <h3 className="font-bold text-slate-400 text-xs tracking-widest uppercase mb-6 ml-2">Team Categories</h3>
            <nav className="space-y-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left font-semibold transition-all duration-300
                      ${isActive 
                        ? 'bg-primary text-white shadow-md scale-[1.02]' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary hover:scale-[1.01]'}
                    `}
                  >
                    <span className="text-[18px]">{tab.badge}</span>
                    <span className="flex-1">{tab.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main className="flex-1 w-full min-h-[500px]">
            <div 
              className={`transition-opacity duration-300 ease-in-out ${fadeState === 'in' ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-outfit flex items-center gap-3">
                  <span className="text-3xl">{currentTab.badge}</span>
                  {currentTab.label}
                </h2>
                <div className="w-12 h-1.5 bg-secondary rounded-full mt-4"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {currentTab.data.map((member, i) => (
                  <TeamCard key={i} member={member} delay={i * 50} />
                ))}
              </div>

              {currentTab.data.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-outline-variant/20">
                  <p className="text-slate-500 font-medium">No members found in this category.</p>
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
