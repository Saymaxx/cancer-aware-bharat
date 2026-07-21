import React, { useState } from 'react';
import { Target, Eye, Users, ShieldCheck, Heart, Award, Milestone, Calendar, ArrowRight, Quote } from 'lucide-react';

interface AboutTabProps {
  onOpenVolunteer: () => void;
  onPageChange: (page: string) => void;
}

export default function AboutTab({ onOpenVolunteer, onPageChange }: AboutTabProps) {
  const [activeYear, setActiveYear] = useState('2026');

  const timelineData: Record<string, { title: string; desc: string; stat: string }> = {
    '2021': {
      title: 'Inception in New Delhi',
      desc: 'Founded by Dr. Ramesh Sharma after witnessing the severe lack of accessible diagnostic oncology channels for low-income families. Started with 1 mobile screening van.',
      stat: '500+ Patients Screened'
    },
    '2023': {
      title: 'First Hospital Partnerships',
      desc: 'Formally integrated with Apex Oncology Institute. Launched our Patient Navigation pilot, assigning caseworkers to oversee therapy pipelines from biopsy to remission.',
      stat: '4,000+ Screenings • 2 Partner Clinics'
    },
    '2025': {
      title: 'Expansion to Central & West India',
      desc: 'Welcomed CareWell Cancer Hospital and Narayana Health City. Formed a dedicated volunteer auxiliary corps to run rural tobacco awareness workshops.',
      stat: '10,000+ Screenings • 120 campaigns'
    },
    '2026': {
      title: 'National Digital Portal launch',
      desc: 'Deploying our integrated digital directory, automated screening guidance tool, and live scheduling assistance to streamline volunteer allocation and patient requests.',
      stat: '14,250+ Lives Touched Nationwide'
    }
  };

  return (
    <div className="space-y-12">
      {/* Page Title Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold uppercase tracking-wider">
          Who We Are
        </span>
        <h1 className="font-display-lg text-primary text-3xl md:text-5xl font-black">
          Restoring Dignity to Oncology Support
        </h1>
        <p className="font-body-lg text-on-surface-variant">
          Aware Bharat is a nationwide civil society network bridging the gap between cutting-edge clinical authority and localized human empathy.
        </p>
      </section>

      {/* Vision & Mission bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Card */}
        <div className="bg-primary text-white rounded-3xl p-8 relative overflow-hidden border border-primary-container shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Target className="w-40 h-40" />
          </div>
          <div className="relative space-y-4 z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-secondary-container">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="font-headline-lg text-2xl font-bold">Our Critical Mission</h2>
            <p className="font-body-md text-white/90 leading-relaxed">
              To eliminate late-stage cancer diagnoses across India by organizing free community screening camps, educating families on key warning signs, and providing empathetic patient navigation from consultation to cure.
            </p>
          </div>
        </div>

        {/* Vision Card */}
        <div className="bg-white rounded-3xl p-8 border border-outline-variant/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Eye className="w-40 h-40 text-primary" />
          </div>
          <div className="relative space-y-4 z-10">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="font-headline-lg text-primary text-2xl font-bold">Our Long-term Vision</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              An India where no cancer patient fights their diagnosis alone, where financial status is never a barrier to receiving clinical care, and where early detection is treated as a fundamental, accessible right for every citizen.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars of Purpose Grid */}
      <section className="space-y-6">
        <h2 className="font-headline-lg text-primary text-2xl font-extrabold text-center">The Core Pillars of Our Model</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: 'Rigorous Partnerships',
              desc: 'We operate exclusively with vetted oncology clinical networks ensuring standard diagnostics.',
              icon: <ShieldCheck className="w-5 h-5 text-primary" />
            },
            {
              title: 'Grassroots Reach',
              desc: 'Mobilizing rural panchayats and local groups to hold on-site screening assemblies.',
              icon: <Users className="w-5 h-5 text-secondary" />
            },
            {
              title: 'Dedicated Navigation',
              desc: 'Translating doctors prescriptions, schedules, and aid forms into regional languages.',
              icon: <Heart className="w-5 h-5 text-red-500" />
            },
            {
              title: 'Clinical Education',
              desc: 'Conducting simple workshops on self-exams, warning signs, and recovering nutrition.',
              icon: <Award className="w-5 h-5 text-amber-500" />
            }
          ].map((pil, idx) => (
            <div key={idx} className="bg-white border border-outline-variant/30 rounded-2xl p-5 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center mb-3">
                {pil.icon}
              </div>
              <h3 className="font-label-sm text-sm font-bold text-primary mb-1">{pil.title}</h3>
              <p className="font-caption text-xs text-on-surface-variant leading-relaxed">{pil.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Message from Founder */}
      <section className="bg-surface-container-low rounded-3xl p-6 md:p-10 border border-outline-variant/40">
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
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-full shadow-md flex items-center justify-center">
                <Quote className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <p className="font-body-lg text-primary italic leading-relaxed">
              "We often marvel at the leaps in clinical oncology—targeted immunotherapy, precision radiation, genomic profiling. Yet, none of these matter if a farm laborer in Bihar or a mother in Maharashtra does not identify a warning lump until it is too late. Aware Bharat is here to ensure clinical authority meets patients with deep human empathy, bridging that gap before it is too late."
            </p>
            <div>
              <p className="font-title-md text-base font-bold text-primary">Dr. Ramesh Sharma, MD</p>
              <p className="font-caption text-xs text-on-surface-variant font-medium">Founder & Chief Medical Advisor, Aware Bharat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Milestone timeline */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-headline-lg text-primary text-2xl font-extrabold flex items-center justify-center gap-2">
            <Milestone className="w-5 h-5 text-secondary" /> Our Interactive Journey
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant">Click on the milestones below to trace our expansion and impact.</p>
        </div>

        {/* Year Selector */}
        <div className="flex justify-center space-x-2 md:space-x-4">
          {['2021', '2023', '2025', '2026'].map(year => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                activeYear === year 
                  ? 'bg-primary text-white border-primary shadow-sm scale-105' 
                  : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              {year} {year === '2026' && '• Now'}
            </button>
          ))}
        </div>

        {/* Selected Year Display Card */}
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm max-w-xl mx-auto flex flex-col items-center text-center space-y-4 transition-all duration-300">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/50 px-3 py-1 rounded-full">
            {timelineData[activeYear].stat}
          </span>
          <h3 className="font-headline-lg text-lg font-bold text-primary">{timelineData[activeYear].title}</h3>
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            {timelineData[activeYear].desc}
          </p>
        </div>
      </section>

      {/* Call to Action Bento banner */}
      <section className="bg-primary text-white rounded-3xl p-8 md:p-12 relative overflow-hidden border border-primary-container text-center space-y-6">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary-container/40 via-transparent to-transparent pointer-events-none" />
        
        <h2 className="font-headline-lg text-2xl md:text-3xl font-black max-w-xl mx-auto">
          Help Us Bridge Clinical Authority & Empathy
        </h2>
        <p className="font-body-lg text-white/80 max-w-xl mx-auto">
          Whether you are an experienced oncologist, a medical student, a passionate survivor, or a corporate partner—your service is needed.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={onOpenVolunteer}
            className="px-6 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-surface-container-low transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            Become a Volunteer <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange('hospitals')}
            className="px-6 py-3 border border-white/40 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-colors cursor-pointer"
          >
            Explore Hospital Partners
          </button>
        </div>
      </section>
    </div>
  );
}
