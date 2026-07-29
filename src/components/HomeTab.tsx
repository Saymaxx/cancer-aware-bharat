import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Heart, Award, ChevronRight, ChevronLeft, Activity, HelpCircle,
  CheckCircle2, Microscope, HeartHandshake, BookOpen, ArrowRight, Shield, Users, MapPin,
  Phone, Stethoscope, Star, Quote, ChevronDown, Mail,
  Sun, Apple, Cigarette, Dumbbell, Syringe, Search as SearchIcon, Target,
  ClipboardCheck, UserCheck, Compass, HeartPulse, Droplet, Play,
  Facebook, Instagram, Linkedin, Twitter, Plus, Building, Clock
} from 'lucide-react';
import { INITIAL_EVENTS } from '../data';
import { Event } from '../types';
import TeamShowcase from './TeamShowcase';
import PremiumSection from './common/PremiumSection';

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
    <PremiumSection variant="warm-1" withTopDivider="torn" withBottomDivider="wave">
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
    </PremiumSection>
  );
}

/* ═══════════════════════════════════════════
   TESTIMONIALS CAROUSEL COMPONENT
   ═══════════════════════════════════════════ */
const TESTIMONIALS_DATA = [
  {
    id: 't-1',
    image: '/dr-ajay-kumar.jpg',
    name: 'Dr. Meena Gupta',
    designation: 'Oncologist',
    organization: 'Cancer Aware Bharat',
    rating: 5,
    review: 'The free cancer screening camp helped detect my condition early. The doctors and volunteers guided me through every step.'
  },
  {
    id: 't-2',
    image: '/dr-ajay-kumar.jpg',
    name: 'Rajesh Sharma',
    designation: 'Volunteer',
    organization: 'Cancer Aware Bharat',
    rating: 5,
    review: 'The awareness program in our village educated hundreds of families about early symptoms. Being part of this mission is truly fulfilling.'
  },
  {
    id: 't-3',
    image: '/dr-ajay-kumar.jpg',
    name: 'Priya Verma',
    designation: 'Cancer Survivor',
    organization: 'Cancer Aware Bharat',
    rating: 5,
    review: 'Excellent coordination. Registration was smooth and treatment guidance was very helpful. I am forever grateful to the team.'
  },
  {
    id: 't-4',
    image: '/dr-ajay-kumar.jpg',
    name: 'Anjali Singh',
    designation: 'Caregiver',
    organization: 'Cancer Aware Bharat',
    rating: 5,
    review: 'They provided not just medical guidance but immense emotional support during our toughest times. A truly noble initiative.'
  },
  {
    id: 't-5',
    image: '/dr-ajay-kumar.jpg',
    name: 'Dr. Rahul Kapoor',
    designation: 'Healthcare Partner',
    organization: 'Cancer Aware Bharat',
    rating: 5,
    review: 'Partnering with Cancer Aware Bharat has allowed our hospital to reach remote communities. Their ground-level coordination is exceptional.'
  }
];

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.max(0, TESTIMONIALS_DATA.length - itemsPerView + 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(nextSlide, 5000);
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
    <PremiumSection variant="warm-2" withTopDivider="wave" withBottomDivider="torn">
      {/* Decorative Dots Background */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#163A5F 2px, transparent 2px)', backgroundSize: '30px 30px' }}
      />
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/[0.02] blur-xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-secondary/[0.03] blur-2xl pointer-events-none" />

      <div className="section-container relative z-10">
        <RevealSection>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/[0.06] text-primary text-[11px] font-bold tracking-widest uppercase mb-5">
              TESTIMONIALS
            </span>
            <h2 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              What <span className="text-secondary italic">People</span> Say About Us
            </h2>
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
              Hear real experiences from patients, volunteers, caregivers and healthcare professionals who have been part of Cancer Aware Bharat.
            </p>
          </div>
        </RevealSection>

        {/* Carousel */}
        <RevealSection delay={200}>
          <div 
            className="overflow-hidden mx-auto py-8 -mx-4 px-4"
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
              {TESTIMONIALS_DATA.map((item, idx) => {
                const isCenter = itemsPerView === 3 
                  ? idx === currentIndex + 1
                  : itemsPerView === 2 
                    ? idx === currentIndex || idx === currentIndex + 1
                    : idx === currentIndex;
                
                return (
                  <div 
                    key={item.id} 
                    className="shrink-0 px-4"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <div 
                      className={`h-full flex flex-col bg-white rounded-3xl p-8 relative transition-all duration-700 group cursor-default
                        ${isCenter 
                          ? 'shadow-[0_20px_40px_rgba(0,0,0,0.08)] scale-100 md:scale-[1.03] border border-secondary/30 opacity-100 z-10' 
                          : 'shadow-[0_4px_20px_rgba(0,0,0,0.03)] scale-100 md:scale-[0.97] border border-slate-100 opacity-65 z-0'
                        } hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] hover:-translate-y-2 hover:border-secondary/50`}
                    >
                      {/* Top: Stars & Quote Icon */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-1">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-secondary text-secondary group-hover:scale-110 transition-transform delay-75" />
                          ))}
                        </div>
                        <Quote className="w-12 h-12 text-primary/5 -mt-2 -mr-2" />
                      </div>

                      {/* Review Text */}
                      <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed italic mb-8 flex-1">
                        "{item.review}"
                      </p>

                      {/* Profile */}
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-50 group-hover:border-secondary/20 transition-colors">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                          <h4 className="font-outfit font-bold text-primary text-[15px]">{item.name}</h4>
                          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                            {item.designation} <span className="text-slate-300 mx-1">•</span> <span className="text-secondary/80">{item.organization}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-[#163A5F] text-white flex items-center justify-center hover:bg-primary-container hover:scale-105 transition-all shadow-md focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-[#D4AF37] text-primary flex items-center justify-center hover:bg-[#c29f32] hover:scale-105 transition-all shadow-md focus:outline-none"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </RevealSection>
      </div>
    </PremiumSection>
  );
}

/* ═══════════════════════════════════════════
   CANCER AWARENESS NEWS & ARTICLES COMPONENT
   ═══════════════════════════════════════════ */
const NEWS_ARTICLES_DATA = [
  {
    id: 'news-1',
    title: 'Early Detection Saves Lives',
    description: 'Learn why regular screening can significantly improve survival rates and the importance of early diagnosis.',
    image: '/events/event-1.jpeg',
    category: 'Prevention',
    date: '24 Oct, 2026',
    readTime: '5 min read',
    link: '#'
  },
  {
    id: 'news-2',
    title: 'Understanding Oral Cancer',
    description: 'Common warning signs every tobacco user should know to catch oral cancer in its earliest, most treatable stages.',
    image: '/events/event-4.jpeg',
    category: 'Awareness',
    date: '18 Oct, 2026',
    readTime: '4 min read',
    link: '#'
  },
  {
    id: 'news-3',
    title: 'Breast Cancer Awareness',
    description: 'A simple, step-by-step self-examination guide every woman should know for proactive health monitoring.',
    image: '/events/event-2.jpeg',
    category: 'Screening',
    date: '12 Oct, 2026',
    readTime: '6 min read',
    link: '#'
  }
];

function TiltCard({ children }: { children: React.ReactNode }) {
  const [transform, setTransform] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return; // Disable on mobile for perf
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-12px)`);
  };
  
  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0)');
  };

  return (
    <div 
      className={`h-full w-full transition-all duration-400 ease-out will-change-transform ${isHovered ? 'shadow-[0_25px_50px_rgba(0,0,0,0.15)] border-primary/20' : 'shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-transparent'}`}
      style={{ transform, borderRadius: '22px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`h-full bg-white rounded-[22px] border overflow-hidden flex flex-col group ${isHovered ? 'border-primary/20' : 'border-slate-100'}`}>
        {children}
      </div>
    </div>
  );
}

function NewsArticlesSection() {
  return (
    <PremiumSection variant="warm-3">
      <div className="section-container relative z-10">
        <RevealSection>
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/[0.06] text-primary text-[11px] font-bold tracking-widest uppercase mb-5">
              CANCER AWARENESS
            </span>
            <h2 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              Latest Cancer News & <span className="text-secondary italic pr-2">Awareness</span>
            </h2>
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
              Explore trusted articles, prevention guides, success stories and awareness updates from Cancer Aware Bharat.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16">
          {NEWS_ARTICLES_DATA.map((article, i) => (
            <RevealSection key={article.id} delay={i * 150}>
              <TiltCard>
                {/* Image Container */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2 group-hover:-translate-y-1"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block px-3 py-1.5 bg-primary/90 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider uppercase rounded-full shadow-md group-hover:scale-105 transition-transform">
                      {article.category}
                    </span>
                  </div>
                  
                  {/* Inner subtle glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-white z-10">
                  <h3 className="font-outfit text-[20px] md:text-[22px] font-bold text-primary mb-3 leading-snug group-hover:-translate-y-1 transition-transform duration-500">
                    {article.title}
                  </h3>
                  <p className="text-[14px] md:text-[15px] text-slate-500 leading-relaxed mb-8 flex-1 group-hover:-translate-y-0.5 transition-transform duration-500 delay-75">
                    {article.description}
                  </p>

                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between text-slate-500 group-hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-4 text-[12px] font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-secondary" />
                        {article.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-secondary" />
                        {article.readTime}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-secondary group-hover:text-primary transition-all duration-300">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </RevealSection>
          ))}
        </div>

        {/* View All Button */}
        <RevealSection delay={400}>
          <div className="flex justify-center">
            <a 
              href="#" 
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-[#163A5F] text-white text-[15px] font-semibold tracking-wide hover:bg-[#D4AF37] hover:text-[#163A5F] transition-all duration-300 shadow-lg hover:shadow-xl group/btn"
            >
              View All Articles 
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        </RevealSection>
        </div>
    </PremiumSection>
  );
}

/* ═══════════════════════════════════════════
   HOME TAB COMPONENT
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   PANORAMIC GALLERY SECTION
   ═══════════════════════════════════════════ */
const PANORAMIC_GALLERY_DATA = [
  { id: 'g1', image: '/events/event-1.jpeg', title: 'Rural Outreach', location: 'Jaipur, Rajasthan', link: '/gallery' },
  { id: 'g2', image: '/events/event-2.jpeg', title: 'Women Health', location: 'Pune, Maharashtra', link: '/gallery' },
  { id: 'g3', image: '/events/event-4.jpeg', title: 'Oral Checkup', location: 'Ahmedabad, Gujarat', link: '/gallery' },
  { id: 'g4', image: '/events/event-5.jpeg', title: 'Blood Donation', location: 'Lucknow, UP', link: '/gallery' },
  { id: 'g5', image: '/dr-ajay-kumar.jpg', title: 'Consultation', location: 'Bhopal, MP', link: '/gallery' },
];

function PanoramicGallerySection() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const scrollItems = [...PANORAMIC_GALLERY_DATA, ...PANORAMIC_GALLERY_DATA, ...PANORAMIC_GALLERY_DATA];

  return (
    <PremiumSection variant="warm-1">
      <div className="section-container relative z-10 mb-10 md:mb-14">
        <RevealSection>
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/[0.06] text-primary text-[11px] font-bold tracking-widest uppercase mb-5">
              PHOTO GALLERY
            </span>
            <h2 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              Moments That Inspire <span className="text-secondary italic pr-2">Hope</span>
            </h2>
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
              Explore awareness campaigns, cancer screening camps, volunteer activities and inspiring moments from across India.
            </p>
          </div>
        </RevealSection>
      </div>

      <div className="w-full relative px-4 md:px-8 max-w-[1920px] mx-auto">
        <RevealSection delay={200}>
          <div 
            className="w-full h-[220px] md:h-[340px] lg:h-[450px] relative overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] group/panorama"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 z-20 pointer-events-none rounded-[2rem] md:rounded-[3rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]" />
            
            <div 
              className="flex h-full w-max"
              style={{
                animation: `scrollPanorama 40s linear infinite`,
                animationPlayState: isHovered ? 'paused' : 'running'
              }}
            >
              {scrollItems.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="h-full w-[280px] md:w-[400px] lg:w-[500px] relative overflow-hidden flex-shrink-0 border-r-2 border-white/10 group cursor-pointer"
                  onClick={() => navigate(item.link)}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#163A5F]/90 via-[#163A5F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                    <h3 className="font-outfit text-white text-xl md:text-2xl font-bold mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm flex items-center gap-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      <MapPin className="w-4 h-4 text-secondary" /> {item.location}
                    </p>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 backdrop-blur-sm border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      <ArrowRight className="w-6 h-6 -rotate-45" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 mt-10">
            <button 
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container hover:-translate-y-1 transition-all duration-300 shadow-md focus:outline-none"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center hover:bg-[#c29f32] hover:-translate-y-1 transition-all duration-300 shadow-md focus:outline-none"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </RevealSection>
      </div>

      <style>{`
        @keyframes scrollPanorama {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </PremiumSection>
  );
}

/* ═══════════════════════════════════════════
   HOME TAB COMPONENT
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   PREMIUM CTA SECTION
   ═══════════════════════════════════════════ */
function PremiumCtaSection({ onOpenVolunteer, onOpenEnquiry }: { onOpenVolunteer: () => void, onOpenEnquiry: () => void }) {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-[#FFFDF8] to-[#FFF6EA]">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Ribbons & Particles */}
        <div className="absolute top-10 left-[10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-[5%] w-[500px] h-[500px] bg-[#FFF0D9]/50 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        {/* Floating Icons */}
        <div className="absolute top-20 right-[20%] text-[#D4AF37]/20 animate-float">
          <Heart className="w-12 h-12" />
        </div>
        <div className="absolute bottom-32 left-[15%] text-primary/10 animate-float delay-500">
          <Shield className="w-16 h-16" />
        </div>
        <div className="absolute top-1/2 left-[40%] text-primary/5 animate-float delay-700">
          <Stethoscope className="w-10 h-10" />
        </div>
      </div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* Left Content */}
          <div className="order-2 lg:order-1 relative z-20">
            <RevealSection>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.04] text-primary text-[11px] font-bold tracking-widest uppercase mb-6 border border-primary/10">
                <Heart className="w-3.5 h-3.5 fill-secondary text-secondary" /> JOIN OUR MISSION
              </span>
              
              <h2 className="font-outfit text-primary text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                Together We Can <span className="text-secondary italic">Fight Cancer</span> Across India
              </h2>
              
              <p className="text-slate-600 text-base md:text-lg mb-10 leading-relaxed font-light max-w-xl">
                Join volunteers, doctors and healthcare professionals helping thousands of patients receive early cancer screening and proper guidance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onOpenVolunteer}
                  className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-sm shadow-[0_10px_20px_rgba(22,58,95,0.15)] hover:shadow-[0_15px_30px_rgba(22,58,95,0.25)] hover:bg-primary-container transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  Become a Volunteer
                </button>
                <button 
                  onClick={onOpenEnquiry}
                  className="px-8 py-4 rounded-full bg-white border border-primary/20 text-primary font-semibold text-sm hover:border-primary/40 hover:bg-slate-50 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md"
                >
                  Patient Enquiry
                </button>
              </div>
            </RevealSection>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative z-20">
            <RevealSection delay={200} className="w-full">
              <div className="relative w-full max-w-[520px] mx-auto lg:ml-auto group cursor-pointer">
                <div className="absolute inset-0 bg-primary/5 rounded-[20px] transform rotate-3 scale-105 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                <div className="relative rounded-[20px] overflow-hidden shadow-[0_20px_40px_rgba(22,58,95,0.08)] group-hover:shadow-[0_30px_60px_rgba(22,58,95,0.12)] transition-all duration-700 z-10 bg-white">
                  <img 
                    src="/events/event-2.jpeg" 
                    alt="Healthcare Professional" 
                    className="w-full aspect-[4/3] object-cover transition-transform duration-1000 group-hover:scale-[1.04] group-hover:-rotate-1"
                  />
                  
                  {/* Floating Arrow Button */}
                  <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <ArrowRight className="w-5 h-5 text-primary -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}

interface HomeTabProps {
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function HomeTab({ onOpenVolunteer, onOpenEnquiry }: HomeTabProps) {
  const navigate = useNavigate();


  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);


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
      <PremiumSection variant="warm-1" withGlow={false} paddingClass="py-10 md:py-14" className="-mt-1 border-b border-outline-variant/10 z-10">
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
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 3: CORE PROGRAMS / PILLARS
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-2">

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
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 9: UPCOMING CAMPS CAROUSEL
          ═══════════════════════════════════════════ */}
      <UpcomingCampsCarousel onOpenEnquiry={onOpenEnquiry} />

      {/* ═══════════════════════════════════════════
          SECTION 5: PANORAMIC GALLERY
          ═══════════════════════════════════════════ */}
      <PanoramicGallerySection />



      {/* ═══════════════════════════════════════════
          SECTION 8: PREMIUM SPLIT LAYOUT (WHY CHOOSE US)
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-3">
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
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 10: TESTIMONIALS CAROUSEL
          ═══════════════════════════════════════════ */}
      <TestimonialsCarousel />

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
          SECTION 10.2: NEWS & ARTICLES SECTION
          ═══════════════════════════════════════════ */}
      <NewsArticlesSection />

      {/* ═══════════════════════════════════════════
          SECTION 11: FAQ
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-2" paddingClass="py-16 md:py-20" withGlow={true}>
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
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 12: NEWSLETTER
          ═══════════════════════════════════════════ */}
      <PremiumSection variant="warm-1" paddingClass="py-16 md:py-24" withIcons={false} withGlow={false}>
        <div className="section-container relative z-10">
          <RevealSection>
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-[#FFF0D9] relative overflow-hidden group">
              
              {/* Background elements inside card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF0D9]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
                
                <div className="md:col-span-7 lg:col-span-8 text-center md:text-left">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase mb-4 border border-primary/10">
                    <Mail className="w-3 h-3" /> Newsletter
                  </span>
                  <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-primary mb-4 leading-tight">
                    Stay Updated
                  </h2>
                  <p className="text-slate-500 text-sm md:text-base mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                    Get cancer awareness tips, screening camp updates, healthcare articles and volunteer opportunities delivered to your inbox.
                  </p>

                  {!newsletterSubmitted ? (
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
                      <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400 text-primary"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (newsletterEmail.includes('@')) setNewsletterSubmitted(true);
                        }}
                        className="h-14 px-8 bg-primary text-white font-semibold rounded-xl hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2"
                      >
                        Subscribe
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm font-medium inline-flex items-center gap-2 animate-scale-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Thank you! You'll receive our updates soon.
                    </div>
                  )}
                  
                  <p className="text-[11px] text-slate-400 mt-4 font-medium flex items-center justify-center md:justify-start gap-1">
                    <Shield className="w-3 h-3" /> No spam. Unsubscribe anytime.
                  </p>
                </div>

                {/* Illustration / Icon side */}
                <div className="md:col-span-5 lg:col-span-4 flex justify-center hidden md:flex">
                  <div className="relative w-40 h-40 group-hover:scale-105 transition-transform duration-700">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl" />
                    <div className="relative w-full h-full bg-gradient-to-tr from-primary/5 to-secondary/20 rounded-[2rem] border border-white shadow-xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform duration-500">
                      <Mail className="w-16 h-16 text-secondary drop-shadow-md" />
                      {/* Decorative floating dots */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center animate-bounce delay-100">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-secondary rounded-full shadow-lg animate-bounce delay-300" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </RevealSection>
        </div>
      </PremiumSection>

      {/* ═══════════════════════════════════════════
          SECTION 13: PREMIUM FULL-WIDTH CTA
          ═══════════════════════════════════════════ */}
      <PremiumCtaSection onOpenVolunteer={onOpenVolunteer} onOpenEnquiry={onOpenEnquiry} />
    </div>
  );
}
