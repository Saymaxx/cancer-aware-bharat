import React, { useState } from 'react';
import { Calendar, Heart, ShieldAlert, Award, ChevronRight, ChevronLeft, Activity, HelpCircle, CheckCircle2, Microscope, HeartHandshake, BookOpen } from 'lucide-react';
import { INITIAL_EVENTS } from '../data';
import { Event } from '../types';

const CAROUSEL_SLIDES = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD67aBEzQ4mH7MDO2L157RQifaSnmDCt3cgR1mBA8TH9TrWOEVtfrO-LXwPvszbWFRhSqm0iXQWTAIIR9OboD39r61QZ-YZCeSRPwF1OR5sTAR1C41FQ_vE_bR33rhXQiCFAzEIlwPlVTKJ6O7A3QiRFi1YXJOgUb-9v9v0-kIPjAR44d5XSt4nKwVOsMj6FbMMzo3uXulQG9eN-sMU5SFguVUub1iTlqnnpe1xgdE_2zA6nvpvZSMfIw',
    tag: 'Live Campaign Highlight',
    title: 'Free Early Screening Detection Camp — Lions Club Grounds'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1880QY6OfofO_mmX-rcXHaAug2vtajUZh8wdyvyqOs-NaTEQrISBKKhz9xeQgcTlC5jGjaEbX6dXF-hpCOnnp3qkIBX9FtSLLJSYipUBmqlfLRKOe1YyNGL9eU7xm3UJGGfwfa0hzgZtRm0RApDf0USsey-4LTvHj50vopmZyMZ9I2a3YBFRnEtIlpunCn73x9iJUPbEU_ZqtR-eWf4p9Huxa_-3qA6JOYgrtyM5h8eOk8CROTwZOjg',
    tag: 'Community Outreach',
    title: 'Mega Blood Donation Drive — City Hospital Community Hall'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFFddb5pzA21ANryP1YyFAiRmDv3cYKLcxSom4PCWLLeWaQ8A9CbdNUwr3WkjBBYOn3LnlsIkQeMOH0pdfIrZhvJPAvTw17EErc46zNEX8ktzX2GaIp4MBMvS_10RSOBY7NyFOgnXVvwb9nDgasMYo7nvtJOitIe-_wl00F8YY3Oq7ScymOSyvjIIKe7LNrvezd0HA_o2odBXvMSfPkLqst0_XXIqta3AqnH3LrGtn46PXutTIuwRPYg',
    tag: 'Support Workshops',
    title: 'Nutrition Post-Treatment & Holistic Recovery Workshop'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4FXV2Dd6jmMTFi2iPnEYwnPBnlna3noopCsiVkX8csJqIRzvs_8sM9KXJFNvLLTFXIupQaBHhKKejejKGV3TdbCbIdGl2qvvFBX7JBhylg5jOL_48iNOY691vu4z79TCldatGuGOO22TJEWAMmwMSbdf2XBARbtJ-nW1ValYq3fbh1tYvwsyrZdSJCcL5V36MLpED3n83SZK-pvi-1bMJ65sV8d9s5Ln1DMJ6SyGFjzfh3-ZktqCxYw',
    tag: 'Educational Resources',
    title: 'Awareness Seminars & Cancer Early Detection Guides'
  }
];

function AnimatedCounter({ value }: { value: string }) {
  const numericStr = value.replace(/,/g, '').match(/\d+/)?.[0] || '0';
  const target = parseInt(numericStr, 10);
  const nonNumericParts = value.replace(/,/g, '').split(numericStr);
  const prefix = nonNumericParts[0] || '';
  const suffix = nonNumericParts[1] || '';

  const [count, setCount] = useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuad
      const easedProgress = progress * (2 - progress);
      const currentCount = Math.floor(easedProgress * target);
      
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [target]);

  const formattedCount = count.toLocaleString();

  return (
    <span>
      {prefix}{formattedCount}{suffix}
    </span>
  );
}

interface HomeTabProps {
  onPageChange: (page: string) => void;
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function HomeTab({ onPageChange, onOpenVolunteer, onOpenEnquiry }: HomeTabProps) {
  // Risk assessment state
  const [quizStep, setQuizStep] = useState(0);
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);

  React.useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 3000);
    return () => clearInterval(slideInterval);
  }, [activeSlide]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const toggleHabit = (habit: string) => {
    setHabits(prev => prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]);
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setGender('');
    setAgeRange('');
    setHabits([]);
    setSymptoms([]);
    setQuizSubmitted(false);
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner Section with Background Slides */}
      <section className="relative rounded-3xl min-h-[560px] md:min-h-[590px] lg:min-h-[620px] flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-14 border border-outline-variant/30 overflow-hidden shadow-2xl bg-neutral-950">
        
        {/* Background Slide Elements */}
        <div className="absolute inset-0 z-0">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover transform scale-105 transition-transform duration-[6000ms]"
                referrerPolicy="no-referrer"
              />
              {/* Complex Responsive Overlay Gradient to guarantee beautiful contrast for text */}
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-transparent md:bg-gradient-to-r md:from-neutral-950/90 md:via-neutral-950/70 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-transparent to-neutral-950/40" />
              <div className="absolute inset-0 bg-neutral-950/35" />
            </div>
          ))}
        </div>

        {/* Foreground Content Layout - Top/Center portion */}
        <div className="relative z-10 w-full mt-auto mb-10 md:mb-12">
          <div className="max-w-3xl space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white backdrop-blur-md text-xs font-semibold uppercase tracking-wider border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Bridging Medical Expertise & Empathy
            </span>
            
            <h1 className="font-display-lg text-white text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
              Clinical Authority. <span className="text-secondary-container">Human Compassion.</span>
            </h1>
            
            <p className="font-body-lg text-slate-100 max-w-2xl text-sm md:text-base leading-relaxed drop-shadow-sm">
              We connect local families, patient advocates, and corporate partners with India’s leading healthcare institutes to enable early cancer screening, diagnostic navigation, and therapeutic healing.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onPageChange('events')}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 hover:scale-[1.02] shadow-lg shadow-black/35 flex items-center gap-2 cursor-pointer transition-all duration-300"
              >
                Find Free Screening Camps <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenEnquiry}
                className="px-6 py-3 rounded-xl bg-white/15 border border-white/20 text-white font-semibold text-sm hover:bg-white/25 hover:border-white/40 backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-[1.02]"
              >
                Request Patient Navigation
              </button>
            </div>
          </div>
        </div>

        {/* Elegant Horizontal Bottom Active Slide Spotlight Bar */}
        <div className="relative z-10 w-full mt-auto">
          <div className="bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 flex-1">
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 self-start md:self-auto">
                {CAROUSEL_SLIDES[activeSlide].tag}
              </span>
              <p className="font-title-md text-xs md:text-sm font-semibold leading-snug text-slate-100 max-w-3xl">
                {CAROUSEL_SLIDES[activeSlide].title}
              </p>
            </div>
            
            <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
              {/* Dots indicator */}
              <div className="flex gap-1.5">
                {CAROUSEL_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mr-1">
                  {activeSlide + 1} / {CAROUSEL_SLIDES.length}
                </span>
                <button
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer text-white"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer text-white"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Impact Live Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Free Screenings', val: '14,250+', desc: 'Across 6 states' },
          { label: 'Hospital Partners', val: '4 Centers', desc: 'Apex, CareWell & more' },
          { label: 'Rural Awareness', val: '180+ Camps', desc: 'Active community mobilization' },
          { label: 'Navigation Cases', val: '1,240+', desc: 'Complete therapy navigation' }
        ].map((st, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-outline-variant/30 text-center shadow-xs">
            <p className="font-headline-lg text-primary text-3xl font-black">
              <AnimatedCounter value={st.val} />
            </p>
            <p className="font-label-sm text-xs font-bold text-on-surface mt-1">{st.label}</p>
            <p className="font-caption text-[11px] text-on-surface-variant mt-0.5">{st.desc}</p>
          </div>
        ))}
      </section>

      {/* Pillars of Purpose / Core Programs */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-headline-lg text-primary text-2xl md:text-3xl font-extrabold">Our Pillars of Purpose</h2>
          <p className="font-body-md text-on-surface-variant text-sm">
            Tackling oncology care holistically by combining state-of-the-art clinical guidance with localized grassroots efforts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Microscope className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-title-md text-primary mb-2">Early Detection Camps</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              We operate highly organized mobile clinics with specialized oncologists to provide free mammographies, oral cancer screening, and cervical PAP tests right at villagers' doorsteps.
            </p>
          </div>

          <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
              <HeartHandshake className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-title-md text-primary mb-2">Empathetic Case Navigation</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Receiving a cancer diagnosis can be overwhelming. Our certified regional caseworkers hold patients' hands, organizing second opinions, translating schedules, and helping access government aid.
            </p>
          </div>

          <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-title-md text-primary mb-2">Clinical Education & Prevention</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Demystifying cancer warning signs, guiding families on self-examination protocols, and providing nutrition frameworks to prevent disease and speed up healing post-treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Screening Risk Assessment Widget */}
      <section className="bg-surface-container-low border border-primary-fixed-dim/40 rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity className="w-48 h-48 text-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">Interactive Assessment</span>
            <h3 className="font-headline-lg text-primary text-xl md:text-2xl font-bold">Cancer Screening Guidance Tool</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Answer 4 simple anonymous questions to understand which cancer screening guidelines (oral, mammogram, chest scan) apply to you or your family member based on medical standards in India.
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-outline-variant/20 text-xs text-on-surface-variant">
              ⚠️ <strong>Disclaimer:</strong> This tool is purely for screening educational guidance. It is NOT a clinical diagnosis. Always consult with a registered oncologist.
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm min-h-[300px] flex flex-col justify-between">
            {!quizSubmitted ? (
              <>
                {/* Step 1: Gender */}
                {quizStep === 0 && (
                  <div className="space-y-4">
                    <p className="font-title-md text-sm text-primary font-bold">Step 1: Select Gender Assigned at Birth</p>
                    <div className="grid grid-cols-3 gap-3">
                      {['Female', 'Male', 'Prefer not to say'].map(g => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`p-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                            gender === g 
                              ? 'bg-primary text-white border-primary shadow-sm' 
                              : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Age range */}
                {quizStep === 1 && (
                  <div className="space-y-4">
                    <p className="font-title-md text-sm text-primary font-bold">Step 2: Select Patient Age Bracket</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Under 20', '20 - 39', '40 - 54', '55+'].map(age => (
                        <button
                          key={age}
                          onClick={() => setAgeRange(age)}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            ageRange === age 
                              ? 'bg-primary text-white border-primary shadow-sm' 
                              : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Habits */}
                {quizStep === 2 && (
                  <div className="space-y-4">
                    <p className="font-title-md text-sm text-primary font-bold">Step 3: Lifestyle risk factors (Select all that apply)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'smoke', label: 'Tobacco smoking / vaping' },
                        { id: 'chew', label: 'Chewing betel nut (supari) or tobacco' },
                        { id: 'alcohol', label: 'Regular alcohol consumption' },
                        { id: 'family', label: 'Family history of cancer (first-degree)' }
                      ].map(h => {
                        const hasHabit = habits.includes(h.id);
                        return (
                          <button
                            key={h.id}
                            onClick={() => toggleHabit(h.id)}
                            className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all flex justify-between items-center cursor-pointer ${
                              hasHabit 
                                ? 'bg-primary text-white border-primary shadow-sm' 
                                : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
                            }`}
                          >
                            <span>{h.label}</span>
                            {hasHabit && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 4: Symptoms */}
                {quizStep === 3 && (
                  <div className="space-y-4">
                    <p className="font-title-md text-sm text-primary font-bold">Step 4: Any warning symptoms? (Select all that apply)</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'lump', label: 'A new painless lump in breast, neck, or underarms' },
                        { id: 'cough', label: 'Persistent dry cough or hoarseness for > 3 weeks' },
                        { id: 'ulcer', label: 'An ulcer/patch in the mouth that doesn\'t heal' },
                        { id: 'weight', label: 'Unexplained extreme weight loss (>5 kg in 1 month)' },
                        { id: 'none', label: 'No symptoms, seeking general wellness guidelines' }
                      ].map(s => {
                        const hasSymp = symptoms.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleSymptom(s.id)}
                            className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all flex justify-between items-center cursor-pointer ${
                              hasSymp 
                                ? 'bg-primary text-white border-primary shadow-sm' 
                                : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
                            }`}
                          >
                            <span>{s.label}</span>
                            {hasSymp && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-between items-center pt-6 border-t border-outline-variant/20 mt-4">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3].map(stepNum => (
                      <span 
                        key={stepNum} 
                        className={`w-4 h-1.5 rounded-full ${stepNum === quizStep ? 'bg-primary' : 'bg-outline-variant/40'}`} 
                      />
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    {quizStep > 0 && (
                      <button
                        onClick={() => setQuizStep(prev => prev - 1)}
                        className="px-4 py-1.5 rounded-lg border border-outline text-xs font-semibold hover:bg-surface-container-low cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    {quizStep < 3 ? (
                      <button
                        onClick={() => setQuizStep(prev => prev + 1)}
                        disabled={(quizStep === 0 && !gender) || (quizStep === 1 && !ageRange)}
                        className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="px-5 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:opacity-95 shadow cursor-pointer"
                      >
                        Calculate Guidelines
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Results Screen */
              <div className="space-y-4 flex flex-col justify-between h-full">
                <div>
                  <h4 className="font-headline-lg text-lg text-primary font-bold mb-1">Your Screening Guidance</h4>
                  <p className="text-xs text-on-surface-variant border-b border-outline-variant/20 pb-3 mb-3">
                    Demographics: {gender} • Age {ageRange} • Habits: {habits.length > 0 ? habits.length : 'None selected'}
                  </p>

                  <div className="space-y-3">
                    {/* General Check */}
                    {symptoms.length > 0 && !symptoms.includes('none') ? (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-red-600" /> Clinical Review Recommended
                        </p>
                        <p className="leading-relaxed">
                          You reported experiencing a warning sign (such as a painless lump, persistent cough, or non-healing mouth ulcer). You should consult an oncologist for a clinical exam within 2 weeks. Do not worry, but prompt checking is vital.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" /> Healthy Status (Asymptomatic)
                        </p>
                        <p className="leading-relaxed">
                          Great! Regular preventive screening is still recommended. Preventative oncology is about checking before symptoms appear.
                        </p>
                      </div>
                    )}

                    {/* Specific advice based on Age/Gender */}
                    <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-2">
                      <p className="font-bold text-primary">Standard Screening Protocols for you:</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-on-surface-variant">
                        {gender === 'Female' && (ageRange === '40 - 54' || ageRange === '55+') && (
                          <li><strong>Mammography:</strong> Standard clinical guidelines suggest an annual mammogram for women starting age 40 to 45 to check for early breast cancer.</li>
                        )}
                        {gender === 'Female' && (
                          <li><strong>PAP Smear & HPV DNA:</strong> Every woman aged 21-65 should undergo a cervical PAP exam or HPV screen every 3-5 years.</li>
                        )}
                        {(habits.includes('smoke') || habits.includes('chew')) && (
                          <li><strong>Oral Examination:</strong> Since you indicated tobacco/betel nut habits, an annual oral cavity examination by a dental specialist or surgeon is recommended to verify no pre-cancerous lesions.</li>
                        )}
                        {habits.includes('smoke') && ageRange === '55+' && (
                          <li><strong>Low-Dose CT:</strong> For long-term smokers over 50, an annual low-dose chest CT screen is recommended.</li>
                        )}
                        <li><strong>Breast Self-Exam:</strong> Conduct monthly self-exams 5 days after your period.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-outline-variant/20">
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 rounded-lg border border-outline text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Retake Assessment
                  </button>
                  <button
                    onClick={onOpenEnquiry}
                    className="flex-grow px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 shadow-sm"
                  >
                    Book Free Cancer Screening Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Urgent Camps Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-lg text-primary text-2xl font-extrabold">Active Screening Camps</h2>
            <p className="font-body-md text-sm text-on-surface-variant">Don\'t postpone your check-ups. Register in 30 seconds.</p>
          </div>
          <button
            onClick={() => onPageChange('events')}
            className="text-sm font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            All Events & Camps <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_EVENTS.slice(0, 2).map(camp => (
            <div key={camp.id} className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-44 relative bg-surface-container-highest">
                  <img src={camp.image} alt={camp.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-white/95 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-outline-variant/30">
                    {camp.type}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-title-md text-base font-bold text-primary line-clamp-1">{camp.title}</h3>
                  <p className="text-xs font-semibold text-secondary flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {camp.date} • {camp.time}
                  </p>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>
                </div>
              </div>
              
              <div className="px-5 pb-5 pt-2 border-t border-outline-variant/10 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">
                  Slots remaining: <strong className="text-primary">{camp.capacity - camp.registeredCount}</strong> / {camp.capacity}
                </span>
                <button
                  onClick={onOpenEnquiry}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 shadow-sm transition-opacity"
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
