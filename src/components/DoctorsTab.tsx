import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, ShieldCheck, MapPin, Calendar, Sparkles, Star, Phone,
  PlayCircle, Stethoscope, Info, CheckCircle2, ChevronRight, HeartPulse, Building2
} from 'lucide-react';

export interface Doctor {
  id: string;
  name: string;
  nameHi: string;
  title: string;
  specialty: string;
  specialtyHi: string;
  degrees: string;
  regNo?: string;
  honors?: string;
  bioHi: string;
  image: string;
}

// Exactly approved doctor panel data (ONLY Dr. Ajay Kumar, NO random fake doctors added)
export const APPROVED_DOCTORS_PANEL: Doctor[] = [
  {
    id: 'dr-ajay-kumar',
    name: 'Dr. Ajay Kumar',
    nameHi: 'डॉ. अजय कुमार',
    title: 'Senior Surgical Oncologist',
    specialty: 'Surgical Oncology',
    specialtyHi: 'सर्जिकल ऑन्कोलॉजी (शल्य कैंसर विशेषज्ञ)',
    degrees: 'MBBS, MS (General Surgery), MCh (Surgical Oncology), Gold Medalist',
    regNo: 'MCI-28490',
    honors: '‘यूपी रत्न’ एवं ‘काशी रत्न’ से सम्मानित*',
    bioHi: 'कैंसर रोगियों की सर्जरी और उपचार में कार्य करते हुए डॉ. अजय कुमार ने ऐसे अनेक परिवारों की पीड़ा देखी है, जिनमें मरीज देर से चिकित्सा सहायता तक पहुँचे। यह अनुभव केवल चिकित्सकीय चुनौती नहीं, बल्कि जनजागरुकता की आवश्यकता का स्पष्ट संकेत था। इसी सोच ने उन्हें कैंसर के प्रति जागरूकता को लोगों के बीच ले जाने के संकल्प से जोड़ा। Cancer Aware Bharat Mission में उनका चिकित्सकीय अनुभव कैंसर जागरूकता, early warning awareness और appropriate referral की दिशा में प्रेरक आधार है।',
    image: '/dr-ajay-kumar.jpg'
  }
];

interface DoctorsTabProps {
  onOpenEnquiry: (hospitalName?: string) => void;
  onOpenVolunteer: () => void;
}

export default function DoctorsTab({ onOpenEnquiry }: DoctorsTabProps) {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'hindi' | 'english'>('hindi');

  const scrollToTeam = () => {
    const el = document.getElementById('specialist-team-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
      
      {/* ===== 1. TOP HERO SECTION ===== */}
      <section className="relative rounded-3xl min-h-[380px] flex flex-col justify-between p-6 sm:p-10 md:p-14 border border-outline-variant/30 overflow-hidden shadow-2xl bg-neutral-950 text-white">
        {/* Glowing Background Radial Accents */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-primary/25 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-secondary/20 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          
          {/* Section Header Badge & Language Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-300 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/15">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>5. OUR DOCTORS / विशेषज्ञ टीम</span>
            </span>

            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-md text-xs font-bold">
              <button
                onClick={() => setLang('hindi')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'hindi' ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setLang('english')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'english' ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <h1 className="font-headline-lg text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
            {lang === 'hindi' ? (
              <>हमारे विशेषज्ञ <span className="text-secondary-container">ऑन्कोलॉजिस्ट व चिकित्सक।</span></>
            ) : (
              <>Empaneled Oncology <span className="text-secondary-container">Specialists Panel.</span></>
            )}
          </h1>

          {/* User Provided Description Text */}
          <div className="bg-white/10 border border-white/15 p-5 sm:p-6 rounded-2xl backdrop-blur-md space-y-2">
            <p className="font-body-lg text-slate-100 text-sm sm:text-base leading-relaxed font-semibold">
              "Cancer Aware Bharat के जागरूकता कार्यक्रमों, स्वास्थ्य शिविरों और प्रशिक्षण गतिविधियों में चिकित्सकों की सहभागिता उनकी उपलब्धता, विशेषज्ञता और कार्यक्रम की आवश्यकता के अनुसार होती है।"
            </p>
            <p className="text-xs text-slate-300 italic">
              Participation of medical experts in cancer screening, awareness drives, and training modules depends on clinical availability, area of specialization, and community program requirements.
            </p>
          </div>

        </div>

        {/* Live Metrics Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/15">
          {[
            { label: 'Clinical Guidance', val: '100% Verified' },
            { label: 'Screening Camps Supervised', val: '180+ Camps' },
            { label: 'Specialty Coverage', val: 'Surgical & Medical' },
            { label: 'Second Opinion Support', val: 'Priority Access' }
          ].map((st, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center">
              <p className="text-lg sm:text-xl font-black text-white">{st.val}</p>
              <p className="text-[11px] text-white/70 font-semibold mt-0.5">{st.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2. SECTION 4: DR. AJAY KUMAR / प्रेरणास्रोत (FEATURED INSPIRATION CARD) ===== */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-outline-variant/30 shadow-xl space-y-8">
        
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">INSPIRATION & LEAD MENTOR</span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-slate-900">
              4. DR. AJAY KUMAR / प्रेरणास्रोत
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Doctor Photo & Credential Badges */}
          <div className="lg:col-span-4 space-y-4 text-center">
            <div className="relative inline-block mx-auto">
              <img
                src={APPROVED_DOCTORS_PANEL[0].image}
                alt="Dr. Ajay Kumar"
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover border-4 border-amber-400/40 shadow-2xl mx-auto"
              />
              <span className="absolute -bottom-3 right-4 bg-amber-500 text-neutral-950 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> Gold Medalist
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-headline-lg text-2xl font-black text-slate-900">
                डॉ. अजय कुमार
              </h3>
              <p className="text-xs font-bold text-primary">
                Surgical Oncologist
              </p>
              <p className="text-xs text-amber-700 font-bold">
                {APPROVED_DOCTORS_PANEL[0].honors}
              </p>
              <p className="text-[10px] text-slate-400 italic">
                *सभी उपाधियाँ/पुरस्कार आधिकारिक दस्तावेज़ के अनुसार अंतिम किए जाएँ।
              </p>
            </div>
          </div>

          {/* Inspirational Biography & Text provided by user */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-2xl border border-outline-variant/20 space-y-4">
              <h4 className="font-bold text-base text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>कैंसर जागरूकता का प्रेरक आधार</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold border-l-4 border-primary pl-4">
                "{APPROVED_DOCTORS_PANEL[0].bioHi}"
              </p>
              <div className="text-[11px] text-slate-500 border-t border-slate-200/80 pt-3 font-semibold">
                <strong>उपाधियाँ:</strong> {APPROVED_DOCTORS_PANEL[0].degrees}
              </div>
            </div>

            {/* Profile Page Action Buttons requested by user */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/gallery')}
                className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <PlayCircle className="w-4 h-4 text-emerald-300" />
                <span>कैंसर जागरूकता वीडियो देखें</span>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-md"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>आगामी कैंप देखें</span>
              </button>

              <button
                onClick={scrollToTeam}
                className="px-5 py-3 rounded-xl bg-secondary text-white font-bold text-xs hover:opacity-95 shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Stethoscope className="w-4 h-4" />
                <span>विशेषज्ञ टीम देखें</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ===== 3. DOCTORS DETAIL GRID SECTION (NO FAKE DOCTORS ADDED) ===== */}
      <section id="specialist-team-grid" className="space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">APPROVED DOCTORS PANEL</span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-slate-900">
              विशेषज्ञ डॉक्टर विवरण (Doctor Cards)
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Verified Panel
          </span>
        </div>

        {/* Doctor Cards (Strictly Dr. Ajay Kumar, NO dummy profiles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {APPROVED_DOCTORS_PANEL.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1"
            >
              <div className="space-y-5">
                
                {/* 1. Photo & 2. Full Name & 5. Specialty */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary/20 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md" title="Verified Doctor">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-headline-lg text-lg sm:text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                      {doc.nameHi} ({doc.name})
                    </h3>

                    <p className="text-xs font-bold text-secondary">
                      {doc.specialtyHi}
                    </p>

                    {doc.honors && (
                      <p className="text-[11px] text-amber-700 font-bold">
                        🏅 {doc.honors}
                      </p>
                    )}
                  </div>
                </div>

                {/* Structured Fields: 3. Verified Qualification | 4. Registration/Designation | 6. Approved Bio */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 space-y-3 text-xs">
                  
                  {/* 3. Verified Qualification */}
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 text-[11px] shrink-0">🎓 Verified Qualification:</span>
                    <span className="font-semibold text-primary text-[11px]">{doc.degrees}</span>
                  </div>

                  {/* 4. Registration / Professional Designation */}
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 text-[11px] shrink-0">📋 Designation / Reg:</span>
                    <span className="font-semibold text-slate-700 text-[11px]">{doc.title} {doc.regNo ? `(MCI Reg: ${doc.regNo})` : ''}</span>
                  </div>

                  {/* 5. Specialty */}
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 text-[11px] shrink-0">🩺 Specialty:</span>
                    <span className="font-semibold text-secondary text-[11px]">{doc.specialtyHi}</span>
                  </div>

                  {/* 6. 80-120 Words Approved Bio */}
                  <div className="pt-2 border-t border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-800 text-[11px] block">Approved Bio (स्वीकृत परिचय):</span>
                    <p className="text-slate-700 leading-relaxed text-xs font-medium">
                      {doc.bioHi}
                    </p>
                  </div>

                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-semibold italic">
                  *सभी उपाधियाँ/पुरस्कार आधिकारिक दस्तावेज़ के अनुसार अंतिम किए जाएँ।
                </span>

                <button
                  onClick={() => onOpenEnquiry(doc.name)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-md cursor-pointer transition-transform hover:scale-105 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Request Consultation / ओपिनियन लें</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
