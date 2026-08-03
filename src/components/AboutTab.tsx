import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Target, Eye, Users, ShieldCheck, Heart, Award, Milestone, Calendar, ArrowRight, Quote } from 'lucide-react';
import PremiumSection from './common/PremiumSection';

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
    <>
      <PremiumSection variant="warm-1" withTopDivider="none" withBottomDivider="torn">
        <div className="space-y-14">
          {/* Page Title Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="section-badge mx-auto">Who We Are</span>
            <h1 className="font-outfit text-primary text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Restoring Dignity to <span className="text-secondary">Oncology Support</span>
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Aware Bharat is a nationwide civil society network bridging the gap between cutting-edge clinical authority and localized human empathy.
            </p>
          </div>

          {/* Impact Photography Showcase Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { src: '/events/event-1.jpeg', alt: 'Screening Assembly', caption: 'Community Screening Assemblies' },
              { src: '/events/event-4.jpeg', alt: 'Mobile Diagnostic Units', caption: 'Mobile Diagnostic Mammography Fleet' },
              { src: '/events/event-5.jpeg', alt: 'Volunteer Training', caption: 'Grassroots Volunteer Advocate Corps' },
            ].map((img, i) => (
              <div key={i} className="h-56 sm:h-72 img-premium group">
                <img src={img.src} alt={img.alt} className="img-premium-inner" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                  <p className="text-sm font-bold text-white">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PremiumSection>

      <PremiumSection variant="warm-2" withIcons={false}>
        <div className="space-y-16">
          {/* Vision & Mission bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="gradient-primary text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 right-0 p-6 opacity-[0.07]">
                <Target className="w-48 h-48" />
              </div>
              <div className="relative space-y-6 z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-secondary-container" />
                </div>
                <h2 className="font-outfit text-3xl font-bold">Our Critical Mission</h2>
                <p className="text-white/85 leading-relaxed text-lg">
                  To eliminate late-stage cancer diagnoses across India by organizing free community screening camps, educating families on key warning signs, and providing empathetic patient navigation from consultation to cure.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="card-premium p-10 relative">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Eye className="w-48 h-48 text-primary" />
              </div>
              <div className="relative space-y-6 z-10">
                <div className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center text-primary">
                  <Eye className="w-8 h-8" />
                </div>
                <h2 className="font-outfit text-primary text-3xl font-bold">Our Long-term Vision</h2>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  An India where no cancer patient fights their diagnosis alone, where financial status is never a barrier to receiving clinical care, and where early detection is treated as a fundamental, accessible right for every citizen.
                </p>
              </div>
            </div>
          </div>

          {/* Pillars of Purpose Grid */}
          <div className="space-y-10">
            <h2 className="font-outfit text-primary text-3xl font-extrabold text-center">The Core Pillars of Our Model</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Rigorous Partnerships', desc: 'We operate exclusively with vetted oncology clinical networks ensuring standard diagnostics.', icon: ShieldCheck, color: 'text-primary bg-primary/8' },
                { title: 'Grassroots Reach', desc: 'Mobilizing rural panchayats and local groups to hold on-site screening assemblies.', icon: Users, color: 'text-secondary bg-secondary/8' },
                { title: 'Dedicated Navigation', desc: 'Translating doctors prescriptions, schedules, and aid forms into regional languages.', icon: Heart, color: 'text-rose-500 bg-rose-50' },
                { title: 'Clinical Education', desc: 'Conducting simple workshops on self-exams, warning signs, and recovering nutrition.', icon: Award, color: 'text-secondary bg-slate-50' },
              ].map((pil, idx) => (
                <div key={idx} className="card-premium p-8">
                  <div className={`w-14 h-14 rounded-2xl ${pil.color} flex items-center justify-center mb-5`}>
                    <pil.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-lg font-bold text-on-surface mb-2">{pil.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{pil.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumSection>

      <PremiumSection variant="warm-3" withTopDivider="wave" withBottomDivider="torn">
        <div className="space-y-20">
          {/* Message from Founder */}
          <div className="card-premium p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="relative">
                  <div className="w-56 h-56 rounded-[2rem] overflow-hidden border-[6px] border-white shadow-2xl bg-surface-container-highest">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGIjteBD0CWXW7KgteodS7d-DgD-XuVwGItAT-l6I7lGspLnQe-OTq-H8TXiUcjOWdbptTp4-nZIN7FAu9-zdREXhoNTAzOkPjMHZ8RnnYKIM7kYGlLYiE5KpSV4BkFXynSzHEJjwp7VVvMNDw1bDqE-ScPuLJY5TvnYNhOVGZI2eb7vDckiItLiy5vlfchPcRQaoc5WkD9Com-SwmLGUqW1QCP0PViJLWaPZEVivtluQAiRrMYOvypg"
                      alt="Dr. Ramesh Sharma"
                      className="w-full h-full object-cover scale-110 object-top transition-transform duration-700 hover:scale-125"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 gradient-primary text-white p-4 rounded-full shadow-xl flex items-center justify-center">
                    <Quote className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-6">
                <p className="text-primary italic leading-relaxed text-lg md:text-xl font-medium">
                  "We often marvel at the leaps in clinical oncology—targeted immunotherapy, precision radiation, genomic profiling. Yet, none of these matter if a farm laborer in Bihar or a mother in Maharashtra does not identify a warning lump until it is too late. Aware Bharat is here to ensure clinical authority meets patients with deep human empathy, bridging that gap before it is too late."
                </p>
                <div>
                  <p className="font-outfit text-lg font-bold text-primary">Dr. Ramesh Sharma, MD</p>
                  <p className="text-sm text-on-surface-variant font-medium">Founder & Chief Medical Advisor, Aware Bharat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Milestone timeline */}
          <div className="space-y-10">
            <div className="text-center space-y-4">
              <span className="section-badge mx-auto"><Milestone className="w-3 h-3" /> Timeline</span>
              <h2 className="font-outfit text-primary text-3xl md:text-4xl font-extrabold">Our Interactive Journey</h2>
              <p className="text-base md:text-lg text-on-surface-variant">Click on the milestones below to trace our expansion and impact.</p>
            </div>

            {/* Year Selector */}
            <div className="flex justify-center flex-wrap gap-3">
              {['2021', '2023', '2025', '2026'].map(year => (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={`px-6 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 cursor-pointer ${
                    activeYear === year
                      ? 'btn-primary shadow-xl scale-110'
                      : 'bg-white text-on-surface-variant border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/[0.04]'
                  }`}
                >
                  {year} {year === '2026' && '• Now'}
                </button>
              ))}
            </div>

            {/* Selected Year Display Card */}
            <div className="card-premium max-w-2xl mx-auto p-8 flex flex-col items-center text-center space-y-6">
              <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-100 img-premium">
                <img src={timelineData[activeYear].image} alt={timelineData[activeYear].title} className="img-premium-inner" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-5 py-2 rounded-full border border-secondary/20">
                {timelineData[activeYear].stat}
              </span>
              <h3 className="font-outfit text-2xl font-bold text-primary">{timelineData[activeYear].title}</h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                {timelineData[activeYear].desc}
              </p>
            </div>
          </div>
        </div>
      </PremiumSection>

      <PremiumSection variant="warm-1">
        {/* Call to Action Banner */}
        <div className="gradient-primary text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-center space-y-8 shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 border-[3px] border-white rounded-full animate-pulse" />
            <div className="absolute bottom-10 left-10 w-96 h-96 border-[3px] border-white rounded-full animate-pulse delay-700" />
          </div>

          <div className="relative z-10">
            <h2 className="font-outfit text-3xl md:text-5xl font-extrabold max-w-2xl mx-auto leading-tight mb-6">
              Help Us Bridge Clinical Authority & Empathy
            </h2>
            <p className="text-white/80 max-w-xl mx-auto leading-relaxed text-lg mb-10">
              Whether you are an experienced oncologist, a medical student, a passionate survivor, or a corporate partner—your service is needed.
            </p>

            <div className="flex flex-wrap justify-center gap-5">
              <button
                onClick={onOpenVolunteer}
                className="btn-secondary !bg-white !text-primary !border-white hover:!bg-white/90"
              >
                Become a Volunteer <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/hospitals')}
                className="btn-secondary !bg-transparent !text-white !border-white/40 hover:!bg-white/10"
              >
                Explore Hospital Partners
              </button>
            </div>
          </div>
        </div>
      </PremiumSection>
    </>
  );
}
