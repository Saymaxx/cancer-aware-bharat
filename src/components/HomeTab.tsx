import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, Heart, Award, ChevronRight, ChevronLeft, Activity, HelpCircle,
  CheckCircle2, Microscope, HeartHandshake, BookOpen, ArrowRight, Shield, Users, MapPin,
  Phone, Stethoscope, Star, Quote, ChevronDown, Mail,
  Sun, Apple, Cigarette, Dumbbell, Syringe, Search as SearchIcon, Target,
  ClipboardCheck, UserCheck, Compass, HeartPulse, Droplet, Play,
  Plus, Building, Clock, Sparkles, ShieldCheck, PhoneCall, Radio
} from 'lucide-react';
import { useEvents } from '../api/hooks';
import TeamShowcase from './TeamShowcase';
import PremiumSection from './common/PremiumSection';
import { Facebook, Instagram, Youtube } from './icons/SocialIcons';

/* ═══════════════════════════════════════════
   HERO SLIDES DATA (Bilingual Hindi + English)
   ═══════════════════════════════════════════ */
const CAROUSEL_SLIDES = [
  {
    image: '/dr-ajay-kumar.jpg',
    tag: 'डॉक्टर नेटवर्क',
    tagEn: 'Doctor Network',
    badgeText: 'विशेषज्ञ ऑन्कोलॉजी परामर्श',
    titleLine1: 'विशेषज्ञ कैंसर देखभाल',
    titleLine2: 'आपके निकट',
    subtitleEn: 'Connecting patients across India with premier oncology specialists, hospitals & direct second opinions.',
    desc: 'भारत भर के मरीजों को प्रमुख ऑन्कोलॉजी विशेषज्ञों और विश्वसनीय स्वास्थ्य केंद्रों से जोड़ना।',
    primaryBtn: 'विशेषज्ञ खोजें',
    secondaryBtn: 'मरीज पूछताछ',
    primaryAction: 'events',
    secondaryAction: 'enquiry',
    objectPosition: 'center 15%',
    alt: 'डॉ. अजय कुमार - विशेषज्ञ कैंसर देखभाल',
    dawnTheme: 'gradient-dawn-1',
    highlightStat: '14,250+ Screened',
    accentColor: '#E8A23A'
  },
  {
    image: '/hero/hero-new-2.png',
    tag: 'सामुदायिक जागरूकता',
    tagEn: 'Community Outreach',
    badgeText: 'रोकथाम और प्रारंभिक पहचान',
    titleLine1: 'जागरूकता से सशक्त',
    titleLine2: 'बनता भारत',
    subtitleEn: 'Comprehensive grassroots awareness and clinical education campaigns for early symptom detection.',
    desc: 'कैंसर के शुरुआती लक्षणों की पहचान के लिए व्यापक जागरूकता और शिक्षा अभियान।',
    primaryBtn: 'अभियान देखें',
    secondaryBtn: 'हमारे साथ जुड़ें',
    primaryAction: 'events',
    secondaryAction: 'volunteer',
    objectPosition: 'center 30%',
    alt: 'जागरूकता से सशक्त बनता भारत',
    dawnTheme: 'gradient-dawn-2',
    highlightStat: '180+ Camps Held',
    accentColor: '#7C9A82'
  },
  {
    image: '/hero/hero-new-3.png',
    tag: 'निःशुल्क जांच शिविर',
    tagEn: 'Free Screening Camps',
    badgeText: 'गाँव और शहरों में सुलभ स्वास्थ्य',
    titleLine1: 'सुलभ कैंसर जांच',
    titleLine2: 'हर गांव और शहर में',
    subtitleEn: 'Delivering free doctor-led early detection screening camps directly to rural and underserved communities.',
    desc: 'ग्रामीण और वंचित क्षेत्रों तक सीधे निःशुल्क कैंसर जांच शिविर पहुंचाना।',
    primaryBtn: 'नजदीकी कैंप खोजें',
    secondaryBtn: 'सहयोग करें',
    primaryAction: 'events',
    secondaryAction: 'volunteer',
    objectPosition: 'center 25%',
    alt: 'सुलभ कैंसर जांच',
    dawnTheme: 'gradient-dawn-3',
    highlightStat: '100% Free Diagnostics',
    accentColor: '#E8A23A'
  },
  {
    image: '/hero/hero-new-4.jpg',
    tag: 'मरीज सहायता केंद्र',
    tagEn: 'Patient Support Centre',
    badgeText: 'निदान से उपचार तक संपूर्ण सहयोग',
    titleLine1: 'स्वास्थ्य और जीवन की',
    titleLine2: 'नई किरण',
    subtitleEn: 'Dedicated caseworkers and volunteers walking beside patients and families from diagnosis to recovery.',
    desc: 'निदान से लेकर संपूर्ण इलाज तक, हमारे समर्पित स्वयंसेवक हर कदम पर मरीजों के साथ हैं।',
    primaryBtn: 'अभी मदद पाएं',
    secondaryBtn: 'मिशन से जुड़ें',
    primaryAction: 'enquiry',
    secondaryAction: 'volunteer',
    objectPosition: 'center 20%',
    alt: 'मरीज सहायता केंद्र',
    dawnTheme: 'gradient-dawn-4',
    highlightStat: '1,240+ Navigations',
    accentColor: '#C8443C'
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
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─────────── FAQ Connected Item with Kantha Stitch Motif ─────────── */
function FAQItem({ q, a, isOpen, onToggle, isLast }: { q: string; a: string; isOpen: boolean; onToggle: () => void; isLast?: boolean }) {
  return (
    <div className="relative group">
      <div className={`rounded-2xl transition-all duration-300 border ${isOpen ? 'bg-white border-[#0E3B36]/30 shadow-md ring-1 ring-[#0E3B36]/10' : 'bg-white/80 border-[#D5DFD7] hover:border-[#7C9A82]'}`}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer focus:outline-none"
          aria-expanded={isOpen}
        >
          <span className={`font-serif text-[16px] md:text-[17px] font-bold pr-4 transition-colors ${isOpen ? 'text-[#0E3B36]' : 'text-[#1B2620]'}`}>
            {q}
          </span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-[#0E3B36] text-white' : 'bg-[#EEF3EF] text-[#0E3B36]'}`}>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        <div className={`overflow-hidden transition-all duration-350 ${isOpen ? 'max-h-[350px]' : 'max-h-0'}`}>
          <div className="px-5 pb-5 md:px-6 md:pb-6 text-sm md:text-[15px] text-[#4A5E54] leading-relaxed border-t border-[#D5DFD7]/50 pt-4">
            {a}
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="hidden md:block w-px h-4 kantha-connector-v mx-auto my-1" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DYNAMIC SCREENING CAMPS CAROUSEL (Sage -> Sindoor Capacity Bar)
   ═══════════════════════════════════════════ */
function deriveCampStatus(registered: number, capacity: number): { label: string; badgeBg: string; textCol: string } {
  if (capacity <= 0 || registered >= capacity) {
    return { label: 'Fully Booked', badgeBg: 'bg-slate-100 border-slate-300', textCol: 'text-slate-700' };
  }
  if ((capacity - registered) / capacity <= 0.2) {
    return { label: 'Almost Full', badgeBg: 'bg-[#FBEAE9] border-[#C8443C]/30', textCol: 'text-[#C8443C]' };
  }
  return { label: 'Registration Open', badgeBg: 'bg-[#EEF3EF] border-[#7C9A82]/30', textCol: 'text-[#0E3B36]' };
}

function UpcomingCampsCarousel({ onOpenEnquiry }: { onOpenEnquiry: () => void }) {
  const { events } = useEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.max(0, events.length - itemsPerView + 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) nextSlide();
    if (touchStartX.current - touchEndX.current < -50) prevSlide();
  };

  return (
    <PremiumSection variant="warm-1" withTopDivider="kantha">
      <RevealSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="section-badge">
              <Calendar className="w-3.5 h-3.5 text-[#E8A23A]" /> FREE SCREENING CAMPS
            </span>
            <h2 className="section-title text-3xl md:text-5xl">
              Upcoming Detection & Care Camps
            </h2>
            <p className="section-subtitle">
              Verified clinical camps delivering free early detection, specialist evaluation, and direct hospital navigation across Indian towns and villages.
            </p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={prevSlide}
              className="w-11 h-11 rounded-full bg-white border border-[#D5DFD7] text-[#0E3B36] flex items-center justify-center hover:bg-[#EEF3EF] hover:border-[#0E3B36] transition-all shadow-sm focus:outline-none cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-11 h-11 rounded-full bg-[#0E3B36] text-white flex items-center justify-center hover:bg-[#164E48] transition-all shadow-sm focus:outline-none cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </RevealSection>

      {/* Carousel Container */}
      <RevealSection delay={150}>
        <div 
          className="overflow-hidden mx-auto py-2 -mx-3 px-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}%))` }}
          >
            {events.map((camp, idx) => {
              const { label: statusLabel, badgeBg, textCol } = deriveCampStatus(camp.registeredCount, camp.capacity);
              const percentFull = camp.capacity > 0 ? Math.min(100, Math.round((camp.registeredCount / camp.capacity) * 100)) : 0;
              const isUrgent = percentFull >= 80;
              const campBgImage = camp.image || `/events/event-${(idx % 10) + 1}.jpeg`;

              return (
                <div
                  key={camp.id}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="h-full flex flex-col bg-white rounded-3xl overflow-hidden border border-[#D5DFD7] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400 group relative">
                    {/* Visual Card Image Header */}
                    <div className="relative h-48 md:h-52 overflow-hidden bg-[#EEF3EF]">
                      <img
                        src={campBgImage}
                        alt={camp.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E3B36]/85 via-[#0E3B36]/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                      
                      {/* Top Category Tag */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#0E3B36] text-[11px] font-bold shadow-sm">
                          {camp.category}
                        </span>
                      </div>

                      {/* Urgency Status Tag */}
                      <div className="absolute top-3.5 right-3.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-bold border ${badgeBg} ${textCol} backdrop-blur-md shadow-sm`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col flex-1 p-6 relative z-10 bg-white">
                      <h3 className="font-serif text-[18px] md:text-[20px] font-bold text-[#0E3B36] mb-3 line-clamp-2 leading-snug group-hover:text-[#E8A23A] transition-colors">
                        {camp.title}
                      </h3>

                      {/* Structured Side-Rail Details */}
                      <div className="space-y-2 mb-4 bg-[#FAFCF8] p-3.5 rounded-2xl border border-[#D5DFD7]/60 text-xs">
                        <div className="flex items-center gap-2 text-[#4A5E54] font-medium">
                          <Calendar className="w-4 h-4 text-[#E8A23A] shrink-0" />
                          <span className="font-semibold text-[#1B2620]">{camp.date}</span>
                          <span className="text-[#7A8E83]">•</span>
                          <Clock className="w-3.5 h-3.5 text-[#7A8E83] shrink-0" />
                          <span>{camp.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4A5E54] font-medium pt-1 border-t border-[#D5DFD7]/40">
                          <MapPin className="w-4 h-4 text-[#C8443C] shrink-0" />
                          <span className="truncate">{camp.location}</span>
                        </div>
                      </div>

                      <p className="text-[13px] text-[#4A5E54] line-clamp-2 leading-relaxed mb-6">
                        {camp.description}
                      </p>

                      <div className="mt-auto pt-2">
                        {/* Capacity Fill Meter */}
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                          <span className="text-[#4A5E54]">Slot Capacity</span>
                          <span className={isUrgent ? 'text-[#C8443C] font-bold' : 'text-[#0E3B36]'}>
                            {percentFull}% Full ({camp.registeredCount}/{camp.capacity})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#EEF3EF] rounded-full overflow-hidden mb-5">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isUrgent ? 'bg-gradient-to-r from-[#E8A23A] to-[#C8443C]' : 'bg-gradient-to-r from-[#7C9A82] to-[#0E3B36]'
                            }`}
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>

                        {/* Registration CTA */}
                        <button
                          onClick={onOpenEnquiry}
                          className="w-full btn-primary !py-2.5 !text-xs md:!text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <span>Register For Camp</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </RevealSection>
    </PremiumSection>
  );
}

/* ═══════════════════════════════════════════
   PANORAMIC FIELD GALLERY WITH TEAL VIGNETTE
   ═══════════════════════════════════════════ */
const PANORAMIC_GALLERY_DATA = [
  { id: 'g1', image: '/events/event-1.jpeg', title: 'Rural Community Outreach', location: 'Jaipur, Rajasthan', link: '/gallery' },
  { id: 'g2', image: '/events/event-2.jpeg', title: 'Women Oncology Screening', location: 'Pune, Maharashtra', link: '/gallery' },
  { id: 'g3', image: '/events/event-4.jpeg', title: 'Early Oral Health Checkup', location: 'Ahmedabad, Gujarat', link: '/gallery' },
  { id: 'g4', image: '/events/event-5.jpeg', title: 'Awareness Blood Drive', location: 'Lucknow, UP', link: '/gallery' },
  { id: 'g5', image: '/dr-ajay-kumar.jpg', title: 'Specialist Clinical Consultation', location: 'Varanasi, UP', link: '/gallery' },
];

function PanoramicGallerySection() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const scrollItems = [...PANORAMIC_GALLERY_DATA, ...PANORAMIC_GALLERY_DATA];

  return (
    <PremiumSection variant="warm-2" paddingClass="py-16 md:py-24">
      <div className="section-container relative z-10 mb-10">
        <RevealSection>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <span className="section-badge">
                <Sparkles className="w-3.5 h-3.5 text-[#E8A23A]" /> FIELD MOMENTS
              </span>
              <h2 className="section-title text-3xl md:text-5xl">
                Moments That Bring Hope & Healing
              </h2>
              <p className="section-subtitle">
                A documentary view of grassroots screening camps, volunteer interventions, and medical consultations across India.
              </p>
            </div>
            <button
              onClick={() => navigate('/gallery')}
              className="btn-secondary text-xs md:text-sm !py-2.5 !px-6 shrink-0 cursor-pointer"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </RevealSection>
      </div>

      <div className="w-full relative px-4 md:px-8 max-w-[1920px] mx-auto">
        <RevealSection delay={200}>
          <div 
            className="w-full h-[240px] md:h-[360px] lg:h-[440px] relative overflow-hidden rounded-3xl shadow-xl group/panorama border border-[#D5DFD7]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Ink-Teal Vignette Overlay for unified field tone */}
            <div className="absolute inset-0 z-20 pointer-events-none rounded-3xl shadow-[inset_0_0_60px_rgba(14,59,54,0.35)]" />
            
            <div 
              className="flex h-full w-max"
              style={{
                animation: `scrollPanorama 45s linear infinite`,
                animationPlayState: isHovered ? 'paused' : 'running'
              }}
            >
              {scrollItems.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="h-full w-[280px] md:w-[420px] lg:w-[480px] relative overflow-hidden flex-shrink-0 border-r border-white/20 group cursor-pointer"
                  onClick={() => navigate(item.link)}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E3B36]/95 via-[#0E3B36]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6 md:p-8">
                    <h3 className="font-serif text-white text-lg md:text-xl font-bold mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E8A23A]" /> {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>

      <style>{`
        @keyframes scrollPanorama {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </PremiumSection>
  );
}

/* ═══════════════════════════════════════════
   TESTIMONIALS CAROUSEL
   ═══════════════════════════════════════════ */
const TESTIMONIALS_DATA = [
  {
    id: 't-1',
    image: '/dr-ajay-kumar.jpg',
    name: 'Dr. Meena Gupta',
    designation: 'Consultant Oncologist',
    organization: 'Cancer Aware Bharat Panel',
    rating: 5,
    reviewHindi: 'जांच शिविरों के माध्यम से कैंसर के शुरुआती लक्षणों को समय पर पहचानना संभव हुआ है। हर मरीज को सही दिशा और इलाज मिला।',
    review: 'The free cancer screening camp helped detect early-stage cases. Our doctors and volunteers guided patients through every step with compassion.'
  },
  {
    id: 't-2',
    image: '/dr-ajay-kumar.jpg',
    name: 'Rajesh Sharma',
    designation: 'Community Volunteer',
    organization: 'Delhi Outreach Team',
    rating: 5,
    reviewHindi: 'गांव-गांव तक जागरूकता अभियान पहुंचाना और मरीजों को अस्पतालों से जोड़ना वास्तव में एक नया जीवन देने जैसा है।',
    review: 'The grassroots awareness program in our village educated hundreds of families on early symptoms. Being part of this mission is truly fulfilling.'
  },
  {
    id: 't-3',
    image: '/dr-ajay-kumar.jpg',
    name: 'Priya Verma',
    designation: 'Patient Support Beneficiary',
    organization: 'Pune Screening Camp',
    rating: 5,
    reviewHindi: 'समय पर जांच और डॉक्टरों के सही मार्गदर्शन ने मेरे इलाज को आसान बनाया। टीम का सहयोग सराहनीय रहा।',
    review: 'Smooth coordination and accurate specialist referral. The emotional and clinical guidance was invaluable for my family.'
  },
  {
    id: 't-4',
    image: '/dr-neha-sharma.jpg',
    name: 'Dr. Neha Sharma',
    designation: 'Radiation Oncologist',
    organization: 'Empaneled Hospital Partner',
    rating: 5,
    reviewHindi: 'कैंसर अवेयर भारत के साथ जुड़कर हम वंचित क्षेत्रों तक आधुनिक परामर्श और त्वरित जांच पहुंचा रहे हैं।',
    review: 'Collaborating on grassroots detection brings advanced oncology consultation and timely treatment to underserved communities.'
  },
  {
    id: 't-5',
    image: '/dr-rahul-singh.jpg',
    name: 'Anil Kumar',
    designation: 'Caregiver Advocate',
    organization: 'Varanasi Camp',
    rating: 5,
    reviewHindi: 'आयुष्मान भारत योजना और सही अस्पताल तक पहुंचाने में टीम ने हर मोड़ पर हमारा साथ दिया।',
    review: 'The dedicated patient navigation support guided our family through government financial schemes and prompt hospital admission.'
  }
];

function TestimonialsCarousel() {
  return (
    <PremiumSection variant="warm-1" withTopDivider="kantha">
      <div className="section-container relative z-10">
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">
              <Heart className="w-3.5 h-3.5 text-[#E8A23A]" /> VOICES OF HOPE
            </span>
            <h2 className="section-title text-3xl md:text-5xl">
              Stories of Resilience & Care
            </h2>
            <p className="section-subtitle">
              Authentic reflections from patients, caregivers, volunteer advocates, and partnering oncologists.
            </p>
          </div>
        </RevealSection>

        {/* Continuous Moving Marquee with Pause on Hover */}
        <div className="relative overflow-hidden py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 group">
          {/* Soft Edge Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-[#F3F6F1] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-[#F3F6F1] to-transparent pointer-events-none z-10" />

          <div className="flex animate-marquee hover:[animation-play-state:paused] [animation-duration:32s] w-max">
            {[...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 px-3 py-2"
              >
                <div className="h-full flex flex-col bg-white rounded-3xl p-6 sm:p-7 border border-[#D5DFD7] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group/card">
                  {/* Marigold Star Rating & Kantha Quote Motif */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#E8A23A] text-[#E8A23A]" />
                      ))}
                    </div>
                    <Quote className="w-7 h-7 text-[#7C9A82]/30 group-hover/card:text-[#E8A23A]/40 transition-colors" />
                  </div>

                  {/* Hindi Quote */}
                  <p className="font-serif-hindi text-[14.5px] text-[#0E3B36] font-semibold leading-relaxed mb-2.5">
                    "{item.reviewHindi}"
                  </p>

                  {/* English Translation */}
                  <p className="text-[13px] text-[#4A5E54] leading-relaxed mb-5 flex-1 font-light">
                    {item.review}
                  </p>

                  {/* Profile Signature */}
                  <div className="flex items-center gap-3 pt-3.5 border-t border-[#D5DFD7]/60 mt-auto">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#D5DFD7] bg-[#EEF3EF]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-[#0E3B36] text-[14px] truncate">{item.name}</h4>
                      <p className="text-[11px] text-[#7A8E83] font-medium truncate">
                        {item.designation} • <span className="text-[#0E3B36] font-semibold">{item.organization}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PremiumSection>
  );
}

/* ═══════════════════════════════════════════
   FINAL REPRISE CTA (Clean, Minimalist & Focused)
   ═══════════════════════════════════════════ */
function SunriseRepriseCtaSection({ onOpenVolunteer, onOpenEnquiry }: { onOpenVolunteer: () => void; onOpenEnquiry: () => void }) {
  return (
    <section className="relative py-14 md:py-16 overflow-hidden bg-[#0E3B36] text-white border-t border-[#164E48]">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[260px] bg-[#E8A23A]/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <RevealSection>
          {/* Headline */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3">
            Join Our Mission Against Cancer
          </h2>
          
          {/* Brief Subtitle */}
          <p className="text-white/80 text-sm sm:text-base mb-6 font-light max-w-lg mx-auto leading-relaxed">
            Connecting communities with free screenings, specialist evaluations, and full-cycle patient care.
          </p>

          {/* Simple Primary Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button 
              onClick={onOpenEnquiry}
              className="btn-marigold text-xs sm:text-sm !py-2.5 !px-6 cursor-pointer shadow-md font-bold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
            </button>
            <button 
              onClick={onOpenVolunteer}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#E8A23A]" />
              <span>Become a Volunteer</span>
            </button>
          </div>

          {/* Social Icons CTA */}
          <div className="flex items-center justify-center gap-3 pt-5 border-t border-white/10">
            <a 
              href="https://instagram.com/cancerawarebharat" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E8A23A] text-white hover:text-[#1B2620] flex items-center justify-center transition-all duration-200 border border-white/20 hover:scale-105"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://facebook.com/cancerawarebharat" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E8A23A] text-white hover:text-[#1B2620] flex items-center justify-center transition-all duration-200 border border-white/20 hover:scale-105"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="https://youtube.com/@cancerawarebharat" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Subscribe on YouTube"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E8A23A] text-white hover:text-[#1B2620] flex items-center justify-center transition-all duration-200 border border-white/20 hover:scale-105"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN HOMETAB COMPONENT
   ═══════════════════════════════════════════ */
interface HomeTabProps {
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function HomeTab({ onOpenVolunteer, onOpenEnquiry }: HomeTabProps) {
  const navigate = useNavigate();

  // Hero carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev <= 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const slideInterval = setInterval(() => {
      handleNextSlide();
    }, 5500);
    return () => clearInterval(slideInterval);
  }, [activeSlide, isPaused]);

  const faqs = [
    { 
      q: 'Are the screening camps really free of cost?', 
      a: 'Yes, all screening camps conducted by Cancer Aware Bharat are 100% free of cost for patients. We partner with leading healthcare institutions and philanthropic organizations to cover diagnostic tests, basic pathology, mammography, and specialist consultations.' 
    },
    { 
      q: 'How do I register for an upcoming screening camp in my city?', 
      a: 'You can register online through our Patient Enquiry form, call our 24/7 Helpline (+91-9120110286), or check the Screening Camps schedule on the Events page to secure an appointment slot.' 
    },
    { 
      q: 'Can I join as a volunteer without medical qualifications?', 
      a: 'Absolutely. We welcome volunteers from all backgrounds. Volunteers support camp logistics, community education, patient navigation, and registration assistance. Complete orientation and training are provided.' 
    },
    { 
      q: 'What is the patient navigation support service?', 
      a: 'When an abnormal screening result is detected, our trained patient navigators guide the family through secondary biopsies, expert second opinions, hospital appointments, and relevant government financial aid schemes (e.g. PMJAY/Ayushman Bharat).' 
    },
    { 
      q: 'Which states does Cancer Aware Bharat currently operate in?', 
      a: 'We actively run screening camps and awareness drives across Delhi-NCR, Maharashtra, Uttar Pradesh, Gujarat, Madhya Pradesh, and Karnataka, with nationwide hospital navigation coverage.' 
    },
    { 
      q: 'How can hospitals and diagnostic centres partner with the network?', 
      a: 'Institutions can register through our Hospital Partner Portal. We collaborate with healthcare facilities committed to ethical oncology practices and community health access.' 
    },
  ];

  return (
    <div className="space-y-0 bg-[#F3F6F1]">

      {/* ═══════════════════════════════════════════
          SECTION 1: BRIGHT & WARM EDITORIAL HERO (One Medical / Mayo Clinic style)
          ═══════════════════════════════════════════ */}
      <section 
        className="relative min-h-[660px] lg:min-h-[740px] bg-[#F3F6F1] text-[#1B2620] flex flex-col justify-between overflow-hidden pt-8 md:pt-12 pb-16 md:pb-20 border-b border-[#D5DFD7]/60"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft Warm Radial Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#E8A23A]/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-[#7C9A82]/12 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#EEF3EF] rounded-full blur-[100px]" />
        </div>

        {/* ── Main Hero Content Stage (Synchronized 7:5 Editorial & Visual Ratio) ── */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-start pt-3 sm:pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            
            {/* LEFT COLUMN: Editorial Typography & High-Converting Action (7 Cols) - Top Left Aligned */}
            <div className="lg:col-span-7 flex flex-col justify-start space-y-3.5 pr-0 lg:pr-2 pt-1 sm:pt-2">
              
              {/* Live Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5DFD7] shadow-sm w-fit">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8A23A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8A23A]"></span>
                </span>
                <span className="text-[11.5px] font-bold text-[#0E3B36] uppercase tracking-wider">
                  {CAROUSEL_SLIDES[activeSlide].badgeText}
                </span>
                <span className="text-[#7A8E83]">•</span>
                <span className="text-[#4A5E54] text-xs font-semibold">100% Free Diagnostics</span>
              </div>

              {/* Main Headline Pairing */}
              <h1 className="font-serif text-[#0E3B36] text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.14] tracking-tight" key={`bright-h1-${activeSlide}`}>
                <span className="font-serif-hindi block text-[#0E3B36]">
                  {CAROUSEL_SLIDES[activeSlide].titleLine1}
                </span>
                <span className="font-serif-hindi block text-[#E8A23A] mt-1">
                  {CAROUSEL_SLIDES[activeSlide].titleLine2}
                </span>
              </h1>

              {/* Subtitle & Narrative */}
              <p className="text-[#4A5E54] text-base sm:text-lg font-normal leading-relaxed" key={`bright-desc-${activeSlide}`}>
                {CAROUSEL_SLIDES[activeSlide].desc}
              </p>
              <p className="text-[#7A8E83] text-xs sm:text-sm italic font-light leading-relaxed">
                {CAROUSEL_SLIDES[activeSlide].subtitleEn}
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => {
                    const act = CAROUSEL_SLIDES[activeSlide].primaryAction;
                    if (act === 'volunteer') onOpenVolunteer();
                    else if (act === 'enquiry') onOpenEnquiry();
                    else navigate('/events');
                  }}
                  className="btn-marigold text-xs sm:text-sm !py-3.5 !px-8 cursor-pointer shadow-[0_6px_24px_rgba(232,162,58,0.35)] hover:shadow-[0_8px_32px_rgba(232,162,58,0.45)] font-bold flex items-center gap-2.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{CAROUSEL_SLIDES[activeSlide].primaryBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const act = CAROUSEL_SLIDES[activeSlide].secondaryAction;
                    if (act === 'enquiry') onOpenEnquiry();
                    else if (act === 'volunteer') onOpenVolunteer();
                    else navigate('/mission');
                  }}
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-[#EEF3EF] border border-[#0E3B36] text-[#0E3B36] font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-[#C8443C]" />
                  <span>{CAROUSEL_SLIDES[activeSlide].secondaryBtn}</span>
                </button>
              </div>

              {/* Social Proof Trust Strip */}
              <div className="pt-4 border-t border-[#D5DFD7] flex flex-wrap items-center gap-6 sm:gap-7 text-xs text-[#4A5E54]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-[#0E3B36]">14,250+</span>
                  <span>Lives Screened</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E8A23A]" />
                  <span className="font-bold text-[#0E3B36]">45+</span>
                  <span>Hospital Partners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#7C9A82]" />
                  <span className="font-bold text-[#0E3B36]">100%</span>
                  <span>Ethical Care</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Grand Emotive Doctor-Patient Visual Card (5 Cols, Aspect 4/5) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#D5DFD7] aspect-[4/5] w-full bg-[#1B2620] group flex flex-col justify-end">
                
                {/* Visual Slide */}
                {CAROUSEL_SLIDES.map((slide, idx) => {
                  const isActive = idx === activeSlide;
                  return (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                          isActive ? 'scale-105' : 'scale-100'
                        }`}
                        style={{ objectPosition: slide.objectPosition || 'center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E3B36]/90 via-[#0E3B36]/15 to-transparent" />
                    </div>
                  );
                })}

                {/* Floating Top Left Pill */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#D5DFD7] text-[#0E3B36] text-xs font-bold shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8A23A]" />
                  <span>{CAROUSEL_SLIDES[activeSlide].tag}</span>
                </div>

                {/* Floating Top Right Pill */}
                <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-[#E8A23A] text-[#1B2620] text-xs font-extrabold shadow-md">
                  {CAROUSEL_SLIDES[activeSlide].highlightStat}
                </div>

                {/* Floating Bottom Glass Stage */}
                <div className="relative z-20 m-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D5DFD7] flex items-center justify-between gap-3 shadow-lg">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8A23A]">
                        National Outreach
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h4 className="font-serif text-[#0E3B36] text-xs sm:text-sm font-bold truncate">
                      {CAROUSEL_SLIDES[activeSlide].titleLine1} — {CAROUSEL_SLIDES[activeSlide].titleLine2}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrevSlide}
                      aria-label="Previous Slide"
                      className="w-9 h-9 rounded-full bg-[#EEF3EF] hover:bg-[#E8A23A] text-[#0E3B36] hover:text-[#1B2620] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      aria-label="Next Slide"
                      className="w-9 h-9 rounded-full bg-[#0E3B36] hover:bg-[#E8A23A] text-white hover:text-[#1B2620] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════
          SECTION 1.1: CLEAN CLINICAL TRIAGE & CONSULTATION CTA
          ═══════════════════════════════════════════ */}
      <div className="relative z-30 -mt-8 md:-mt-10 mb-10 px-4 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_16px_40px_rgba(14,59,54,0.08)] border border-[#D5DFD7]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Simple 2-Line Info */}
            <div className="text-center lg:text-left">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0E3B36] tracking-tight">
                Need Cancer Guidance or Second Opinion?
              </h3>
              <p className="text-sm sm:text-base text-[#4A5E54] font-light mt-1">
                Speak directly with senior oncologists and patient caseworkers across India.
              </p>
            </div>

            {/* Actions: Book Free Consultation, Phone Number, Big Brand Social Icons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4 shrink-0 w-full lg:w-auto">
              
              {/* Book Free Consultation Button */}
              <button
                type="button"
                onClick={onOpenEnquiry}
                className="btn-marigold !py-3 !px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Free Consultation</span>
              </button>

              {/* Phone Number */}
              <a
                href="tel:+919120110286"
                className="px-5 py-3 rounded-full border-2 border-[#0E3B36] text-[#0E3B36] text-xs sm:text-sm font-bold hover:bg-[#EEF3EF] transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-4 h-4 text-[#0E3B36]" />
                <span>+91-9120110286</span>
              </a>

              {/* Big Original Color Social Icons */}
              <div className="flex items-center gap-2.5">
                <a 
                  href="https://instagram.com/cancerawarebharat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg transition-all duration-200 shrink-0"
                >
                  <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a 
                  href="https://facebook.com/cancerawarebharat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg transition-all duration-200 shrink-0"
                >
                  <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a 
                  href="https://youtube.com/@cancerawarebharat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="YouTube"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg transition-all duration-200 shrink-0"
                >
                  <Youtube className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 1.5: TRUSTED BY LOGO STRIP (Paper Band with Grayscale Hover)
          ═══════════════════════════════════════════ */}
      <section className="bg-[#F3F6F1] border-b border-[#D5DFD7]/60 py-6 overflow-hidden">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A8E83] mb-4">
          Trusted Institutional & Hospital Collaborations
        </p>

        <div className="relative w-full max-w-[1440px] mx-auto flex items-center">
          <div className="animate-marquee hover:[animation-play-state:paused] flex items-center w-max [animation-duration:35s]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-12 md:space-x-16 px-6 shrink-0">
                {[
                  { name: 'Apex Oncology Network', icon: Activity },
                  { name: 'National Health Foundation', icon: Shield },
                  { name: 'CareWell Cancer Centres', icon: Building },
                  { name: 'MediTech Diagnostics Panel', icon: Microscope },
                  { name: 'IMS-BHU Clinical Network', icon: Award },
                  { name: 'Global Care Foundation', icon: HeartHandshake },
                ].map((partner, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-[#7A8E83] hover:text-[#0E3B36] transition-all duration-300 cursor-pointer grayscale hover:grayscale-0"
                  >
                    <partner.icon className="w-6 h-6 shrink-0" strokeWidth={1.5} />
                    <span className="font-serif font-bold text-[15px] md:text-[17px] tracking-tight whitespace-nowrap">
                      {partner.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2.5: CLINICAL LEADERSHIP SPOTLIGHT
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-2" paddingClass="py-16 md:py-24">
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Doctor Photo & Badges (5 cols) */}
            <div className="lg:col-span-5 relative">
              <RevealSection>
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#D5DFD7] bg-white group">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-[#EEF3EF]">
                    <img
                      src="/dr-ajay-kumar.jpg"
                      alt="Dr. Ajay Kumar - Senior Surgical Oncologist"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E3B36]/90 via-transparent to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="kantha-tag">
                      <Award className="w-3.5 h-3.5" /> Gold Medalist • IMS-BHU
                    </span>
                  </div>

                  {/* Doctor Title */}
                  <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                    <p className="font-serif text-xl font-bold leading-tight">Dr. Ajay Kumar</p>
                    <p className="text-xs text-[#E8A23A] font-medium mt-0.5">Senior Surgical Oncologist • Cancer Aware Bharat Panel</p>
                  </div>
                </div>
              </RevealSection>
            </div>

            {/* Right Column: Bio & Actions (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-5">
              <RevealSection delay={150}>
                <span className="section-badge">
                  <Stethoscope className="w-3.5 h-3.5 text-[#E8A23A]" /> CHIEF CLINICAL MENTOR
                </span>

                <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl">
                  Know More About
                  <span className="text-[#E8A23A] block mt-1">Dr. Ajay Kumar</span>
                </h2>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#1B2620] bg-[#EEF3EF] px-3 py-1 rounded-full border border-[#D5DFD7]">
                    MBBS, MS, MCh (Surgical Oncology) IMS-BHU Varanasi
                  </span>
                  <span className="text-xs font-bold text-[#0E3B36] bg-[#FDF4E5] px-3 py-1 rounded-full border border-[#E8A23A]/40">
                    UP Ratna & Kashi Ratna Honored
                  </span>
                </div>

                <p className="text-[#4A5E54] text-sm sm:text-base leading-relaxed">
                  Cancer Aware Bharat unites renowned surgical oncologists, medical specialists, and compassionate healthcare workers dedicated to early detection and patient-centric oncology care. With a track record of evaluating and navigating thousands of patients, our mission ensures clinical excellence with deep human empathy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                  {[
                    'Evidence-Based Screening Protocols',
                    'Empaneled Specialist Guidance',
                    'Direct Hospital Referral Pathways',
                    'Comprehensive Patient Navigation'
                  ].map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[#1B2620] text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#7C9A82] shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                  <button
                    onClick={onOpenEnquiry}
                    className="btn-primary !py-3 !px-7 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Your Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/doctors')}
                    className="btn-secondary !py-3 !px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Explore Specialist Panel</span>
                  </button>
                </div>
              </RevealSection>
            </div>

          </div>
        </div>
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 3: CORE PROGRAMS (Asymmetric 3-Column Linework With Visual Cards)
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-1">
        <div className="section-container relative z-10">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">
                <Target className="w-3.5 h-3.5 text-[#E8A23A]" /> CORE INITIATIVES
              </span>
              <h2 className="section-title text-3xl md:text-5xl">
                Programs That Bridge The Healthcare Divide
              </h2>
              <p className="section-subtitle">
                From early screening to second opinions and financial scheme navigation, we ensure patients receive complete care.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Microscope,
                badge: 'Oral & General Oncology',
                title: 'Early Cancer Screening Camps',
                desc: 'Doctor-led clinical screening camps across rural and urban communities for early identification of Oral, Breast, and Cervical anomalies with referral pathways.',
                image: '/programs/screening-camp.jpg',
                action: 'Book Screening'
              },
              {
                icon: HeartPulse,
                badge: 'Patient Navigation',
                title: 'Caseworker Patient Navigation',
                desc: 'Dedicated caseworkers assist families through biopsy interpretation, specialist consultations, treatment planning, and government welfare scheme enrollments.',
                image: '/programs/patient-navigation.jpg',
                action: 'Get Navigation'
              },
              {
                icon: Stethoscope,
                badge: 'Clinical Oncology',
                title: 'Specialist Second Opinions',
                desc: 'Access our panel of senior surgical oncologists for independent evaluation and treatment verification before major surgical or chemotherapy interventions.',
                image: '/programs/second-opinion.jpg',
                action: 'Request Opinion'
              }
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 90}>
                <div 
                  onClick={() => {
                    if (item.action.includes('Screening') || item.action.includes('Camp')) navigate('/events');
                    else onOpenEnquiry();
                  }}
                  className="card-clinical h-full p-0 flex flex-col justify-between group cursor-pointer bg-white overflow-hidden rounded-3xl border border-[#D5DFD7] shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Card Visual Header with Image */}
                  <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-[#EEF3EF]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E3B36]/80 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Badge Pill on Image */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-white/95 backdrop-blur-md text-[#0E3B36] border border-[#D5DFD7] shadow-sm">
                        {item.badge}
                      </span>
                    </div>

                    {/* Icon Pill on Image */}
                    <div className="absolute bottom-3.5 right-3.5 z-10 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md text-[#0E3B36] flex items-center justify-center shadow-md group-hover:bg-[#E8A23A] group-hover:text-[#1B2620] transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-[#E8A23A] group-hover:text-[#1B2620]" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-[#0E3B36] text-[18px] md:text-[19px] font-bold mb-2.5 group-hover:text-[#E8A23A] transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-[13.5px] text-[#4A5E54] leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-[#D5DFD7]/60 flex items-center justify-between text-[#0E3B36] group-hover:text-[#E8A23A] transition-colors">
                      <span className="text-xs font-bold uppercase tracking-wider">{item.action}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 9: UPCOMING SCREENING CAMPS CAROUSEL
          ═══════════════════════════════════════════ */}
      <UpcomingCampsCarousel onOpenEnquiry={onOpenEnquiry} />

      {/* ═══════════════════════════════════════════
          SECTION 5: PANORAMIC FIELD MOMENTS GALLERY
          ═══════════════════════════════════════════ */}
      <PanoramicGallerySection />

      {/* ═══════════════════════════════════════════
          SECTION 8: WHY CHOOSE US? (Faithfully Designed from Dr. Ajay Kumar Clinical Portal)
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-2" withTopDivider="kantha">
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Visual Ribbon Card (5 Cols, Aspect 4/5 Matching Dr. Ajay Kumar Spotlight) */}
            <div className="lg:col-span-5 relative">
              <RevealSection>
                <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-[#D5DFD7] group bg-white aspect-[4/5] flex flex-col justify-end">
                  <img 
                    src="/why-choose-us.jpg" 
                    alt="Why Choose Us - Cancer Aware Bharat & Dr. Ajay Kumar" 
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E3B36]/85 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Top Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="kantha-tag">
                      <Award className="w-3.5 h-3.5 text-[#1B2620]" />
                      5,000+ Successfully Treated
                    </span>
                  </div>

                  {/* Floating Bottom Card */}
                  <div className="relative z-20 m-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D5DFD7] shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF3EF] flex items-center justify-center text-[#0E3B36] shrink-0">
                        <Sparkles className="w-5 h-5 text-[#E8A23A]" />
                      </div>
                      <div>
                        <h4 className="font-serif text-[#0E3B36] text-xs sm:text-sm font-bold">Gold Medalist Surgical Oncology</h4>
                        <p className="text-[11px] text-[#4A5E54]">IMS-BHU Varanasi • Ethical Clinical Care</p>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            </div>

            {/* Right Column: 4 Clinical Pillars (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <RevealSection delay={150}>
                
                <span className="section-badge">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E8A23A]" /> CLINICAL EXCELLENCE & INTEGRITY
                </span>
                
                <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mb-4">
                  Why Choose Us?
                </h2>

                {/* 4 Pillars Matching Reference Design */}
                <div className="space-y-3 mb-6">
                  
                  {/* Pillar 1 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5DFD7] shadow-xs hover:shadow-md hover:border-[#0E3B36]/30 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-4 h-4 text-[#E8A23A]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-[14.5px] sm:text-[15.5px] font-bold text-[#0E3B36] mb-0.5">
                          Expertise and Credentials
                        </h3>
                        <p className="text-[12px] sm:text-[12.5px] text-[#4A5E54] leading-relaxed font-light">
                          Led by Dr. Ajay Kumar, a Gold Medalist with MBBS, MS, and MCh degrees in Surgical Oncology from IMS-BHU, Varanasi, we bring unparalleled expertise and advanced training in cancer care. With over 5,000 successfully treated patients, you are in the hands of a trusted specialist.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5DFD7] shadow-xs hover:shadow-md hover:border-[#0E3B36]/30 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 mt-0.5">
                        <HeartPulse className="w-4 h-4 text-[#C8443C]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-[14.5px] sm:text-[15.5px] font-bold text-[#0E3B36] mb-0.5">
                          Comprehensive Cancer Care
                        </h3>
                        <p className="text-[12px] sm:text-[12.5px] text-[#4A5E54] leading-relaxed font-light">
                          We provide a holistic approach to cancer treatment, including advanced surgical techniques, personalized treatment plans, and compassionate care to support both patients and families at every stage of the journey.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5DFD7] shadow-xs hover:shadow-md hover:border-[#0E3B36]/30 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 mt-0.5">
                        <Building className="w-4 h-4 text-[#7C9A82]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-[14.5px] sm:text-[15.5px] font-bold text-[#0E3B36] mb-0.5">
                          State-of-the-Art Facilities
                        </h3>
                        <p className="text-[12px] sm:text-[12.5px] text-[#4A5E54] leading-relaxed font-light">
                          Our center is equipped with cutting-edge technology and infrastructure to deliver accurate diagnoses and effective treatments, ensuring the best possible outcomes for our patients.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pillar 4 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5DFD7] shadow-xs hover:shadow-md hover:border-[#0E3B36]/30 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF3EF] text-[#0E3B36] flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-4 h-4 text-[#E8A23A]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-[14.5px] sm:text-[15.5px] font-bold text-[#0E3B36] mb-0.5">
                          Patient-Centric Approach
                        </h3>
                        <p className="text-[12px] sm:text-[12.5px] text-[#4A5E54] leading-relaxed font-light">
                          We prioritize your comfort and care with a focus on early detection, timely intervention, and long-term support, ensuring you receive the best treatment with minimal stress.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button
                    onClick={onOpenEnquiry}
                    className="btn-primary !py-3 !px-7 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Your Free Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="tel:+919120110286"
                    className="px-6 py-3 rounded-full border border-[#0E3B36] text-[#0E3B36] text-xs sm:text-sm font-semibold hover:bg-[#EEF3EF] transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#0E3B36]" />
                    <span>+91-9120110286</span>
                  </a>
                </div>

              </RevealSection>
            </div>

          </div>
        </div>
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 10: TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <TestimonialsCarousel />

      {/* ═══════════════════════════════════════════
          SECTION 10.1: 3-PANEL PARTNERSHIPS
          Center panel has sindoor-to-marigold gradient overlay
          ═══════════════════════════════════════════ */}
      <section className="w-full bg-[#0E3B36] py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#164E48]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left Panel: Volunteer */}
          <div className="relative rounded-3xl overflow-hidden min-h-[400px] border border-white/15 flex flex-col justify-end p-8 bg-[#092824]">
            <img src="/events/event-1.jpeg" alt="Volunteer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 opacity-40" />
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E8A23A]">
                Join Our Mission
              </span>
              <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                Become A Community Volunteer
              </h3>
              <p className="text-white/85 text-sm leading-relaxed mb-4">
                Support camp coordination, patient registration, and spread lifesaving cancer awareness in your neighborhood.
              </p>
              <button 
                onClick={() => navigate('/volunteer/login')}
                className="btn-marigold text-xs sm:text-sm !py-2.5 !px-6 cursor-pointer"
              >
                <span>Volunteer Login / Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Panel: Video Story with Sindoor-to-Marigold Gradient Overlay */}
          <div className="relative rounded-3xl overflow-hidden min-h-[380px] border border-white/20 flex items-center justify-center p-8 group">
            <img src="/dr-ajay-kumar.jpg" alt="Cancer Awareness" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            {/* Sindoor to Marigold Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C8443C]/80 via-[#E8A23A]/50 to-transparent" />
            
            {/* Play Button */}
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-white text-[#0E3B36] flex items-center justify-center mx-auto shadow-2xl transition-transform duration-300 group-hover:scale-110 mb-3 cursor-pointer">
                <Play className="w-7 h-7 fill-[#0E3B36] ml-1" />
              </div>
              <p className="font-serif text-white text-lg font-bold">Watch Our Impact Story</p>
              <p className="text-white/80 text-xs mt-0.5">Free Camps Across India</p>
            </div>
          </div>

          {/* Right Panel: Hospital Partner */}
          <div className="relative rounded-3xl overflow-hidden min-h-[400px] border border-white/15 flex flex-col justify-end p-8 bg-[#092824]">
            <img src="/events/event-4.jpeg" alt="Partner" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 opacity-40" />
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E8A23A]">
                Healthcare Institutions
              </span>
              <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                Partner As A Health Centre
              </h3>
              <p className="text-white/85 text-sm leading-relaxed mb-4">
                Join our nationwide network of diagnostic centres and oncology hospitals to widen cancer care access.
              </p>
              <button 
                onClick={() => navigate('/hospital/login')}
                className="px-6 py-2.5 rounded-full border border-white/40 text-white text-xs sm:text-sm font-semibold hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Health Centre Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 10.2: MEDICAL ADVISORY BOARD
          ═══════════════════════════════════════════ */}
      <TeamShowcase />

      {/* ═══════════════════════════════════════════
          SECTION 11: CONNECTED FAQ (Kantha Connector Sequence)
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-1">
        <div className="section-container max-w-4xl mx-auto">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">
                <HelpCircle className="w-3.5 h-3.5 text-[#E8A23A]" /> CLARIFICATIONS
              </span>
              <h2 className="section-title text-3xl md:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="section-subtitle">
                Clear guidance on screening camps, patient navigation, and volunteer partnerships.
              </p>
            </div>
          </RevealSection>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 50}>
                <FAQItem
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  isLast={i === faqs.length - 1}
                />
              </RevealSection>
            ))}
          </div>
        </div>
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 13: SUNRISE REPRISE FINAL CTA
          ═══════════════════════════════════════════ */}
      <SunriseRepriseCtaSection onOpenVolunteer={onOpenVolunteer} onOpenEnquiry={onOpenEnquiry} />

    </div>
  );
}
