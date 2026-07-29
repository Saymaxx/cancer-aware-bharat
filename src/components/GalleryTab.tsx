import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image, Search, Calendar, MapPin, ChevronRight, ChevronLeft,
  Eye, X, Maximize2, Sparkles, Filter, Shield, Building2, Users, Globe
} from 'lucide-react';
import PremiumSection from './common/PremiumSection';

interface GalleryItem {
  id: string;
  title: string;
  category: 'Screening Camps' | 'Community Drives' | 'Hospital Partnerships' | 'Awareness Workshops' | 'Platform Info';
  image: string;
  date: string;
  location: string;
  description: string;
  impactMetrics: string;
  aspect: 'tall' | 'wide' | 'square';
  tags: string[];
}

// Full-width Hero Slideshow (STRICTLY these 6 images with ZERO text overlays)
const HERO_SLIDES = [
  '/hero-gallery/hero-1.jpeg',
  '/hero-gallery/hero-2.jpeg',
  '/hero-gallery/hero-3.jpeg',
  '/hero-gallery/hero-4.jpeg',
  '/hero-gallery/hero-5.jpeg',
  '/hero-gallery/hero-6.jpeg'
];

// All 20 allowed gallery items (Strictly excludes gallery-6.jpeg, gallery-7.jpeg, gallery-13.jpeg)
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'Free Breast & Cervical Cancer Screening Camp',
    category: 'Screening Camps',
    image: '/gallery/gallery-1.jpeg',
    date: 'July 15, 2026',
    location: 'Lions Club Grounds, Dwarka, New Delhi',
    description: 'Mobile clinical screening units equipped with mammography diagnostic equipment provided free early detection scans for 420+ women.',
    impactMetrics: '420+ Women Screened • 18 Follow-ups Flagged',
    aspect: 'wide',
    tags: ['Delhi NCR', 'Screening', 'Mammography']
  },
  {
    id: 'gal-02',
    title: 'Mega Blood & Platelet Donation Drive',
    category: 'Community Drives',
    image: '/gallery/gallery-2.jpeg',
    date: 'June 28, 2026',
    location: 'City Hospital Community Center, Pune',
    description: 'Over 280 voluntary donors participated to support oncology surgery units and chemotherapy patients in critical need.',
    impactMetrics: '285 Donors • 140 Units Transfusion Ready',
    aspect: 'tall',
    tags: ['Pune', 'Blood Drive', 'Oncology Support']
  },
  {
    id: 'gal-03',
    title: 'Holistic Recovery & Nutrition Post-Chemo Workshop',
    category: 'Awareness Workshops',
    image: '/gallery/gallery-3.jpeg',
    date: 'June 10, 2026',
    location: 'Suryadatta Institute Auditorium, Pune',
    description: 'Clinical nutritionists and oncology physiotherapists provided personalized diet plans and recovery exercises.',
    impactMetrics: '150+ Patients & Caregivers Guided',
    aspect: 'square',
    tags: ['Nutrition', 'Survivor Care', 'Recovery']
  },
  {
    id: 'gal-04',
    title: 'Rural Oral Cancer Screening & Health Rally',
    category: 'Screening Camps',
    image: '/gallery/gallery-4.jpeg',
    date: 'May 20, 2026',
    location: 'Chandauli Block Panchayat, Uttar Pradesh',
    description: 'Oncology dental specialists screened 600+ factory workers and farmers for oral pre-cancerous lesions with digital reporting.',
    impactMetrics: '610 Screening Cases • 32 Biopsy Referrals',
    aspect: 'tall',
    tags: ['Oral Screening', 'Rural Health', 'UP']
  },
  {
    id: 'gal-05',
    title: 'Youth Volunteer Orientation & Training Summit',
    category: 'Community Drives',
    image: '/gallery/gallery-5.jpeg',
    date: 'May 04, 2026',
    location: 'Noida Community Center, UP',
    description: 'Medical students and community advocates certified in patient intake navigation and screening camp coordination.',
    impactMetrics: '180+ Certified Caseworkers',
    aspect: 'wide',
    tags: ['Volunteers', 'Training', 'Youth Network']
  },
  {
    id: 'gal-08',
    title: 'Community Health Awareness Rally & Distribution',
    category: 'Community Drives',
    image: '/gallery/gallery-8.jpeg',
    date: 'March 28, 2026',
    location: 'Nagpur Town Hall, Maharashtra',
    description: 'Volunteer advocates distributing early warning sign guidebooks and self-examination cards to rural families.',
    impactMetrics: '1,200+ Self-Exam Guides Handed Out',
    aspect: 'square',
    tags: ['Nagpur', 'Awareness', 'Self-Exam']
  },
  {
    id: 'gal-09',
    title: 'Partner Hospital Oncology MoU Sign-Off',
    category: 'Hospital Partnerships',
    image: '/gallery/gallery-9.jpeg',
    date: 'March 15, 2026',
    location: 'Apex Cancer Institute, New Delhi',
    description: 'Formal partnership establishing priority hospital beds and subsidized PET-CT scan slots for referred patients.',
    impactMetrics: 'Apex Tie-Up • Subsidized PET-CT',
    aspect: 'tall',
    tags: ['Hospital Network', 'MOU', 'Delhi']
  },
  {
    id: 'gal-10',
    title: 'Tobacco Cessation & School Health Campaign',
    category: 'Awareness Workshops',
    image: '/gallery/gallery-10.jpeg',
    date: 'Feb 26, 2026',
    location: 'Bandra Municipal Schools, Mumbai',
    description: 'Audio-visual seminar explaining carcinogenic risks of tobacco and establishing student health clubs.',
    impactMetrics: '1,500+ Student Pledges',
    aspect: 'wide',
    tags: ['Anti-Tobacco', 'Youth Health', 'Mumbai']
  },
  {
    id: 'gal-11',
    title: 'Patient Navigation & Caseworker Consultation',
    category: 'Platform Info',
    image: '/gallery/gallery-11.jpeg',
    date: 'Feb 12, 2026',
    location: 'Regional Referral Office, Jaipur',
    description: 'Caseworkers guiding family members through hospital appointment booking and government aid forms.',
    impactMetrics: 'End-to-End Navigation Support',
    aspect: 'square',
    tags: ['Patient Support', 'Caseworker', 'Jaipur']
  },
  {
    id: 'gal-12',
    title: 'Rural Screening Registration & Triage',
    category: 'Screening Camps',
    image: '/gallery/gallery-12.jpeg',
    date: 'Jan 30, 2026',
    location: 'Solapur Village Center, Maharashtra',
    description: 'Paramedics conducting digital symptom intake and preliminary risk score calculation for village residents.',
    impactMetrics: '240 Intake Registrations',
    aspect: 'tall',
    tags: ['Solapur', 'Triage', 'Digital Intake']
  },
  {
    id: 'gal-14',
    title: 'Emergency Blood & Platelet Transfusion Drive',
    category: 'Community Drives',
    image: '/gallery/gallery-14.jpeg',
    date: 'Dec 20, 2025',
    location: 'Red Cross Center, New Delhi',
    description: 'Emergency blood donation session providing critical platelets for leukemia surgery patients.',
    impactMetrics: '190 Donors Registered',
    aspect: 'wide',
    tags: ['Blood Donation', 'Platelets', 'Delhi']
  },
  {
    id: 'gal-15',
    title: 'Doctor Panel Clinical Review Conference',
    category: 'Hospital Partnerships',
    image: '/gallery/gallery-15.jpeg',
    date: 'Dec 05, 2025',
    location: 'Tata Research Center Auditorium, Kolkata',
    description: 'Panel of surgical oncologists reviewing rural camp diagnostic accuracy and protocol updates.',
    impactMetrics: 'Clinical Integrity Review',
    aspect: 'square',
    tags: ['Doctor Panel', 'Kolkata', 'Clinical Protocol']
  },
  {
    id: 'gal-16',
    title: 'Volunteer Recognition & Honor Ceremony',
    category: 'Platform Info',
    image: '/gallery/gallery-16.jpeg',
    date: 'Nov 22, 2025',
    location: 'Community Hall, Hyderabad',
    description: 'Honoring top community caseworkers who navigated patients to regional oncology hospitals.',
    impactMetrics: '25 Top Volunteers Honored',
    aspect: 'tall',
    tags: ['Volunteers', 'Awards', 'Hyderabad']
  },
  {
    id: 'gal-17',
    title: 'Women Health & Cervical Awareness Drive',
    category: 'Screening Camps',
    image: '/gallery/gallery-17.jpeg',
    date: 'Nov 08, 2025',
    location: 'Bhopal District Center, MP',
    description: 'Free cervical PAP screening and HPV vaccination counseling session for rural women.',
    impactMetrics: '290 Pap Scans',
    aspect: 'wide',
    tags: ['Cervical Cancer', 'Women Health', 'Bhopal']
  },
  {
    id: 'gal-18',
    title: 'Onco-Nutrition Recipe & Meal Planning Demo',
    category: 'Awareness Workshops',
    image: '/gallery/gallery-18.jpeg',
    date: 'Oct 24, 2025',
    location: 'District Hospital Kitchen, Patna',
    description: 'Live demonstration of high-protein Indian dietary recipes tailored for chemo recovery.',
    impactMetrics: '120 Caregivers Trained',
    aspect: 'square',
    tags: ['Onco-Nutrition', 'Patna', 'Recovery']
  },
  {
    id: 'gal-19',
    title: 'Village Panchayat Referral Center Inauguration',
    category: 'Platform Info',
    image: '/gallery/gallery-19.jpeg',
    date: 'Oct 10, 2025',
    location: 'Baramati Village, Maharashtra',
    description: 'Inauguration of a referral helpdesk providing free screening guidance to surrounding villages.',
    impactMetrics: '10 Villages Covered',
    aspect: 'tall',
    tags: ['Village Center', 'Helpdesk', 'Referrals']
  },
  {
    id: 'gal-20',
    title: 'Mobile Diagnostics Van Fleet Rollout',
    category: 'Hospital Partnerships',
    image: '/gallery/gallery-20.jpeg',
    date: 'Sep 25, 2025',
    location: 'Civil Hospital, Lucknow',
    description: 'Deployment of mobile diagnostic vans equipped with portable X-Ray and ultrasound units.',
    impactMetrics: '3 Mobile Vans Active',
    aspect: 'wide',
    tags: ['Mobile Fleet', 'Diagnostics', 'Lucknow']
  },
  {
    id: 'gal-21',
    title: 'District Level Cancer Early Warning Seminar',
    category: 'Awareness Workshops',
    image: '/gallery/gallery-21.jpeg',
    date: 'Sep 12, 2025',
    location: 'Ranchi Town Hall, Jharkhand',
    description: 'Seminar for ASHA workers and local nurses on early warning symptom identification.',
    impactMetrics: '210 ASHA Workers Trained',
    aspect: 'square',
    tags: ['ASHA Workers', 'Ranchi', 'Early Warning']
  },
  {
    id: 'gal-22',
    title: 'Community Platelet Donor Network Sign-Up',
    category: 'Community Drives',
    image: '/gallery/gallery-22.jpeg',
    date: 'Aug 29, 2025',
    location: 'Bengaluru Medical College',
    description: 'Registration drive for student donors willing to donate blood and platelets on emergency calls.',
    impactMetrics: '400+ Emergency Donors',
    aspect: 'tall',
    tags: ['Platelet Network', 'Bengaluru', 'Donors']
  },
  {
    id: 'gal-23',
    title: 'Cancer Aware Bharat Annual Impact Showcase',
    category: 'Platform Info',
    image: '/gallery/gallery-23.jpeg',
    date: 'Aug 15, 2025',
    location: 'Constitutional Club of India, New Delhi',
    description: 'Annual gathering celebrating free screenings and patient navigations across states.',
    impactMetrics: '14,000+ Screened • 6 States',
    aspect: 'wide',
    tags: ['Impact Showcase', 'Annual Summit', 'Delhi']
  }
];

export default function GalleryTab({
  onOpenVolunteer,
  onOpenEnquiry
}: {
  onOpenVolunteer?: () => void;
  onOpenEnquiry?: () => void;
}) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItemModal, setActiveItemModal] = useState<GalleryItem | null>(null);

  // Hero slideshow auto-rotation state
  const [heroIndex, setHeroIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    'All',
    'Screening Camps',
    'Community Drives',
    'Hospital Partnerships',
    'Awareness Workshops',
    'Platform Info'
  ];

  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter(item => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const sTerm = searchQuery.toLowerCase();
      const matchSearch =
        item.title.toLowerCase().includes(sTerm) ||
        item.location.toLowerCase().includes(sTerm) ||
        item.description.toLowerCase().includes(sTerm) ||
        item.tags.some(t => t.toLowerCase().includes(sTerm));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <PremiumSection variant="warm-1" withBottomDivider="wave">
        <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">

      {/* ===== 1. FULL-WIDTH HERO SLIDESHOW (NO TEXT OVERLAYS OR BUTTONS) ===== */}
      <section className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-black h-[340px] sm:h-[440px] md:h-[500px] lg:h-[540px] group">
        
        {/* Carousel Background Images with Smooth Fade */}
        {HERO_SLIDES.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === heroIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={imgUrl}
              alt={`Gallery Hero Slide ${idx + 1}`}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-10000"
            />
          </div>
        ))}

        {/* Minimal Hover Controls (Prev/Next Arrows) */}
        <button
          onClick={() => setHeroIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer border border-white/20"
          title="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer border border-white/20"
          title="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Sleek Slide Indicator Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === heroIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </section>

      {/* ===== 2. HEADING & INTRODUCTORY SECTION (BELOW SLIDESHOW) ===== */}
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Image className="w-4 h-4 text-primary" />
            <span>Official Visual Archives</span>
          </div>

          <h1 className="font-headline-lg text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Documenting Hope, Outreach & <span className="text-primary">Clinical Impact</span>
          </h1>

          <p className="font-body-lg text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore visual moments from our screening assemblies, rural mobile diagnostic drives, volunteer training workshops, and partner hospital network across India.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-1">
          {onOpenEnquiry && (
            <button
              onClick={onOpenEnquiry}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md transition-all cursor-pointer"
            >
              Request Screening Camp / Patient Enquiry
            </button>
          )}
          <button
            onClick={() => navigate('/about')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            Explore Mission & Vision
          </button>
        </div>
      </section>

      {/* ===== 3. CATEGORY FILTERS & SEARCH BAR ===== */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, activity, tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-primary outline-none text-xs transition-all"
            />
          </div>

        </div>
      </section>
        </div>
      </PremiumSection>

      <PremiumSection variant="warm-2" withTopDivider="wave" withBottomDivider="wave">
        <div className="space-y-16">

      {/* ===== 4. MODERN PINTEREST / EDITORIAL MASONRY GALLERY (NO BLOG CARDS) ===== */}
      <section className="space-y-6">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <Image className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700">No media items found matching criteria</p>
            <p className="text-xs text-slate-400">Try adjusting your filter category or search term.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItemModal(item)}
                className="relative rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-300 break-inside-avoid"
              >
                {/* Pure Photography Tile with Hover Zoom */}
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out ${
                    item.aspect === 'tall' ? 'h-80 sm:h-96' : item.aspect === 'square' ? 'h-64 sm:h-72' : 'h-52 sm:h-60'
                  }`}
                  loading="lazy"
                />

                {/* Subtle Permanent Category Tag (Top-Left) */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-sm z-10">
                  {item.category}
                </span>

                {/* Hover Gradient Overlay with Image Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date} • {item.location}
                  </span>

                  <h3 className="font-headline-lg text-base font-bold leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-white/80 line-clamp-2 mt-1 font-normal">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 bg-primary/90 px-2 py-0.5 rounded border border-primary/30 truncate max-w-[170px]">
                      {item.impactMetrics}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== 5. PLATFORM ARCHITECTURE SECTION ===== */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Globe className="w-64 h-64 text-slate-400" />
        </div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-slate-300 text-xs font-bold uppercase tracking-wider border border-primary/30">
            About Cancer Aware Bharat Digital Ecosystem
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-4xl font-black">
            Connecting Community Outreach with Clinical Authority
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Cancer Aware Bharat (CAB) combines localized rural screening assemblies, volunteer advocates, and partner oncology hospitals to streamline early detection and referral support across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-slate-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">2-Tier Audit Protocol</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every screening camp referral and patient enquiry undergoes 2-tier clinical verification before partner hospital assignment.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Partner Hospital Network</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Collaborating with NABH-accredited oncology institutes to provide subsidized chemotherapy, radiotherapy, and surgical oncology beds.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Grassroots Volunteer Advocates</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Over 2,400 certified caseworkers guiding rural families from preliminary screening to tertiary hospital care.
            </p>
          </div>
        </div>
      </section>
        </div>
      </PremiumSection>

      {/* ===== 6. FULLSCREEN LIGHTBOX PREVIEW MODAL ===== */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setActiveItemModal(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High-Res Photo Container */}
            <div className="h-80 sm:h-[460px] relative bg-slate-950">
              <img
                src={activeItemModal.image}
                alt={activeItemModal.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Photo Metadata & Description */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {activeItemModal.category}
                </span>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> {activeItemModal.date}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-secondary" /> {activeItemModal.location}</span>
                </div>
              </div>

              <h3 className="font-headline-lg text-xl sm:text-2xl font-bold text-slate-900">{activeItemModal.title}</h3>

              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {activeItemModal.description}
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Impact Milestone</span>
                <span className="text-xs font-black text-slate-900">{activeItemModal.impactMetrics}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeItemModal.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
