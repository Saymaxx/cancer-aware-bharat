import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Award, ShieldCheck, Calendar, Sparkles, Star, Phone,
  PlayCircle, Stethoscope, UserPlus
} from 'lucide-react';
import PremiumSection from './common/PremiumSection';

export interface Doctor {
  id: string;
  name: string;
  nameHi: string;
  title: string;
  titleHi?: string;
  specialty: string;
  specialtyHi: string;
  degrees: string;
  degreesHi?: string;
  regNo?: string;
  honors?: string;
  honorsEn?: string;
  bioHi: string;
  bioEn?: string;
  image: string;
}

// Exactly approved doctor panel data (ONLY Dr. Ajay Kumar, NO random fake doctors added)
export const APPROVED_DOCTORS_PANEL: Doctor[] = [
  {
    id: 'dr-ajay-kumar',
    name: 'Dr. Ajay Kumar',
    nameHi: 'डॉ. अजय कुमार',
    title: 'Senior Surgical Oncologist',
    titleHi: 'वरिष्ठ सर्जिकल ऑन्कोलॉजिस्ट',
    specialty: 'Surgical Oncology',
    specialtyHi: 'सर्जिकल ऑन्कोलॉजी (शल्य कैंसर विशेषज्ञ)',
    degrees: 'MBBS, MS (General Surgery), MCh (Surgical Oncology), Gold Medalist',
    degreesHi: 'एमबीबीएस, एमएस (जनरल सर्जरी), एमसीएच (सर्जिकल ऑन्कोलॉजी), स्वर्ण पदक विजेता',
    regNo: 'MCI-28490',
    honors: '‘यूपी रत्न’ एवं ‘काशी रत्न’ से सम्मानित*',
    honorsEn: "Honored with 'UP Ratna' & 'Kashi Ratna'*",
    bioHi: 'कैंसर रोगियों की सर्जरी और उपचार में कार्य करते हुए डॉ. अजय कुमार ने ऐसे अनेक परिवारों की पीड़ा देखी है, जिनमें मरीज देर से चिकित्सा सहायता तक पहुँचे। यह अनुभव केवल चिकित्सकीय चुनौती नहीं, बल्कि जनजागरुकता की आवश्यकता का स्पष्ट संकेत था। इसी सोच ने उन्हें कैंसर के प्रति जागरूकता को लोगों के बीच ले जाने के संकल्प से जोड़ा। Cancer Aware Bharat Mission में उनका चिकित्सकीय अनुभव कैंसर जागरूकता, early warning awareness और appropriate referral की दिशा में प्रेरक आधार है।',
    bioEn: 'Through years of performing oncology surgeries and treating cancer patients, Dr. Ajay Kumar witnessed the suffering of numerous families where patients reached medical help at an advanced stage. This experience was not merely a clinical challenge, but a clear call for community awareness. This realization inspired his commitment to bring cancer awareness directly to the public. His clinical expertise serves as an inspiring pillar for early warning awareness, screening, and appropriate referrals in the Cancer Aware Bharat Mission.',
    image: '/dr-ajay-kumar.jpg'
  }
];

interface DoctorsTabProps {
  onOpenEnquiry: (hospitalName?: string) => void;
  onOpenVolunteer: () => void;
}

export default function DoctorsTab({ onOpenEnquiry, onOpenVolunteer }: DoctorsTabProps) {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'hindi' | 'english'>('hindi');

  const scrollToTeam = () => {
    const el = document.getElementById('specialist-team-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const isHindi = lang === 'hindi';

  return (
    <>
      <PremiumSection variant="warm-1">
        <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
      
      {/* ===== 1. TOP HERO SECTION ===== */}
      <section className="relative rounded-3xl min-h-[380px] flex flex-col justify-between p-6 sm:p-10 md:p-14 border border-outline-variant/30 overflow-hidden shadow-2xl bg-neutral-950 text-white">
        {/* Glowing Background Radial Accents */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-primary/25 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-secondary/20 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          
          {/* Section Header Badge & Language Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-slate-300 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/15">
              <Stethoscope className="w-4 h-4 text-slate-400" />
              <span>{isHindi ? '5. हमारे विशेषज्ञ / OUR DOCTORS' : '5. OUR DOCTORS / विशेषज्ञ टीम'}</span>
            </span>

            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-md text-xs font-bold">
              <button
                onClick={() => setLang('hindi')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  isHindi ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setLang('english')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  !isHindi ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <h1 className="font-headline-lg text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
            {isHindi ? (
              <>हमारे विशेषज्ञ <span className="text-secondary-container">ऑन्कोलॉजिस्ट व चिकित्सक।</span></>
            ) : (
              <>Empaneled Oncology <span className="text-secondary-container">Specialists Panel.</span></>
            )}
          </h1>

          {/* User Provided Description Text */}
          <div className="bg-white/10 border border-white/15 p-5 sm:p-6 rounded-2xl backdrop-blur-md space-y-2">
            <p className="font-body-lg text-slate-100 text-sm sm:text-base leading-relaxed font-semibold">
              {isHindi
                ? '"Cancer Aware Bharat के जागरूकता कार्यक्रमों, स्वास्थ्य शिविरों और प्रशिक्षण गतिविधियों में चिकित्सकों की सहभागिता उनकी उपलब्धता, विशेषज्ञता और कार्यक्रम की आवश्यकता के अनुसार होती है।"'
                : '"Participation of medical experts in cancer screening, awareness drives, and training modules depends on clinical availability, area of specialization, and community program requirements."'
              }
            </p>
            <p className="text-xs text-slate-300 italic">
              {isHindi
                ? 'Participation of medical experts in cancer screening, awareness drives, and training modules depends on clinical availability, area of specialization, and community program requirements.'
                : 'Cancer Aware Bharat के जागरूकता कार्यक्रमों, स्वास्थ्य शिविरों और प्रशिक्षण गतिविधियों में चिकित्सकों की सहभागिता उनकी उपलब्धता, विशेषज्ञता और कार्यक्रम की आवश्यकता के अनुसार होती है।'
              }
            </p>
          </div>

        </div>

        {/* Live Metrics Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/15">
          {[
            { label: isHindi ? 'नैदानिक मार्गदर्शन' : 'Clinical Guidance', val: '100% Verified' },
            { label: isHindi ? 'निरीक्षित शिविर' : 'Screening Camps Supervised', val: '180+ Camps' },
            { label: isHindi ? 'विशेषज्ञता कवरेज' : 'Specialty Coverage', val: 'Surgical & Medical' },
            { label: isHindi ? 'द्वितीय राय सहायता' : 'Second Opinion Support', val: 'Priority Access' }
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
          <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              {isHindi ? 'प्रेरणास्रोत एवं मुख्य मार्गदर्शक' : 'INSPIRATION & LEAD MENTOR'}
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-slate-900">
              {isHindi ? '4. डॉ. अजय कुमार / प्रेरणास्रोत' : '4. DR. AJAY KUMAR / Inspiration & Lead Mentor'}
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
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover border-4 border-slate-400/40 shadow-2xl mx-auto"
              />
              <span className="absolute -bottom-3 right-4 bg-secondary text-neutral-950 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> Gold Medalist
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-headline-lg text-2xl font-black text-slate-900">
                {isHindi ? APPROVED_DOCTORS_PANEL[0].nameHi : APPROVED_DOCTORS_PANEL[0].name}
              </h3>
              <p className="text-xs font-bold text-primary">
                {isHindi ? APPROVED_DOCTORS_PANEL[0].titleHi : APPROVED_DOCTORS_PANEL[0].title}
              </p>
              <p className="text-xs text-slate-700 font-bold">
                {isHindi ? APPROVED_DOCTORS_PANEL[0].honors : APPROVED_DOCTORS_PANEL[0].honorsEn}
              </p>
              <p className="text-[10px] text-slate-400 italic">
                {isHindi
                  ? '*सभी उपाधियाँ/पुरस्कार आधिकारिक दस्तावेज़ के अनुसार अंतिम किए जाएँ।'
                  : '*All degrees/awards subject to verification as per official credentials.'}
              </p>
            </div>
          </div>

          {/* Inspirational Biography & Text provided by user */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-2xl border border-outline-variant/20 space-y-4">
              <h4 className="font-bold text-base text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span>{isHindi ? 'कैंसर जागरूकता का प्रेरक आधार' : 'Inspirational Pillar of Cancer Awareness'}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold border-l-4 border-primary pl-4">
                "{isHindi ? APPROVED_DOCTORS_PANEL[0].bioHi : APPROVED_DOCTORS_PANEL[0].bioEn}"
              </p>
              <div className="text-[11px] text-slate-500 border-t border-slate-200/80 pt-3 font-semibold">
                <strong>{isHindi ? 'उपाधियाँ:' : 'Degrees:'}</strong> {isHindi ? (APPROVED_DOCTORS_PANEL[0].degreesHi || APPROVED_DOCTORS_PANEL[0].degrees) : APPROVED_DOCTORS_PANEL[0].degrees}
              </div>
            </div>

            {/* Profile Page Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/gallery')}
                className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <PlayCircle className="w-4 h-4 text-slate-300" />
                <span>{isHindi ? 'कैंसर जागरूकता वीडियो देखें' : 'Watch Awareness Videos'}</span>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-md"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{isHindi ? 'आगामी कैंप देखें' : 'View Upcoming Camps'}</span>
              </button>

              <button
                onClick={scrollToTeam}
                className="px-5 py-3 rounded-xl bg-secondary text-white font-bold text-xs hover:opacity-95 shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{isHindi ? 'विशेषज्ञ टीम देखें' : 'View Specialist Panel'}</span>
              </button>

              <button
                onClick={onOpenVolunteer}
                className="px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isHindi ? 'चिकित्सक पैनल से जुड़ें' : 'Join as Medical Expert'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ===== 3. DOCTORS DETAIL GRID SECTION ===== */}
      <section id="specialist-team-grid" className="space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">APPROVED DOCTORS PANEL</span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-slate-900">
              {isHindi ? 'विशेषज्ञ डॉक्टर विवरण (Doctor Cards)' : 'Approved Specialist Doctor Profiles'}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Verified Panel
          </span>
        </div>

        {/* Doctor Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {APPROVED_DOCTORS_PANEL.map((doc) => (
            <div
              key={doc.id}
              className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-5">
                
                {/* Photo & Name & Specialty */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary/20 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full shadow-md" title="Verified Doctor">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-headline-lg text-lg sm:text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                      {isHindi ? `${doc.nameHi} (${doc.name})` : `${doc.name} (${doc.nameHi})`}
                    </h3>

                    <p className="text-xs font-bold text-secondary">
                      {isHindi ? doc.specialtyHi : doc.specialty}
                    </p>

                    {(doc.honors || doc.honorsEn) && (
                      <p className="text-[11px] text-slate-700 font-bold">
                        🏅 {isHindi ? doc.honors : (doc.honorsEn || doc.honors)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Structured Fields: Qualification | Designation | Specialty | Approved Bio */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 space-y-3 text-xs">
                  
                  {/* Verified Qualification */}
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 text-[11px] shrink-0">
                      🎓 {isHindi ? 'Verified Qualification:' : 'Verified Qualification:'}
                    </span>
                    <span className="font-semibold text-primary text-[11px]">
                      {isHindi ? (doc.degreesHi || doc.degrees) : doc.degrees}
                    </span>
                  </div>

                  {/* Registration / Professional Designation */}
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 text-[11px] shrink-0">
                      📋 {isHindi ? 'Designation / Reg:' : 'Designation / Reg:'}
                    </span>
                    <span className="font-semibold text-slate-700 text-[11px]">
                      {isHindi ? (doc.titleHi || doc.title) : doc.title} {doc.regNo ? `(MCI Reg: ${doc.regNo})` : ''}
                    </span>
                  </div>

                  {/* Specialty */}
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 text-[11px] shrink-0">
                      🩺 {isHindi ? 'Specialty:' : 'Specialty:'}
                    </span>
                    <span className="font-semibold text-secondary text-[11px]">
                      {isHindi ? doc.specialtyHi : doc.specialty}
                    </span>
                  </div>

                  {/* Approved Bio */}
                  <div className="pt-2 border-t border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-800 text-[11px] block">
                      {isHindi ? 'Approved Bio (स्वीकृत परिचय):' : 'Approved Bio:'}
                    </span>
                    <p className="text-slate-700 leading-relaxed text-xs font-medium">
                      {isHindi ? doc.bioHi : (doc.bioEn || doc.bioHi)}
                    </p>
                  </div>

                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-semibold italic">
                  {isHindi
                    ? '*सभी उपाधियाँ/पुरस्कार आधिकारिक दस्तावेज़ के अनुसार अंतिम किए जाएँ।'
                    : '*All credentials subject to official document verification.'}
                </span>

                <button
                  onClick={() => onOpenEnquiry(doc.name)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-md cursor-pointer transition-transform hover:scale-105 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'Request Consultation / ओपिनियन लें' : 'Request Consultation / Opinion'}</span>
                </button>
              </div>
            </div>
          ))}

          {/* Join Doctor Panel Callout Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-primary text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-secondary flex items-center justify-center font-bold border border-white/15">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-headline-lg text-xl font-bold text-white">
                {isHindi ? 'चिकित्सक पैनल से जुड़ें' : 'Join Our Doctors Panel'}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {isHindi
                  ? 'यदि आप एक ऑन्कोलॉजिस्ट या चिकित्सा विशेषज्ञ हैं और कैंसर जागरूकता मिशन में अपना योगदान देना चाहते हैं, तो कृपया हमारे वालंटियर/चिकित्सक नेटवर्क से जुड़ें।'
                  : 'Are you an oncologist or medical specialist interested in contributing to early detection and awareness camps? Join our empaneled medical network today.'}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/15">
              <button
                onClick={onOpenVolunteer}
                className="w-full py-3 px-4 rounded-xl bg-secondary text-slate-950 font-bold text-xs hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isHindi ? 'रजिस्टर करें (Register as Doctor)' : 'Register as Medical Specialist'}</span>
              </button>
              <button
                onClick={() => onOpenEnquiry('Doctor Panel Inquiry')}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{isHindi ? 'संपर्क करें (Contact Coordinator)' : 'Contact Panel Coordinator'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>
        </div>
      </PremiumSection>
    </>
  );
}

