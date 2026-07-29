import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Heart, ShieldAlert, Award, ChevronRight, ChevronLeft, Activity, HelpCircle,
  CheckCircle2, Microscope, HeartHandshake, BookOpen, ArrowRight, Shield, Users, MapPin,
  Phone, Stethoscope, Star, Quote, ChevronDown, Mail, Sparkles,
  Sun, Apple, Cigarette, Dumbbell, Syringe, Search as SearchIcon,
  ClipboardCheck, UserCheck, Compass, HeartPulse, Droplet, Play,
  Facebook, Instagram, Linkedin, Twitter, Plus, Building, Clock
} from 'lucide-react';
import { INITIAL_EVENTS } from '../data';
import { Event } from '../types';
import TeamShowcase from './TeamShowcase';

const CAROUSEL_SLIDES = [
  {
    image: '/events/event-1.jpeg',
    tag: 'Live Campaign Highlight',
    titleLine1: 'Early Detection Saves',
    titleLine2: 'Thousands of Lives.',
    desc: 'Bringing health awareness, primary support and timely specialist referrals to every village across India. Our mission ensures no patient reaches the hospital too late due to lack of information.',
    title: 'Free Early Screening Detection Camp — Lions Club Grounds'
  },
  {
    image: '/events/event-2.jpeg',
    tag: 'Community Outreach',
    titleLine1: 'Saving Lives Through',
    titleLine2: 'Blood Donation.',
    desc: 'Every donation gives hope to cancer patients. Support blood donation initiatives that help hospitals maintain life-saving blood supplies for patients undergoing chemotherapy and cancer surgeries across India.',
    title: 'Mega Blood Donation Drive — City Hospital Community Hall'
  },
  {
    image: '/events/event-4.jpeg',
    tag: 'Support Workshops',
    titleLine1: 'Post-Treatment Nutrition',
    titleLine2: '& Recovery Guidance.',
    desc: 'Expert onco-nutritionists and physiotherapists guide cancer patients and families through specialised diet plans, yoga programmes and holistic rehabilitation workshops.',
    title: 'Nutrition Post-Treatment & Holistic Recovery Workshop'
  },
  {
    image: '/events/event-5.jpeg',
    tag: 'Educational Resources',
    titleLine1: 'Knowledge is the First',
    titleLine2: 'Step to Prevention.',
    desc: 'Free oral, breast and cervical cancer prevention health guides. Understand the earliest warning signs and protect your family through timely screening and awareness.',
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
   UPCOMING CAMPS CAROUSEL COMPONENT
   ═══════════════════════════════════════════ */
const UPCOMING_CAMPS_DATA = [
  {
    id: 'camp-1',
    title: 'Mega Rural Cancer Screening Camp',
    image: '/events/event-1.jpeg',
    category: 'Mega Camp',
    date: '15 Oct, 2026',
    time: '09:00 AM - 04:00 PM',
    city: 'Jaipur, Rajasthan',
    hospital: 'SMS Medical Hospital',
    desc: 'Comprehensive screening for oral, breast, and cervical cancer. Open to all rural residents.',
    status: 'Registration Open',
    statusColor: 'bg-green-100 text-green-700 border-green-200',
    capacity: 250,
    registered: 180,
    tags: ['Free', 'NABH Partner']
  },
  {
    id: 'camp-2',
    title: "Women's Breast Cancer Awareness Camp",
    image: '/events/event-2.jpeg',
    category: 'Awareness Drive',
    date: '22 Oct, 2026',
    time: '10:00 AM - 02:00 PM',
    city: 'Pune, Maharashtra',
    hospital: 'Ruby Hall Clinic',
    desc: 'Specialized awareness and mammography screening for early breast cancer detection.',
    status: 'Almost Full',
    statusColor: 'bg-orange-100 text-orange-700 border-orange-200',
    capacity: 100,
    registered: 85,
    tags: ['Women Only', 'Early Detection']
  },
  {
    id: 'camp-3',
    title: 'Oral Cancer Detection Drive',
    image: '/events/event-4.jpeg',
    category: 'Free Camp',
    date: '05 Nov, 2026',
    time: '08:00 AM - 01:00 PM',
    city: 'Ahmedabad, Gujarat',
    hospital: 'Civil Hospital',
    desc: 'Targeted tobacco-control awareness and oral cavity screening for high-risk individuals.',
    status: 'Upcoming',
    statusColor: 'bg-blue-100 text-blue-700 border-blue-200',
    capacity: 300,
    registered: 45,
    tags: ['Government Supported', 'Volunteer Needed']
  },
  {
    id: 'camp-4',
    title: 'Blood Donation & Oncology Support',
    image: '/events/event-5.jpeg',
    category: 'Medical Camp',
    date: '12 Nov, 2026',
    time: '09:00 AM - 05:00 PM',
    city: 'Lucknow, UP',
    hospital: 'KGMU',
    desc: 'Blood donation drive supporting leukemia patients. Join us to save lives.',
    status: 'Registration Open',
    statusColor: 'bg-green-100 text-green-700 border-green-200',
    capacity: 500,
    registered: 120,
    tags: ['Blood Donation', 'Free']
  },
  {
    id: 'camp-5',
    title: 'Community Health Check-up',
    image: '/dr-ajay-kumar.jpg',
    category: 'Health Camp',
    date: '20 Nov, 2026',
    time: '10:00 AM - 03:00 PM',
    city: 'Bhopal, MP',
    hospital: 'AIIMS Bhopal',
    desc: 'General health check-up including vital signs and basic cancer risk assessment.',
    status: 'Future Ready',
    statusColor: 'bg-purple-100 text-purple-700 border-purple-200',
    capacity: 200,
    registered: 0,
    tags: ['General Check-up']
  }
];

function UpcomingCampsCarousel({ onOpenEnquiry }: { onOpenEnquiry: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.max(0, UPCOMING_CAMPS_DATA.length - itemsPerView + 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide();
    }
  };

  return (
    <section className="relative py-20 md:py-28 bg-white overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-primary/[0.03] blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-secondary/[0.04] blur-[100px]" />
      </div>

      <div className="section-container relative z-10">
        <RevealSection>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/[0.06] text-primary text-[11px] font-bold tracking-widest uppercase mb-4">
                UPCOMING CAMPS
              </span>
              <h2 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                Upcoming Screening Camps
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Join our upcoming cancer awareness and screening camps across India. Register early to secure your slot and receive free guidance from healthcare professionals.
              </p>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container hover:scale-105 transition-all shadow-md focus:outline-none"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-[#c29f32] hover:scale-105 transition-all shadow-md focus:outline-none"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </RevealSection>

        {/* Carousel Container */}
        <RevealSection delay={200}>
          <div 
            className="overflow-hidden mx-auto py-4 -mx-3 px-3"
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
              {UPCOMING_CAMPS_DATA.map((camp) => (
                <div 
                  key={camp.id} 
                  className="shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="h-full flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group">
                    {/* Image Area */}
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <img 
                        src={camp.image} 
                        alt={camp.title} 
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:-rotate-2 group-hover:-translate-x-1 group-hover:brightness-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-primary text-[10px] font-bold shadow-sm">
                          {camp.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col flex-1 p-6">
                      <h3 className="font-outfit text-lg font-bold text-primary mb-4 line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                        {camp.title}
                      </h3>
                      
                      <div className="space-y-2.5 mb-5">
                        <div className="flex items-center gap-2.5 text-slate-500 text-[13px] font-medium">
                          <Calendar className="w-4 h-4 text-secondary shrink-0" />
                          <span>{camp.date}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500 text-[13px] font-medium">
                          <Clock className="w-4 h-4 text-secondary shrink-0" />
                          <span>{camp.time}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500 text-[13px] font-medium">
                          <MapPin className="w-4 h-4 text-secondary shrink-0" />
                          <span className="truncate">{camp.city}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500 text-[13px] font-medium">
                          <Building className="w-4 h-4 text-secondary shrink-0" />
                          <span className="truncate">{camp.hospital}</span>
                        </div>
                      </div>

                      <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed mb-6">
                        {camp.desc}
                      </p>

                      <div className="mt-auto">
                        {/* Status & Progress */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${camp.statusColor}`}>
                            {camp.status}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {Math.round((camp.registered / camp.capacity) * 100)}% Full
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
                          <div 
                            className="h-full bg-secondary rounded-full transition-all duration-1000"
                            style={{ width: `${(camp.registered / camp.capacity) * 100}%` }}
                          />
                        </div>

                        {/* Register Button */}
                        <button 
                          onClick={onOpenEnquiry}
                          className="w-full h-11 bg-primary text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container hover:shadow-lg transition-all duration-300 group/btn"
                        >
                          Register Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalSlides)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-secondary w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
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

  // Testimonial carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 7000); // Cinematic 7s duration per slide
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
      <section className="relative h-[85vh] min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex flex-col justify-center overflow-hidden bg-primary">
        {/* Background Slides with Ken Burns */}
        <div className="absolute inset-0 z-0 bg-primary">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div
                className={`w-full h-full transition-transform duration-[8000ms] ease-in-out origin-center ${idx === activeSlide ? 'scale-[1.08]' : 'scale-100'}`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover brightness-[1.05] contrast-[1.05]"
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
              {/* Left-to-Right cinematic gradient overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(22,58,95,0.75)_0%,rgba(22,58,95,0.35)_40%,rgba(22,58,95,0)_75%,transparent_100%)]" />
            </div>
          ))}
        </div>

        {/* Torn Edge Top (white, to match navbar/body transition) */}
        <div className="absolute top-[-1px] left-0 w-full z-30 text-white transform rotate-180 pointer-events-none">
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-6 md:h-10 lg:h-12 fill-current block">
            <path d="M0,40 L0,18 L12,25.9 L24,20.8 L36,13.8 L48,21 L60,25.5 L72,17.2 L84,15.6 L96,24.1 L108,21 L120,13 L132,19.9 L144,25 L156,16.5 L168,14 L180,22.8 L192,20.4 L204,12.5 L216,19 L228,24.5 L240,16 L252,13.2 L264,21.5 L276,19.5 L288,11.8 L300,18.2 L312,23.8 L324,15.3 L336,12.5 L348,20.2 L360,18.8 L372,11.2 L384,17.4 L396,23 L408,14.6 L420,11.8 L432,19 L444,18.2 L456,10.7 L468,16.6 L480,22.2 L492,14 L504,11.2 L516,17.9 L528,17.5 L540,10.2 L552,15.8 L564,21.3 L576,13.3 L588,10.6 L600,16.7 L612,16.8 L624,9.8 L636,15 L648,20.5 L660,12.7 L672,10.2 L684,15.5 L696,16.2 L708,9.4 L720,14.2 L732,19.6 L744,12 L756,9.8 L768,14.4 L780,15.5 L792,9 L804,13.5 L816,18.7 L828,11.4 L840,9.4 L852,13.3 L864,14.9 L876,8.6 L888,12.7 L900,17.8 L912,10.7 L924,9.1 L936,12.2 L948,14.2 L960,8.3 L972,12 L984,16.8 L996,10 L1008,8.8 L1020,11.1 L1032,13.6 L1044,8 L1056,11.2 L1068,15.8 L1080,9.4 L1092,8.6 L1104,10 L1116,12.9 L1128,7.7 L1140,10.5 L1152,14.8 L1164,8.8 L1176,8.4 L1188,8.9 L1200,12.3 L1200,40 Z"/>
          </svg>
        </div>

        {/* Torn Edge Bottom */}
        <div className="absolute bottom-[-1px] left-0 w-full z-30 text-white pointer-events-none">
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-6 md:h-10 lg:h-12 fill-current block">
            <path d="M0,40 L0,18 L12,25.9 L24,20.8 L36,13.8 L48,21 L60,25.5 L72,17.2 L84,15.6 L96,24.1 L108,21 L120,13 L132,19.9 L144,25 L156,16.5 L168,14 L180,22.8 L192,20.4 L204,12.5 L216,19 L228,24.5 L240,16 L252,13.2 L264,21.5 L276,19.5 L288,11.8 L300,18.2 L312,23.8 L324,15.3 L336,12.5 L348,20.2 L360,18.8 L372,11.2 L384,17.4 L396,23 L408,14.6 L420,11.8 L432,19 L444,18.2 L456,10.7 L468,16.6 L480,22.2 L492,14 L504,11.2 L516,17.9 L528,17.5 L540,10.2 L552,15.8 L564,21.3 L576,13.3 L588,10.6 L600,16.7 L612,16.8 L624,9.8 L636,15 L648,20.5 L660,12.7 L672,10.2 L684,15.5 L696,16.2 L708,9.4 L720,14.2 L732,19.6 L744,12 L756,9.8 L768,14.4 L780,15.5 L792,9 L804,13.5 L816,18.7 L828,11.4 L840,9.4 L852,13.3 L864,14.9 L876,8.6 L888,12.7 L900,17.8 L912,10.7 L924,9.1 L936,12.2 L948,14.2 L960,8.3 L972,12 L984,16.8 L996,10 L1008,8.8 L1020,11.1 L1032,13.6 L1044,8 L1056,11.2 L1068,15.8 L1080,9.4 L1092,8.6 L1104,10 L1116,12.9 L1128,7.7 L1140,10.5 L1152,14.8 L1164,8.8 L1176,8.4 L1188,8.9 L1200,12.3 L1200,40 Z"/>
          </svg>
        </div>

        {/* Decorative Floating Elements */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[45%] w-2 h-2 rounded-full bg-white/40 animate-pulse" />
          <div className="absolute top-[60%] left-[10%] w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[40%] right-[30%] w-2.5 h-2.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[25%] left-[50%] w-1 h-1 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '1.5s' }} />
          <Plus className="absolute top-[15%] left-[5%] w-8 h-8 text-white/10 rotate-12" />
          <Plus className="absolute bottom-[20%] right-[20%] w-12 h-12 text-white/10 -rotate-12" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full px-6 md:pl-[6vw] lg:pl-[8vw] pt-24 pb-16 flex flex-col justify-center h-full" key={`hero-text-${activeSlide}`}>
          <div className="max-w-[550px]">
            {/* Small Label */}
            <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '100ms', animationDuration: '600ms' }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold uppercase tracking-[0.2em] border border-secondary/20 mb-6 backdrop-blur-md shadow-sm">
                {CAROUSEL_SLIDES[activeSlide].tag}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-outfit text-white text-[42px] sm:text-[54px] md:text-[64px] lg:text-[76px] font-[800] leading-[1.05] tracking-tight mb-6">
              <div className="overflow-hidden pb-1">
                <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '250ms', animationDuration: '700ms' }}>
                  {CAROUSEL_SLIDES[activeSlide].titleLine1}
                </div>
              </div>
              <div className="overflow-hidden mt-1 pb-2">
                <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards] text-white font-[800]" style={{ animationDelay: '400ms', animationDuration: '700ms' }}>
                  {CAROUSEL_SLIDES[activeSlide].titleLine2}
                </div>
              </div>
            </h1>

            {/* Subtitle */}
            <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '550ms', animationDuration: '700ms' }}>
              <p className="text-white/95 text-[17px] md:text-[20px] lg:text-[22px] font-medium leading-[1.65] mb-10 max-w-full">
                {CAROUSEL_SLIDES[activeSlide].desc}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '700ms', animationDuration: '700ms' }}>
              <button
                onClick={() => navigate('/events')}
                className="px-10 py-4 rounded-full bg-primary text-white font-semibold text-[16px] hover:bg-[#112d4a] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(22,58,95,0.4)] flex items-center justify-center gap-2 transition-all duration-300 ease-out"
              >
                Find Free Screening Camps <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => navigate('/join-us')}
                className="px-10 py-4 rounded-full bg-transparent border-2 border-white text-white font-semibold text-[16px] hover:bg-white hover:text-primary hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] flex items-center justify-center transition-all duration-300 ease-out"
              >
                Join Our Mission
              </button>
            </div>
          </div>
        </div>

        {/* Cinematic Slide Indicators */}
        <div className="absolute bottom-10 right-6 md:right-[6vw] lg:right-[8vw] z-40 flex items-center gap-3.5">
          {CAROUSEL_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`transition-all duration-500 ease-out rounded-full ${
                idx === activeSlide
                  ? 'w-3 h-3 bg-secondary shadow-[0_0_12px_rgba(212,175,55,0.8)] scale-110'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 1.5: TRUSTED BY LOGO CAROUSEL
          ═══════════════════════════════════════════ */}
      <section className="relative z-20 bg-white border-b border-outline-variant/10 overflow-hidden h-[140px] md:h-[160px] flex flex-col justify-center">
        <p className="text-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-6 md:mb-8">
          Trusted By & In Collaboration With
        </p>

        <div className="relative w-full max-w-[1440px] mx-auto flex items-center">
          {/* Edge Fade Masks */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Marquee Container */}
          <div className="animate-marquee hover:[animation-play-state:paused] flex items-center w-max [animation-duration:40s]">
            {/* Two identical blocks to create the seamless infinite loop */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-12 md:space-x-20 px-6 md:px-10 shrink-0">
                {[
                  { name: 'Apex Oncology', icon: Activity },
                  { name: 'National Health Org', icon: Shield },
                  { name: 'CareWell Centers', icon: Building },
                  { name: 'MediTech Diagnostics', icon: Microscope },
                  { name: 'Global Care Foundation', icon: HeartHandshake },
                  { name: 'OncoShield', icon: Plus },
                  { name: 'Regional Cancer Registry', icon: MapPin },
                ].map((partner, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-primary/40 hover:text-primary transition-all duration-300 transform hover:scale-105 cursor-pointer h-[55px]"
                  >
                    <partner.icon className="w-8 h-8 md:w-10 md:h-10 shrink-0" strokeWidth={1.5} />
                    <span className="font-outfit font-bold text-[18px] md:text-[22px] tracking-tight leading-none whitespace-nowrap">
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
      <section className="relative py-20 md:py-28 bg-slate-50/40 overflow-hidden">
        {/* Subtle Organic Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] max-w-[600px] aspect-square rounded-full bg-primary/[0.015] blur-3xl" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] max-w-[700px] aspect-square rounded-full bg-secondary/[0.02] blur-3xl" />
        </div>

        <div className="section-container relative z-10">
          <RevealSection>
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/[0.06] text-primary text-[11px] font-bold tracking-widest uppercase mb-5">
                OUR CORE PROGRAMS
              </span>
              <h2 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
                Our Key Initiatives That Save Lives
              </h2>
              <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                Through awareness, early detection, patient navigation and clinical education, Cancer Aware Bharat is building a healthier future for every community across India.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                icon: Microscope,
                theme: 'theme-1',
                iconColor: 'text-primary',
                title: 'Early Cancer Screening',
                desc: 'We organize free cancer screening camps in rural and urban communities for the early detection of Oral, Breast and Cervical Cancer.'
              },
              {
                icon: HeartPulse,
                theme: 'theme-2',
                iconColor: 'text-[#2E8B57]',
                title: 'Patient Navigation & Support',
                desc: 'Our trained volunteers guide patients and families through diagnosis, referrals, treatment planning and access to government healthcare schemes.'
              },
              {
                icon: BookOpen,
                theme: 'theme-3',
                iconColor: 'text-secondary',
                title: 'Cancer Education & Prevention',
                desc: 'We educate schools, colleges and communities through awareness workshops, self-examination training and preventive healthcare programs.'
              }
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 150}>
                <div className={`card-organic ${item.theme} h-full bg-white p-8 md:p-10 flex flex-col items-center text-center group cursor-default`}>
                  {/* Floating Icon Badge */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-black/5 rounded-full blur-md transform translate-y-2 group-hover:translate-y-3 group-hover:blur-lg transition-all duration-300" />
                    <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-50 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:-translate-y-1">
                      <item.icon className={`w-9 h-9 ${item.iconColor} group-hover:rotate-6 transition-transform duration-500`} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <h3 className="font-outfit text-primary text-xl md:text-2xl font-bold mb-4">
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9: UPCOMING CAMPS CAROUSEL
          ═══════════════════════════════════════════ */}
      <UpcomingCampsCarousel onOpenEnquiry={onOpenEnquiry} />

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
          SECTION 8: PREMIUM SPLIT LAYOUT (WHY CHOOSE US)
          ═══════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 bg-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[10%] right-[-5%] w-[40%] aspect-square rounded-full bg-primary/[0.03] blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] aspect-square rounded-full bg-secondary/[0.04] blur-[100px]" />
        </div>

        <div className="section-container relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
            
            {/* Left Column: Images (45%) */}
            <div className="w-full lg:w-[45%] relative">
              <RevealSection>
                <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group">
                  <img src="/events/event-1.jpeg" alt="Medical Support" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Decorative Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/30">
                      <Play className="w-8 h-8 text-white fill-white ml-1.5" />
                    </div>
                  </div>
                </div>

                {/* Overlapping Small Image 1 (Top Right) */}
                <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-32 h-32 md:w-48 md:h-48 rounded-2xl md:rounded-3xl border-4 md:border-8 border-white overflow-hidden shadow-xl animate-float delay-100 hidden sm:block">
                  <img src="/dr-ajay-kumar.jpg" alt="Doctor" className="w-full h-full object-cover" />
                </div>

                {/* Overlapping Small Image 2 (Bottom Right) */}
                <div className="absolute -bottom-8 -right-4 md:-bottom-12 md:-right-6 w-36 h-36 md:w-56 md:h-56 rounded-2xl md:rounded-[2rem] border-4 md:border-8 border-white overflow-hidden shadow-xl animate-float delay-300 hidden sm:block">
                  <img src="/events/event-4.jpeg" alt="Camp" className="w-full h-full object-cover" />
                </div>

                {/* Vertical Ribbon (Left Side) */}
                <div className="absolute top-12 md:top-20 -left-4 md:-left-6 bg-primary text-white py-4 md:py-6 px-3 rounded-2xl shadow-xl z-20 flex flex-col items-center animate-float">
                  <Heart className="w-5 h-5 text-secondary mb-3 fill-secondary" />
                  <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase">
                    Cancer Awareness Saves Lives
                  </span>
                </div>
              </RevealSection>
            </div>

            {/* Right Column: Content (55%) */}
            <div className="w-full lg:w-[55%] flex flex-col">
              <RevealSection delay={200}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/[0.06] text-primary text-[11px] font-bold tracking-widest uppercase mb-6 self-start">
                  WHY CHOOSE CANCER AWARE BHARAT
                </span>
                <h2 className="font-outfit text-primary text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  Helping Every Patient Live With <span className="text-secondary italic pr-2">Hope</span>
                </h2>
                <p className="text-base md:text-lg text-on-surface-variant leading-relaxed mb-10">
                  Cancer Aware Bharat connects patients with trusted doctors, screening camps, healthcare partners and trained volunteers to ensure timely diagnosis, guidance and compassionate support throughout their treatment journey.
                </p>

                {/* Feature Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
                  {/* Feature 1 */}
                  <div className="flex gap-4 group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/[0.04] text-primary flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:-translate-y-1 group-hover:shadow-lg">
                      <HeartPulse className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div>
                      <h4 className="font-outfit text-[17px] font-bold text-on-surface mb-2">Compassionate Patient Support</h4>
                      <p className="text-[14px] text-on-surface-variant leading-relaxed">Dedicated volunteers guide patients through diagnosis, referrals and treatment.</p>
                    </div>
                  </div>
                  {/* Feature 2 */}
                  <div className="flex gap-4 group">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/[0.06] text-secondary flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-secondary group-hover:text-white group-hover:-translate-y-1 group-hover:shadow-lg">
                      <Building className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div>
                      <h4 className="font-outfit text-[17px] font-bold text-on-surface mb-2">Trusted Medical Network</h4>
                      <p className="text-[14px] text-on-surface-variant leading-relaxed">Access to partner hospitals, screening camps and oncology specialists across India.</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-outline-variant/20 mb-8" />

                {/* Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-10">
                  {[
                    'Free Cancer Screening Camps',
                    'Hospital & Referral Support',
                    'Expert Medical Guidance',
                    'Cancer Awareness Programs'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-[15px] font-semibold text-on-surface">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Area */}
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <button
                    onClick={() => navigate('/mission')}
                    className="w-full sm:w-auto bg-primary text-white text-[15px] font-semibold h-14 rounded-full px-8 flex items-center justify-center gap-2 hover:bg-primary-container hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group/btn"
                  >
                    Explore Our Mission <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <a
                    href="tel:+918000000000"
                    className="w-full sm:w-auto bg-white border-2 border-primary/10 text-primary text-[15px] font-semibold h-14 rounded-full px-8 flex items-center justify-center gap-3 hover:bg-primary/[0.02] hover:border-primary/20 transition-all duration-300 group/call"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/call:bg-primary group-hover/call:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    Call Us
                  </a>
                </div>
              </RevealSection>
            </div>

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
