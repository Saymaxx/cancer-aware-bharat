import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Heart, ShieldAlert, Award, ChevronRight, ChevronLeft, Activity, HelpCircle,
  CheckCircle2, Microscope, HeartHandshake, BookOpen, ArrowRight, Shield, Users, MapPin,
  Phone, Stethoscope, Star, Quote, ChevronDown, Mail, Sparkles,
  Sun, Apple, Cigarette, Dumbbell, Syringe, Search as SearchIcon,
  ClipboardCheck, UserCheck, Compass, HeartPulse, Droplet, Play,
  Facebook, Instagram, Linkedin, Twitter, Plus
} from 'lucide-react';
import { INITIAL_EVENTS } from '../data';
import { Event } from '../types';
import TeamShowcase from './TeamShowcase';

const CAROUSEL_SLIDES = [
  {
    image: '/events/event-1.jpeg',
    tag: 'Live Campaign Highlight',
    badge: 'Bridging Medical Expertise & Empathy | चिकित्सा और संवेदना',
    titleHi: 'कैंसर की पहचान देर से नहीं,',
    highlight: 'समय रहते हो।',
    descHi: 'गाँव-गाँव स्वास्थ्य जागरूकता, प्राथमिक सहायता और समय पर सही विशेषज्ञ तक रेफरल पहुँचाने का एक जनस्वास्थ्य अभियान। हमारा प्रयास है कि जानकारी के अभाव में कोई मरीज देर से अस्पताल न पहुँचे।',
    title: 'Free Early Screening Detection Camp — Lions Club Grounds'
  },
  {
    image: '/events/event-2.jpeg',
    tag: 'Community Outreach',
    badge: 'Life Saving Blood Support | रक्तदान - महादान',
    titleHi: 'रक्तदान से बचेगी जान,',
    highlight: 'हर मरीज को मिलेगा संबल।',
    descHi: 'कैंसर सर्जरी और कीमोथेरेपी के दौरान आवश्यक रक्त और प्लेटलेट्स आपूर्ति हेतु विशाल रक्तदान शिविर। आपके एक कदम से किसी परिवार को नया जीवन मिल सकता है।',
    title: 'Mega Blood Donation Drive — City Hospital Community Hall'
  },
  {
    image: '/events/event-4.jpeg',
    tag: 'Support Workshops',
    badge: 'Holistic Recovery | स्वास्थ्य एवं पोषण',
    titleHi: 'इलाज के बाद सही पोषण और',
    highlight: 'रिकवरी मार्गदर्शन।',
    descHi: 'विशेषज्ञ ऑन्को-न्यूट्रिशनिस्ट और फिजियोथेरेपिस्ट द्वारा कैंसर मरीजों और उनके परिजनों के लिए विशेष आहार, योग और पुनर्वास मार्गदर्शन कार्यशाला।',
    title: 'Nutrition Post-Treatment & Holistic Recovery Workshop'
  },
  {
    image: '/events/event-5.jpeg',
    tag: 'Educational Resources',
    badge: 'Preventive Awareness | जागरूकता ही बचाव है',
    titleHi: 'सही जानकारी और शुरुआती',
    highlight: 'लक्षणों से जीतें जंग।',
    descHi: 'मुफ्त ओरल, स्तन और गर्भाशय ग्रीवा कैंसर प्रिवेंटिव हेल्थ गाइड्स। शुरुआती संकेतों को समझें और समय पर जाँच कराकर अपने परिवार की सुरक्षा सुनिश्चित करें।',
    title: 'Awareness Seminars & Cancer Early Detection Guides'
  }
];

/* ─────────── Animated Counter (Intersection Observer) ─────────── */
function AnimatedCounter({ value, className = '' }: { value: string; className?: string }) {
  const numericStr = value.replace(/,/g, '').match(/\d+/)?.[0] || '0';
  const target = parseInt(numericStr, 10);
  const nonNumericParts = value.replace(/,/g, '').split(numericStr);
  const prefix = nonNumericParts[0] || '';
  const suffix = nonNumericParts[1] || '';
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const duration = 1800;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easedProgress * target));
            if (progress < 1) window.requestAnimationFrame(step);
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

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

/* ─────────── FAQ Item ─────────── */
function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`border rounded-2xl transition-all duration-300 ${isOpen ? 'border-primary/20 bg-primary/[0.02] shadow-sm' : 'border-outline-variant/25 hover:border-outline-variant/40'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className={`font-semibold text-sm md:text-[15px] pr-4 transition-colors ${isOpen ? 'text-primary' : 'text-on-surface'}`}>{q}</span>
        <ChevronDown className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-350 ${isOpen ? 'max-h-[300px]' : 'max-h-0'}`}>
        <p className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOME TAB COMPONENT
   ═══════════════════════════════════════════ */

interface HomeTabProps {
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function HomeTab({ onOpenVolunteer, onOpenEnquiry }: HomeTabProps) {
  const navigate = useNavigate();

  // Risk assessment state
  const [quizStep, setQuizStep] = useState(0);
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  // Testimonial carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setTextVisible(false);
      
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
        setTextVisible(true);
      }, 500); // Wait for text to fade out before switching image
      
    }, 5500); // 5.5s total cycle (5s visible, 0.5s transition out)
    
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const toggleHabit = (habit: string) => setHabits(prev => prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]);
  const toggleSymptom = (symptom: string) => setSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]);
  const resetQuiz = () => { setQuizStep(0); setGender(''); setAgeRange(''); setHabits([]); setSymptoms([]); setQuizSubmitted(false); };

  const testimonials = [
    { name: 'Sunita Devi', role: 'Patient, Gaya, Bihar', quote: 'Cancer Aware Bharat helped me get diagnosed early. Their volunteers guided me to the right hospital and even helped with government assistance paperwork. I am forever grateful.', rating: 5 },
    { name: 'Rajesh Sharma', role: 'Volunteer, New Delhi', quote: 'Being a volunteer here has been the most fulfilling experience. Seeing the relief on a patient\'s face when they finally get the right guidance — that feeling is priceless.', rating: 5 },
    { name: 'Dr. Meena Gupta', role: 'Oncologist, Apex Oncology', quote: 'The screening camps organized by Cancer Aware Bharat are top-notch. They identify patients who would have otherwise gone undiagnosed for months. This saves lives.', rating: 5 },
  ];

  const faqs = [
    { q: 'Are the screening camps really free?', a: 'Yes, all our screening camps are completely free of cost. We partner with hospitals and receive grants to cover all diagnostic expenses including mammography, oral examination, and basic blood work.' },
    { q: 'How do I register for a screening camp near me?', a: 'You can register through our Patient Enquiry form on this website, call our helpline, or visit the Events page to find camps in your area. Our volunteers will guide you through the process.' },
    { q: 'Can I volunteer if I don\'t have a medical background?', a: 'Absolutely! We welcome volunteers from all backgrounds. You can help with patient coordination, data entry, community outreach, and awareness campaigns. We provide all necessary training.' },
    { q: 'How does the patient navigation service work?', a: 'Once you submit an enquiry, our trained caseworkers assess your needs, connect you with the right hospital, help arrange appointments, and guide you through government assistance schemes if applicable.' },
    { q: 'Which states does Cancer Aware Bharat operate in?', a: 'We currently operate across Delhi, Maharashtra, West Bengal, Karnataka, Bihar, and Madhya Pradesh, with plans to expand to all major states by 2027.' },
    { q: 'How can hospitals partner with Cancer Aware Bharat?', a: 'Hospitals can apply through our Hospital Partner Portal on this website. We look for institutions committed to accessible oncology care and patient-first practices.' },
  ];

  return (
    <div className="space-y-0">

      {/* ═══════════════════════════════════════════
          SECTION 1: HERO BANNER
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[600px] md:min-h-[650px] lg:min-h-[700px] flex flex-col justify-center overflow-hidden bg-neutral-950">
        {/* Background Slides */}
        <div className="absolute inset-0 z-0 bg-neutral-950">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${idx === activeSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover brightness-110 contrast-105 saturate-105"
                referrerPolicy="no-referrer"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              {/* Subtle premium deep navy overlay matching the theme */}
              <div className="absolute inset-0 bg-[#163A5F]/45 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#163A5F]/45 via-[#163A5F]/15 to-transparent" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full pl-[8vw] lg:pl-[10vw] pr-4 sm:pr-8 pt-10">
          <div className="max-w-3xl">
            <div className={`space-y-6 transition-all duration-500 ease-out transform ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              {/* Headline */}
              <h1 className="font-outfit text-white text-[34px] md:text-[44px] lg:text-[56px] font-[800] leading-[1.05] tracking-tight max-w-[700px]">
                {CAROUSEL_SLIDES[activeSlide].titleHi}{' '}
                <span className="text-secondary-container">{CAROUSEL_SLIDES[activeSlide].highlight}</span>
              </h1>

              {/* Description */}
              <p className="text-slate-200/90 max-w-[600px] text-[18px] leading-[1.6]">
                {CAROUSEL_SLIDES[activeSlide].descHi}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-7">
                <button
                  onClick={() => navigate('/events')}
                  className="px-6 py-3 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 shadow-lg flex items-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:translate-y-[-1px]"
                >
                  Find Free Screening Camps <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/join-us')}
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                >
                  Join Our Mission
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`mt-10 glass-dark rounded-full px-[24px] min-h-[56px] py-2 md:py-0 inline-flex items-center flex-wrap gap-[16px] text-white max-w-[700px] w-fit transition-all duration-500 ease-out transform ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <span className="shrink-0 px-3 py-1 rounded-full bg-primary/15 text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-primary/20">
              {CAROUSEL_SLIDES[activeSlide].tag}
            </span>
            <p className="text-xs md:text-sm font-medium text-slate-200">
              {CAROUSEL_SLIDES[activeSlide].title}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: IMPACT STATISTICS
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 -mt-1 bg-white border-b border-outline-variant/10">
        <div className="section-container py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Free Screenings', val: '14250+', icon: Microscope, desc: 'Across 6 states', color: 'text-primary bg-primary/8' },
              { label: 'Hospital Partners', val: '4', icon: HeartPulse, desc: 'Apex, CareWell & more', color: 'text-primary-container bg-slate-50' },
              { label: 'Awareness Camps', val: '180+', icon: MapPin, desc: 'Active community outreach', color: 'text-secondary bg-slate-50' },
              { label: 'Navigation Cases', val: '1240+', icon: Compass, desc: 'Complete therapy navigation', color: 'text-secondary bg-secondary/8' }
            ].map((st, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="text-center p-5 md:p-6">
                  <div className={`w-12 h-12 rounded-2xl ${st.color} flex items-center justify-center mx-auto mb-4`}>
                    <st.icon className="w-5.5 h-5.5" />
                  </div>
                  <p className="font-outfit text-secondary text-3xl md:text-4xl font-extrabold tracking-tight">
                    <AnimatedCounter value={st.val} />
                  </p>
                  <p className="text-sm font-semibold text-primary mt-1.5">{st.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{st.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: CORE PROGRAMS / PILLARS
          ═══════════════════════════════════════════ */}
      <section className="gradient-light py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">Our Core Programs</span>
              <h2 className="section-title text-2xl md:text-3xl">हमारे मुख्य उद्देश्य और स्तंभ</h2>
              <p className="section-subtitle">
                आधुनिक नैदानिक मार्गदर्शन और ग्रामीण जमीनी प्रयासों का समन्वय करके कैंसर देखभाल को सर्वसुलभ बनाना।
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Microscope, color: 'text-primary', bg: 'bg-primary/8',
                title: 'निःशुल्क शुरुआती जांच शिविर (Early Screening Camps)',
                desc: 'हम विशेषज्ञ ऑन्कोलॉजिस्ट के साथ सुसज्जित मोबाइल क्लीनिक संचालित करते हैं, जो ग्रामीणों के घर तक निःशुल्क मैमोग्राफी, मुख (oral) कैंसर और प्रिवेंटिव PAP जांच पहुँचाते हैं।'
              },
              {
                icon: HeartHandshake, color: 'text-secondary', bg: 'bg-secondary/8',
                title: 'संवेदनशील मरीज सहायता व रेफरल (Empathetic Navigation)',
                desc: 'कैंसर की आशंका या निदान के समय मरीज और परिवार घबरा जाते हैं। हमारे प्रशिक्षित क्षेत्रीय स्वयंसेवक मरीजों को सही मार्गदर्शन, सेकंड ओपिनियन और सरकारी सहायता प्राप्त कराने में निरंतर मदद करते हैं।'
              },
              {
                icon: BookOpen, color: 'text-secondary', bg: 'bg-slate-50',
                title: 'स्वास्थ्य शिक्षा व रोकथाम (Clinical Education & Prevention)',
                desc: 'कैंसर के शुरुआती चेतावनी संकेतों के बारे में जागरूकता फैलाना, स्व-जांच विधियाँ सिखाना और उपचार के बाद तेजी से स्वास्थ्य सुधार हेतु सही पोषण ढांचा प्रदान करना।'
              }
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 120}>
                <div className="card-premium p-6 md:p-7 h-full">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-5`}>
                    <item.icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-outfit text-primary text-base md:text-lg font-bold mb-3 leading-snug">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: WHY CHOOSE US
          ═══════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">Why Cancer Aware Bharat</span>
              <h2 className="section-title text-2xl md:text-3xl">What Sets Us Apart</h2>
              <p className="section-subtitle">
                Trusted by thousands of families for compassionate, accessible, and expert cancer care navigation.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: 'Trusted Network', desc: 'Partnered with NABH-accredited oncology centers across India', color: 'text-primary bg-primary/8' },
              { icon: Stethoscope, title: 'Expert Guidance', desc: 'Access to oncologists, nutritionists, and trained caseworkers', color: 'text-primary-container bg-slate-50' },
              { icon: MapPin, title: 'Pan-India Reach', desc: 'Operating across 6+ states with plans for nationwide coverage', color: 'text-secondary bg-slate-50' },
              { icon: Heart, title: 'Zero Cost Support', desc: 'All screening camps and navigation services are completely free', color: 'text-rose-500 bg-rose-50' },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="card-subtle p-6 h-full text-center">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit font-bold text-on-surface text-[15px] mb-2">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: SCREENING RISK ASSESSMENT
          ═══════════════════════════════════════════ */}
      <section className="gradient-light py-16 md:py-20">
        <div className="section-container">
          <div className="card-premium !rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Info Panel */}
              <div className="lg:col-span-5 gradient-primary text-white p-7 md:p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Activity className="w-40 h-40" />
                </div>
                <div className="space-y-4 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    <Sparkles className="w-3 h-3" /> Interactive Assessment
                  </span>
                  <h3 className="font-outfit text-xl md:text-2xl font-bold leading-snug">Cancer Screening Guidance Tool</h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Answer 4 simple anonymous questions to understand which cancer screening guidelines apply to you or your family member based on medical standards in India.
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-xl text-xs text-white/70 mt-6 border border-white/5">
                  ⚠️ <strong className="text-white/90">Disclaimer:</strong> This tool is purely for screening educational guidance. It is NOT a clinical diagnosis. Always consult with a registered oncologist.
                </div>
              </div>

              {/* Right Quiz Panel */}
              <div className="lg:col-span-7 p-6 md:p-8 lg:p-10 flex flex-col justify-between min-h-[380px]">
                {!quizSubmitted ? (
                  <>
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                        <span className="font-semibold">Step {quizStep + 1} of 4</span>
                        <span>{Math.round(((quizStep + 1) / 4) * 100)}% Complete</span>
                      </div>
                      <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${((quizStep + 1) / 4) * 100}%` }}
                        />
                      </div>
                    </div>

                    {quizStep === 0 && (
                      <div className="space-y-4 flex-1">
                        <p className="font-semibold text-sm text-primary">Select Gender Assigned at Birth</p>
                        <div className="grid grid-cols-3 gap-3">
                          {['Female', 'Male', 'Prefer not to say'].map(g => (
                            <button
                              key={g}
                              onClick={() => setGender(g)}
                              className={`p-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${gender === g
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white border-outline-variant/30 hover:border-primary/30 hover:bg-primary/[0.02]'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {quizStep === 1 && (
                      <div className="space-y-4 flex-1">
                        <p className="font-semibold text-sm text-primary">Select Patient Age Bracket</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['Under 20', '20 - 39', '40 - 54', '55+'].map(age => (
                            <button
                              key={age}
                              onClick={() => setAgeRange(age)}
                              className={`p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${ageRange === age
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white border-outline-variant/30 hover:border-primary/30 hover:bg-primary/[0.02]'
                              }`}
                            >
                              {age}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {quizStep === 2 && (
                      <div className="space-y-4 flex-1">
                        <p className="font-semibold text-sm text-primary">Lifestyle risk factors (Select all that apply)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { id: 'smoke', label: 'Tobacco smoking / vaping' },
                            { id: 'chew', label: 'Chewing betel nut (supari) or tobacco' },
                            { id: 'alcohol', label: 'Regular alcohol consumption' },
                            { id: 'family', label: 'Family history of cancer (first-degree)' }
                          ].map(h => (
                            <button
                              key={h.id}
                              onClick={() => toggleHabit(h.id)}
                              className={`p-3.5 rounded-xl border text-sm text-left font-medium transition-all flex justify-between items-center cursor-pointer ${habits.includes(h.id)
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white border-outline-variant/30 hover:border-primary/30 hover:bg-primary/[0.02]'
                              }`}
                            >
                              <span>{h.label}</span>
                              {habits.includes(h.id) && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {quizStep === 3 && (
                      <div className="space-y-4 flex-1">
                        <p className="font-semibold text-sm text-primary">Any warning symptoms? (Select all that apply)</p>
                        <div className="grid grid-cols-1 gap-2.5">
                          {[
                            { id: 'lump', label: 'A new painless lump in breast, neck, or underarms' },
                            { id: 'cough', label: 'Persistent dry cough or hoarseness for > 3 weeks' },
                            { id: 'ulcer', label: 'An ulcer/patch in the mouth that doesn\'t heal' },
                            { id: 'weight', label: 'Unexplained extreme weight loss (>5 kg in 1 month)' },
                            { id: 'none', label: 'No symptoms, seeking general wellness guidelines' }
                          ].map(s => (
                            <button
                              key={s.id}
                              onClick={() => toggleSymptom(s.id)}
                              className={`p-3.5 rounded-xl border text-sm text-left font-medium transition-all flex justify-between items-center cursor-pointer ${symptoms.includes(s.id)
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white border-outline-variant/30 hover:border-primary/30 hover:bg-primary/[0.02]'
                              }`}
                            >
                              <span>{s.label}</span>
                              {symptoms.includes(s.id) && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex justify-between items-center pt-5 border-t border-outline-variant/15 mt-4">
                      <div className="flex space-x-1.5">
                        {[0, 1, 2, 3].map(stepNum => (
                          <span key={stepNum} className={`w-8 h-1 rounded-full transition-all ${stepNum <= quizStep ? 'bg-primary' : 'bg-outline-variant/25'}`} />
                        ))}
                      </div>
                      <div className="flex space-x-2.5">
                        {quizStep > 0 && (
                          <button onClick={() => setQuizStep(prev => prev - 1)} className="btn-secondary !py-2 !px-4 !text-xs !rounded-lg">Back</button>
                        )}
                        {quizStep < 3 ? (
                          <button
                            onClick={() => setQuizStep(prev => prev + 1)}
                            disabled={(quizStep === 0 && !gender) || (quizStep === 1 && !ageRange)}
                            className="btn-primary !py-2 !px-5 !text-xs !rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                          >
                            Next <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => setQuizSubmitted(true)} className="btn-accent !py-2 !px-5 !text-xs !rounded-lg">
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
                      <h4 className="font-outfit text-lg text-primary font-bold mb-1">Your Screening Guidance</h4>
                      <p className="text-xs text-on-surface-variant border-b border-outline-variant/15 pb-3 mb-3">
                        Demographics: {gender} • Age {ageRange} • Habits: {habits.length > 0 ? habits.length : 'None selected'}
                      </p>
                      <div className="space-y-3">
                        {symptoms.length > 0 && !symptoms.includes('none') ? (
                          <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-sm space-y-1">
                            <p className="font-bold flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-600" /> Clinical Review Recommended</p>
                            <p className="text-xs leading-relaxed">You reported experiencing a warning sign. Consult an oncologist for a clinical exam within 2 weeks. Do not worry, but prompt checking is vital.</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-100 text-slate-800 rounded-xl text-sm space-y-1">
                            <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary-container" /> Healthy Status (Asymptomatic)</p>
                            <p className="text-xs leading-relaxed">Great! Regular preventive screening is still recommended.</p>
                          </div>
                        )}
                        <div className="p-4 bg-surface-container-low rounded-xl text-xs space-y-2">
                          <p className="font-bold text-primary text-sm">Standard Screening Protocols for you:</p>
                          <ul className="list-disc pl-4 space-y-1.5 text-on-surface-variant">
                            {gender === 'Female' && (ageRange === '40 - 54' || ageRange === '55+') && (
                              <li><strong>Mammography:</strong> Annual mammogram for women starting age 40-45 to check for early breast cancer.</li>
                            )}
                            {gender === 'Female' && (
                              <li><strong>PAP Smear & HPV DNA:</strong> Every woman aged 21-65 should undergo a cervical PAP exam or HPV screen every 3-5 years.</li>
                            )}
                            {(habits.includes('smoke') || habits.includes('chew')) && (
                              <li><strong>Oral Examination:</strong> Since you indicated tobacco/betel nut habits, an annual oral cavity examination by a dental specialist is recommended.</li>
                            )}
                            {habits.includes('smoke') && ageRange === '55+' && (
                              <li><strong>Low-Dose CT:</strong> For long-term smokers over 50, an annual low-dose chest CT screen is recommended.</li>
                            )}
                            <li><strong>Breast Self-Exam:</strong> Conduct monthly self-exams 5 days after your period.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-outline-variant/15">
                      <button onClick={resetQuiz} className="btn-secondary !py-2.5 !text-xs !rounded-lg flex-shrink-0">Retake Assessment</button>
                      <button onClick={onOpenEnquiry} className="btn-primary !py-2.5 !text-xs !rounded-lg flex-grow justify-center">Book Free Cancer Screening Now</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════
          SECTION 8: HOW WE WORK (TIMELINE)
          ═══════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">How We Work</span>
              <h2 className="section-title text-2xl md:text-3xl">Your Journey With Us</h2>
              <p className="section-subtitle">From your first enquiry to complete support — here's how we help.</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connection line (desktop) */}
            <div className="hidden lg:block absolute top-[3.5rem] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

            {[
              { step: '01', icon: ClipboardCheck, title: 'Register', desc: 'Submit a patient enquiry or register for a screening camp through our portal', color: 'bg-primary text-white' },
              { step: '02', icon: SearchIcon, title: 'Screen', desc: 'Attend a free screening camp or get connected with a specialist for evaluation', color: 'bg-primary-container text-white' },
              { step: '03', icon: UserCheck, title: 'Navigate', desc: 'Our trained caseworkers guide you to the right hospital and government assistance', color: 'bg-secondary text-white' },
              { step: '04', icon: HeartHandshake, title: 'Support', desc: 'Continuous follow-up, emotional support, and complete therapy navigation until recovery', color: 'bg-secondary text-white' },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 150}>
                <div className="text-center relative">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Step {item.step}</span>
                  <h3 className="font-outfit font-bold text-on-surface text-base mt-1 mb-2">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed max-w-[250px] mx-auto">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9: ACTIVE SCREENING CAMPS
          ═══════════════════════════════════════════ */}
      <section className="gradient-light py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
              <div>
                <span className="section-badge mb-3">Upcoming Events</span>
                <h2 className="section-title text-2xl md:text-3xl">Active Screening Camps</h2>
                <p className="text-sm text-on-surface-variant mt-1">Don't postpone your check-ups. Register in 30 seconds.</p>
              </div>
              <button
                onClick={() => navigate('/events')}
                className="btn-secondary !py-2 !px-4 !text-xs shrink-0"
              >
                All Events & Camps <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_EVENTS.slice(0, 2).map((camp, i) => (
              <RevealSection key={camp.id} delay={i * 120}>
                <div className="card-premium overflow-hidden flex flex-col h-full">
                  <div className="h-48 relative bg-surface-container-highest overflow-hidden">
                    <img src={camp.image} alt={camp.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute top-3 left-3">
                      <span className="glass text-primary text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">{camp.type}</span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h3 className="font-outfit text-base font-bold text-on-surface mb-2 line-clamp-1">{camp.title}</h3>
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5" /> {camp.date} • {camp.time}
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed flex-1">{camp.description}</p>

                    {/* Capacity Bar */}
                    <div className="mt-4 pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-on-surface-variant">
                          <strong className="text-primary">{camp.capacity - camp.registeredCount}</strong> slots remaining
                        </span>
                        <span className="text-[10px] text-on-surface-variant/60">{camp.registeredCount}/{camp.capacity}</span>
                      </div>
                      <div className="h-1.5 bg-outline-variant/15 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-primary/70 rounded-full transition-all"
                          style={{ width: `${(camp.registeredCount / camp.capacity) * 100}%` }}
                        />
                      </div>
                      <button onClick={onOpenEnquiry} className="btn-primary !py-2 !px-4 !text-xs !rounded-lg w-full justify-center">
                        Register Now <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 10: TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">Testimonials</span>
              <h2 className="section-title text-2xl md:text-3xl">What People Say</h2>
              <p className="section-subtitle">Real stories from patients, volunteers, and healthcare partners.</p>
            </div>
          </RevealSection>

          <div className="max-w-3xl mx-auto">
            <div className="card-premium p-8 md:p-10 text-center relative">
              <Quote className="w-10 h-10 text-primary/10 mx-auto mb-4" />
              <div key={activeTestimonial} className="animate-fade-in">
                <p className="text-base md:text-lg text-on-surface leading-relaxed italic mb-6">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex items-center gap-1 justify-center mb-3">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="font-outfit font-bold text-on-surface text-sm">{testimonials[activeTestimonial].name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{testimonials[activeTestimonial].role}</p>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${idx === activeTestimonial ? 'bg-primary w-6' : 'bg-outline-variant/30 hover:bg-outline-variant/60'}`}
                    aria-label={`Testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 10.1: PARTNERSHIPS (CONTINUOUS STRIP)
          ═══════════════════════════════════════════ */}
      <style>{`
        .torn-left {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L100,0 L100,95 C92,90 84,100 76,93 C68,88 60,98 52,94 C44,88 36,100 28,95 C20,89 12,99 4,94 C0,91 0,95 0,95 Z' fill='black'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L100,0 L100,95 C92,90 84,100 76,93 C68,88 60,98 52,94 C44,88 36,100 28,95 C20,89 12,99 4,94 C0,91 0,95 0,95 Z' fill='black'/%3E%3C/svg%3E");
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
        }
        .torn-right {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,100 L100,100 L100,5 C92,10 84,0 76,7 C68,12 60,2 52,6 C44,12 36,0 28,5 C20,11 12,1 4,6 C0,9 0,5 0,5 Z' fill='black'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,100 L100,100 L100,5 C92,10 84,0 76,7 C68,12 60,2 52,6 C44,12 36,0 28,5 C20,11 12,1 4,6 C0,9 0,5 0,5 Z' fill='black'/%3E%3C/svg%3E");
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
        }
        @media (min-width: 1024px) {
          .torn-left {
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L95,0 C87,10 100,20 92,30 C85,40 98,50 91,60 C86,70 100,80 93,90 C89,96 95,100 95,100 L0,100 Z' fill='black'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L95,0 C87,10 100,20 92,30 C85,40 98,50 91,60 C86,70 100,80 93,90 C89,96 95,100 95,100 L0,100 Z' fill='black'/%3E%3C/svg%3E");
          }
          .torn-right {
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100,0 L5,0 C13,10 0,20 8,30 C15,40 2,50 9,60 C14,70 0,80 7,90 C11,96 5,100 5,100 L100,100 Z' fill='black'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100,0 L5,0 C13,10 0,20 8,30 C15,40 2,50 9,60 C14,70 0,80 7,90 C11,96 5,100 5,100 L100,100 Z' fill='black'/%3E%3C/svg%3E");
          }
        }
      `}</style>
      <section className="w-full bg-neutral-900 overflow-hidden">
        <div className="flex flex-col lg:flex-row w-full min-h-[500px] lg:h-[540px]">
          
          {/* Left Panel: Volunteer */}
          <div className="torn-left relative flex-1 group min-h-[400px] z-10 -mb-8 lg:mb-0 lg:-mr-8">
            <img src="/events/event-1.jpeg" alt="Volunteer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/45 transition-colors duration-500" />
            <div className="absolute inset-0 p-8 md:p-12 lg:pr-16 flex flex-col justify-center items-start text-left z-10">
              <span className="inline-block text-[12px] md:text-[13px] font-medium uppercase tracking-[0.15em] text-secondary mb-2">
                Join Our Mission
              </span>
              <h3 className="font-outfit text-[28px] md:text-[36px] lg:text-[42px] font-[700] text-white leading-[1.15] mb-3 tracking-tight max-w-[420px]">
                Become A Volunteer
              </h3>
              <p className="text-white/90 text-[15px] md:text-[17px] font-normal leading-[1.7] mb-6 max-w-[420px]">
                Join Cancer Aware Bharat as a volunteer and help spread cancer awareness, support screening camps, and make a meaningful impact in communities across India.
              </p>
              <button 
                onClick={() => navigate('/volunteer/login')}
                className="bg-primary text-white text-[15px] md:text-[16px] font-medium h-[48px] md:h-[52px] rounded-full px-7 md:px-8 flex items-center justify-center gap-2 hover:bg-primary-container hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group/btn"
              >
                Become a Volunteer <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Center Panel: Image with Play Button */}
          <div className="relative flex-1 group min-h-[400px] z-0">
            <img src="/dr-ajay-kumar.jpg" alt="Cancer Awareness" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-[90px] h-[90px] lg:w-[100px] lg:h-[100px] rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-500 shadow-2xl animate-[pulse_3s_ease-in-out_infinite]">
                <Play className="w-8 h-8 lg:w-10 lg:h-10 text-white fill-white ml-2 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
          </div>

          {/* Right Panel: Hospital Partner */}
          <div className="torn-right relative flex-1 group min-h-[400px] z-10 -mt-8 lg:mt-0 lg:-ml-8">
            <img src="/events/event-4.jpeg" alt="Partner" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/45 transition-colors duration-500" />
            <div className="absolute inset-0 p-8 md:p-12 lg:pl-16 flex flex-col justify-center items-start text-left z-10">
              <span className="inline-block text-[12px] md:text-[13px] font-medium uppercase tracking-[0.15em] text-secondary mb-2">
                Partner With Us
              </span>
              <h3 className="font-outfit text-[28px] md:text-[36px] lg:text-[42px] font-[700] text-white leading-[1.15] mb-3 tracking-tight max-w-[420px]">
                Become A Health Centre Partner
              </h3>
              <p className="text-white/90 text-[15px] md:text-[17px] font-normal leading-[1.7] mb-6 max-w-[420px]">
                Join our nationwide network of hospitals, clinics, diagnostic centres, and healthcare institutions working together to improve cancer awareness, early detection, and patient support.
              </p>
              <button 
                onClick={() => navigate('/hospital/login')}
                className="bg-primary text-white text-[15px] md:text-[16px] font-medium h-[48px] md:h-[52px] rounded-full px-7 md:px-8 flex items-center justify-center gap-2 hover:bg-primary-container hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group/btn"
              >
                Partner as Health Centre <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>

      <TeamShowcase />

      {/* ═══════════════════════════════════════════
          SECTION 10.2: TYPES OF CANCER WE ADDRESS
          ═══════════════════════════════════════════ */}
      <section className="gradient-light py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">Cancer Awareness</span>
              <h2 className="section-title text-2xl md:text-3xl">Types of Cancer We Address</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Early detection can save lives. Learn about the most common cancers affecting people across India.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                icon: Stethoscope, color: 'text-secondary', bg: 'bg-slate-50',
                title: 'Oral Cancer', titleHi: 'मुख कैंसर', badge: '#1 in Indian Men'
              },
              {
                icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50',
                title: 'Breast Cancer', titleHi: 'स्तन कैंसर', badge: '#1 in Indian Women'
              },
              {
                icon: Microscope, color: 'text-purple-500', bg: 'bg-purple-50',
                title: 'Cervical Cancer', titleHi: 'गर्भाशय कैंसर', badge: 'HPV Preventable'
              },
              {
                icon: Activity, color: 'text-primary', bg: 'bg-slate-50',
                title: 'Lung Cancer', titleHi: 'फेफड़ों का कैंसर', badge: 'Tobacco Linked'
              },
              {
                icon: Droplet, color: 'text-red-600', bg: 'bg-red-50',
                title: 'Blood Cancer', titleHi: 'रक्त कैंसर', badge: 'Early Signs Matter'
              }
            ].map((cancer, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="card-premium h-full flex flex-col justify-between p-6 group hover:-translate-y-2 transition-all duration-300 border border-outline-variant/30 hover:border-primary/30">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl ${cancer.bg} ${cancer.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <cancer.icon className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <span className="inline-block px-2.5 py-1 mb-3 rounded-lg bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {cancer.badge}
                    </span>

                    <h3 className="font-outfit text-primary text-lg font-bold leading-tight mb-1">
                      {cancer.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium mb-6">
                      {cancer.titleHi}
                    </p>
                  </div>
                  
                  <button className="text-left text-xs font-bold text-secondary flex items-center gap-1 group-hover:text-primary transition-colors">
                    Learn More <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 11: FAQ
          ═══════════════════════════════════════════ */}
      <section className="gradient-section py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge"><HelpCircle className="w-3 h-3" /> FAQ</span>
              <h2 className="section-title text-2xl md:text-3xl">Frequently Asked Questions</h2>
              <p className="section-subtitle">Get answers to common questions about our services and programs.</p>
            </div>
          </RevealSection>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 60}>
                <FAQItem
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 12: NEWSLETTER
          ═══════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="max-w-2xl mx-auto text-center">
              <span className="section-badge mx-auto"><Mail className="w-3 h-3" /> Newsletter</span>
              <h2 className="section-title text-2xl md:text-3xl mt-3">Stay Updated</h2>
              <p className="section-subtitle mt-2 mb-8">
                Get cancer awareness tips, event updates, and health guides delivered to your inbox.
              </p>

              {!newsletterSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="input-premium flex-1"
                  />
                  <button
                    onClick={() => {
                      if (newsletterEmail.includes('@')) setNewsletterSubmitted(true);
                    }}
                    className="btn-primary !rounded-xl shrink-0"
                  >
                    <Mail className="w-4 h-4" /> Subscribe
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-sm font-medium inline-flex items-center gap-2 animate-scale-in">
                  <CheckCircle2 className="w-5 h-5 text-primary-container" />
                  Thank you! You'll receive our updates soon.
                </div>
              )}

              <p className="text-xs text-on-surface-variant/60 mt-3">No spam, unsubscribe anytime. We respect your privacy.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 13: FULL-WIDTH CTA
          ═══════════════════════════════════════════ */}
      <section className="gradient-hero py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white rounded-full" />
        </div>

        <div className="section-container relative z-10 text-center">
          <RevealSection>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-xs font-semibold tracking-wide border border-white/10 mb-6">
              <Heart className="w-3.5 h-3.5 fill-white" /> Make a Difference Today
            </span>
            <h2 className="font-outfit text-white text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl mx-auto mb-5">
              Join Our Mission to <span className="text-secondary-container">Fight Cancer</span> Across India
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Whether you're a healthcare professional, a caring individual, or an organization — together we can ensure no patient faces cancer alone.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={onOpenVolunteer} className="px-7 py-3.5 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 shadow-lg transition-all cursor-pointer hover:translate-y-[-2px] hover:shadow-xl flex items-center gap-2">
                <Heart className="w-4 h-4" /> Become a Volunteer
              </button>
              <button onClick={onOpenEnquiry} className="px-7 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-2">
                <Phone className="w-4 h-4" /> Patient Enquiry
              </button>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
