import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Eye, Users, ShieldCheck, Heart, Award, Milestone, Calendar, ArrowRight, Quote } from 'lucide-react';

interface AboutTabProps {
  onOpenVolunteer: () => void;
}

export default function AboutTab({ onOpenVolunteer }: AboutTabProps) {
  const navigate = useNavigate();
  const [activeYear, setActiveYear] = useState('2026');

  const timelineData: Record<string, { title: string; desc: string; stat: string; image: string }> = {
    '2021': {
      title: 'Inception in New Delhi',
      desc: 'Founded by Dr. Ramesh Sharma after witnessing the severe lack of accessible diagnostic oncology channels for low-income families. Started with 1 mobile screening van.',
      stat: '500+ Patients Screened',
      image: '/events/event-1.jpeg'
    },
    '2023': {
      title: 'First Hospital Partnerships',
      desc: 'Formally integrated with Apex Oncology Institute. Launched our Patient Navigation pilot, assigning caseworkers to oversee therapy pipelines from biopsy to remission.',
      stat: '4,000+ Screenings • 2 Partner Clinics',
      image: '/events/event-2.jpeg'
    },
    '2025': {
      title: 'Expansion to Central & West India',
      desc: 'Welcomed CareWell Cancer Hospital and Narayana Health City. Formed a dedicated volunteer auxiliary corps to run rural tobacco awareness workshops.',
      stat: '10,000+ Screenings • 120 campaigns',
      image: '/events/event-4.jpeg'
    },
    '2026': {
      title: 'National Digital Portal launch',
      desc: 'Deploying our integrated digital directory, automated screening guidance tool, and live scheduling assistance to streamline volunteer allocation and patient requests.',
      stat: '14,250+ Lives Touched Nationwide',
      image: '/events/event-5.jpeg'
    }
  };

  return (
    <div className="space-y-14">
      {/* Page Title Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="section-badge mx-auto">Who We Are</span>
        <h1 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Restoring Dignity to <span className="text-gradient-primary">Oncology Support</span>
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Aware Bharat is a nationwide civil society network bridging the gap between cutting-edge clinical authority and localized human empathy.
        </p>
      </section>

      {/* Impact Photography Showcase Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { src: '/events/event-1.jpeg', alt: 'Screening Assembly', caption: 'Community Screening Assemblies' },
          { src: '/events/event-4.jpeg', alt: 'Mobile Diagnostic Units', caption: 'Mobile Diagnostic Mammography Fleet' },
          { src: '/events/event-5.jpeg', alt: 'Volunteer Training', caption: 'Grassroots Volunteer Advocate Corps' },
        ].map((img, i) => (
          <div key={i} className="h-56 sm:h-64 rounded-2xl overflow-hidden relative group card-premium !rounded-2xl">
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-5">
              <p className="text-xs font-bold text-white">{img.caption}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Vision & Mission bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Card */}
        <div className="gradient-primary text-white rounded-2xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-6 opacity-[0.07]">
            <Target className="w-40 h-40" />
          </div>
          <div className="relative space-y-4 z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-secondary-container" />
            </div>
            <h2 className="font-outfit text-2xl font-bold">Our Critical Mission</h2>
            <p className="text-white/85 leading-relaxed">
              To eliminate late-stage cancer diagnoses across India by organizing free community screening camps, educating families on key warning signs, and providing empathetic patient navigation from consultation to cure.
            </p>
          </div>
        </div>

        {/* Vision Card */}
        <div className="card-premium p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Eye className="w-40 h-40 text-primary" />
          </div>
          <div className="relative space-y-4 z-10">
            <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center justify-center text-primary">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="font-outfit text-primary text-2xl font-bold">Our Long-term Vision</h2>
            <p className="text-on-surface-variant leading-relaxed">
              An India where no cancer patient fights their diagnosis alone, where financial status is never a barrier to receiving clinical care, and where early detection is treated as a fundamental, accessible right for every citizen.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars of Purpose Grid */}
      <section className="space-y-6">
        <h2 className="font-outfit text-primary text-2xl font-extrabold text-center">The Core Pillars of Our Model</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Rigorous Partnerships', desc: 'We operate exclusively with vetted oncology clinical networks ensuring standard diagnostics.', icon: ShieldCheck, color: 'text-primary bg-primary/8' },
            { title: 'Grassroots Reach', desc: 'Mobilizing rural panchayats and local groups to hold on-site screening assemblies.', icon: Users, color: 'text-secondary bg-secondary/8' },
            { title: 'Dedicated Navigation', desc: 'Translating doctors prescriptions, schedules, and aid forms into regional languages.', icon: Heart, color: 'text-rose-500 bg-rose-50' },
            { title: 'Clinical Education', desc: 'Conducting simple workshops on self-exams, warning signs, and recovering nutrition.', icon: Award, color: 'text-secondary bg-slate-50' },
          ].map((pil, idx) => (
            <div key={idx} className="card-subtle p-5">
              <div className={`w-11 h-11 rounded-xl ${pil.color} flex items-center justify-center mb-3`}>
                <pil.icon className="w-5 h-5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-on-surface mb-1.5">{pil.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{pil.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Message from Founder */}
      <section className="card-premium !rounded-2xl p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-surface-container-highest">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGIjteBD0CWXW7KgteodS7d-DgD-XuVwGItAT-l6I7lGspLnQe-OTq-H8TXiUcjOWdbptTp4-nZIN7FAu9-zdREXhoNTAzOkPjMHZ8RnnYKIM7kYGlLYiE5KpSV4BkFXynSzHEJjwp7VVvMNDw1bDqE-ScPuLJY5TvnYNhOVGZI2eb7vDckiItLiy5vlfchPcRQaoc5WkD9Com-SwmLGUqW1QCP0PViJLWaPZEVivtluQAiRrMYOvypg"
                  alt="Dr. Ramesh Sharma"
                  className="w-full h-full object-cover scale-110 object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 gradient-primary text-white p-2.5 rounded-full shadow-md flex items-center justify-center">
                <Quote className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <p className="text-primary italic leading-relaxed text-base md:text-lg">
              "We often marvel at the leaps in clinical oncology—targeted immunotherapy, precision radiation, genomic profiling. Yet, none of these matter if a farm laborer in Bihar or a mother in Maharashtra does not identify a warning lump until it is too late. Aware Bharat is here to ensure clinical authority meets patients with deep human empathy, bridging that gap before it is too late."
            </p>
            <div>
              <p className="font-outfit text-base font-bold text-primary">Dr. Ramesh Sharma, MD</p>
              <p className="text-xs text-on-surface-variant font-medium">Founder & Chief Medical Advisor, Aware Bharat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Milestone timeline */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="section-badge mx-auto"><Milestone className="w-3 h-3" /> Timeline</span>
          <h2 className="font-outfit text-primary text-2xl font-extrabold">Our Interactive Journey</h2>
          <p className="text-sm text-on-surface-variant">Click on the milestones below to trace our expansion and impact.</p>
        </div>

        {/* Year Selector */}
        <div className="flex justify-center space-x-2 md:space-x-3">
          {['2021', '2023', '2025', '2026'].map(year => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                activeYear === year
                  ? 'gradient-primary text-white border-primary shadow-md scale-105'
                  : 'bg-white text-on-surface-variant border-outline-variant/30 hover:border-primary/30 hover:bg-primary/[0.02]'
              }`}
            >
              {year} {year === '2026' && '• Now'}
            </button>
          ))}
        </div>

        {/* Selected Year Display Card */}
        <div className="card-premium max-w-xl mx-auto p-5 flex flex-col items-center text-center space-y-4">
          <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100">
            <img src={timelineData[activeYear].image} alt={timelineData[activeYear].title} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/8 px-3.5 py-1.5 rounded-full">
            {timelineData[activeYear].stat}
          </span>
          <h3 className="font-outfit text-lg font-bold text-primary">{timelineData[activeYear].title}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {timelineData[activeYear].desc}
          </p>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="gradient-hero text-white rounded-2xl p-8 md:p-12 relative overflow-hidden text-center space-y-6">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 right-10 w-40 h-40 border border-white rounded-full" />
          <div className="absolute bottom-10 left-10 w-60 h-60 border border-white rounded-full" />
        </div>

        <div className="relative z-10">
          <h2 className="font-outfit text-2xl md:text-3xl font-extrabold max-w-xl mx-auto leading-tight">
            Help Us Bridge Clinical Authority & Empathy
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mt-3 leading-relaxed">
            Whether you are an experienced oncologist, a medical student, a passionate survivor, or a corporate partner—your service is needed.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={onOpenVolunteer}
              className="px-6 py-3 bg-white text-primary rounded-xl font-semibold text-sm hover:bg-white/90 transition-all shadow-lg cursor-pointer flex items-center gap-2 hover:translate-y-[-1px]"
            >
              Become a Volunteer <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/hospitals')}
              className="px-6 py-3 border border-white/25 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer"
            >
              Explore Hospital Partners
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
