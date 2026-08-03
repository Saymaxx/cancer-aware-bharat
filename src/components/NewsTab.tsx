import React, { useState, useMemo } from 'react';
import { Newspaper, ChevronRight, Search, Calendar, MapPin, ArrowRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import RevealSection from './common/RevealSection';
import PremiumSection from './common/PremiumSection';

// --- Mock Data ---
const NEWS_CATEGORIES = ['All', 'Announcements', 'Events', 'Medical', 'Campaigns', 'Partnerships'];

const UPCOMING_EVENTS = [
  {
    id: 'ue1',
    title: 'Women\'s Health Screening Camp',
    date: 'August 15, 2026',
    location: 'Pune General Hospital, Pune',
    description: 'Free breast and cervical cancer screening for women over 40.',
    image: '/events/event-2.jpeg'
  },
  {
    id: 'ue2',
    title: 'Tobacco Awareness Seminar',
    date: 'August 22, 2026',
    location: 'Delhi University Campus',
    description: 'Educational seminar on the dangers of tobacco consumption targeting youth.',
    image: '/events/event-4.jpeg'
  },
  {
    id: 'ue3',
    title: 'Rural Outreach Drive',
    date: 'September 5, 2026',
    location: 'Patna Rural District',
    description: 'A 3-day health camp focused on early cancer detection in rural communities.',
    image: '/events/event-6.jpeg'
  },
  {
    id: 'ue4',
    title: 'National Cancer Walkathon',
    date: 'September 12, 2026',
    location: 'Marine Drive, Mumbai',
    description: 'Join thousands in walking to raise awareness and funds for cancer research.',
    image: '/events/event-8.jpeg'
  }
];

const MOCK_NEWS = [
  {
    id: 'n1',
    title: 'Free Oral Cancer Screening Camp in Varanasi Completes Successfully',
    category: 'Campaigns',
    date: 'July 25, 2026',
    description: 'Over 5,000 residents were screened in our latest grassroots initiative aimed at combating the rising rates of oral cancer in Northern India.',
    image: '/gallery/gallery-4.jpeg',
    featured: true
  },
  {
    id: 'n2',
    title: 'Breast Cancer Awareness Walk Successfully Completed in Delhi',
    category: 'Events',
    date: 'July 20, 2026',
    description: 'Thousands of survivors and advocates marched through central Delhi to raise awareness and support for early detection.',
    image: '/gallery/gallery-7.jpeg'
  },
  {
    id: 'n3',
    title: 'New Hospital Partnership Announced with AIIMS',
    category: 'Partnerships',
    date: 'July 15, 2026',
    description: 'Cancer Aware Bharat has officially partnered with AIIMS to expedite subsidized treatment for rural patients.',
    image: '/gallery/gallery-10.jpeg'
  },
  {
    id: 'n4',
    title: 'Upcoming Women\'s Health Screening Camp Schedule Released',
    category: 'Announcements',
    date: 'July 10, 2026',
    description: 'We are organizing 15 dedicated women\'s health camps across Maharashtra this August. Registration is now open.',
    image: '/events/event-3.jpeg'
  },
  {
    id: 'n5',
    title: 'Cancer Awareness Drive Reaches 50 Remote Rural Villages',
    category: 'Campaigns',
    date: 'July 5, 2026',
    description: 'Our mobile medical units have successfully completed their first quarter targets, providing essential education to underserved populations.',
    image: '/gallery/gallery-12.jpeg'
  },
  {
    id: 'n6',
    title: 'Blood Donation & Cancer Support Initiative Launched',
    category: 'Medical',
    date: 'June 28, 2026',
    description: 'A new joint initiative to ensure steady blood supplies for oncology wards across our partner network.',
    image: '/gallery/gallery-15.jpeg'
  },
  {
    id: 'n7',
    title: 'Free Consultation Week at Tata Memorial Partner Clinics',
    category: 'Medical',
    date: 'June 20, 2026',
    description: 'Get free second opinions from top oncologists at our registered partner clinics during the first week of July.',
    image: '/dr-ajay-kumar.jpg'
  },
  {
    id: 'n8',
    title: 'Youth Tobacco Awareness Campaign Reaches 1M Students',
    category: 'Campaigns',
    date: 'June 15, 2026',
    description: 'Our digital and in-school campaigns targeting tobacco use have hit a major milestone across 5 states.',
    image: '/events/event-5.jpeg'
  },
  {
    id: 'n9',
    title: 'NGO Collaboration Announcement: Fight Cancer Together',
    category: 'Partnerships',
    date: 'June 10, 2026',
    description: 'Five leading regional NGOs have joined our national alliance to share resources and improve patient navigation.',
    image: '/gallery/gallery-22.jpeg'
  },
  {
    id: 'n10',
    title: 'National Cancer Awareness Month Activities Revealed',
    category: 'Announcements',
    date: 'June 5, 2026',
    description: 'Check out the complete calendar of events, webinars, and free screening drives planned for the upcoming awareness month.',
    image: '/hero-gallery/hero-5.jpeg'
  },
  {
    id: 'n11',
    title: 'Student Awareness Seminar Held at Top Universities',
    category: 'Events',
    date: 'May 28, 2026',
    description: 'Medical professionals conducted interactive sessions with students to discuss lifestyle choices and cancer prevention.',
    image: '/gallery/gallery-19.jpeg'
  },
  {
    id: 'n12',
    title: 'Community Outreach Success Story: Early Detection Saves Lives',
    category: 'Medical',
    date: 'May 20, 2026',
    description: 'A recent screening camp in Bihar identified 14 early-stage cases, all of whom are now receiving successful treatment.',
    image: '/events/event-9.jpeg'
  }
];

export default function NewsTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter logic
  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter(news => {
      const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            news.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || news.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const featuredNews = filteredNews.find(n => n.featured) || filteredNews[0];
  const regularNews = filteredNews.filter(n => n.id !== featuredNews?.id);

  const totalPages = Math.ceil(regularNews.length / itemsPerPage);
  const paginatedNews = regularNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-gallery/hero-3.jpeg" 
            alt="Cancer Aware Bharat News" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <RevealSection>
            <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-secondary/30">
              Press Room
            </span>
            <h1 className="font-outfit text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Latest <span className="text-secondary">News</span> & Updates
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium">
              Stay updated with the latest awareness campaigns, screening camps, medical initiatives, upcoming events, and important announcements from Cancer Aware Bharat.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* Main Content Area */}
      <PremiumSection variant="warm-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column (Main Feed) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Search Bar (Mobile only, hidden on desktop since sidebar has one, OR keep it here for all?) 
                Let's put the main search in the left column top for everyone. */}
            <RevealSection delay={100}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, announcements, and events..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-outline-variant/30 text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary shadow-sm text-sm transition-all"
                />
              </div>
            </RevealSection>

            {/* Featured Article */}
            {currentPage === 1 && featuredNews && (
              <RevealSection delay={200}>
                <div className="card-premium overflow-hidden rounded-3xl border border-outline-variant/30 group cursor-pointer hover:border-primary/20 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(22,58,95,0.08)]">
                  <div className="h-64 md:h-80 w-full overflow-hidden relative">
                    <img 
                      src={featuredNews.image} 
                      alt={featuredNews.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="bg-secondary text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {featuredNews.category}
                      </span>
                      <span className="text-white/90 text-xs font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md">
                        {featuredNews.date}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 bg-white">
                    <h2 className="font-outfit text-2xl md:text-3xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                      {featuredNews.title}
                    </h2>
                    <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                      {featuredNews.description}
                    </p>
                    <button className="flex items-center text-primary font-semibold text-sm group-hover:text-secondary transition-colors">
                      Read Full Story <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </RevealSection>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {paginatedNews.length > 0 ? (
                paginatedNews.map((news, i) => (
                  <RevealSection key={news.id} delay={i * 100}>
                    <div className="card-premium h-full flex flex-col overflow-hidden rounded-2xl border border-outline-variant/30 group cursor-pointer hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="h-48 relative overflow-hidden">
                        <img 
                          src={news.image} 
                          alt={news.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/20">
                          {news.category}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1 bg-white">
                        <div className="flex items-center text-xs text-on-surface-variant font-medium mb-2.5">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary/60" /> {news.date}
                        </div>
                        <h3 className="font-outfit text-lg font-bold text-primary mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4 flex-1">
                          {news.description}
                        </p>
                        <button className="flex items-center text-secondary font-bold text-[11px] uppercase tracking-wider group-hover:text-primary transition-colors">
                          Read More <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </RevealSection>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 text-center py-12">
                  <p className="text-on-surface-variant">No news articles found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <RevealSection>
                <div className="flex justify-center items-center space-x-2 pt-8">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white text-primary border border-outline-variant/30 hover:bg-primary/5'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </RevealSection>
            )}

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Categories */}
            <RevealSection delay={150}>
              <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
                <h3 className="font-outfit text-lg font-bold text-primary mb-4 flex items-center border-b border-outline-variant/15 pb-3">
                  <div className="w-2 h-4 bg-secondary rounded-full mr-2" /> Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {NEWS_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Recent Posts (Sidebar) */}
            <RevealSection delay={250}>
              <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
                <h3 className="font-outfit text-lg font-bold text-primary mb-4 flex items-center border-b border-outline-variant/15 pb-3">
                  <div className="w-2 h-4 bg-secondary rounded-full mr-2" /> Recent Posts
                </h3>
                <div className="space-y-4">
                  {MOCK_NEWS.slice(0, 4).map(news => (
                    <div key={`sidebar-${news.id}`} className="flex items-start gap-3 group cursor-pointer">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div>
                        <h4 className="font-outfit text-sm font-bold text-primary line-clamp-2 leading-tight group-hover:text-secondary transition-colors">
                          {news.title}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                          {news.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Upcoming Events */}
            <RevealSection delay={350}>
              <div className="bg-gradient-to-br from-primary to-[#0f2842] rounded-3xl p-6 border border-primary/20 shadow-lg text-white">
                <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center border-b border-white/10 pb-3">
                  <Calendar className="w-5 h-5 mr-2 text-secondary" /> Upcoming Events
                </h3>
                <div className="space-y-5">
                  {UPCOMING_EVENTS.map(event => (
                    <div key={event.id} className="group cursor-pointer">
                      <div className="flex gap-3 mb-2">
                        <div className="bg-white/10 rounded-lg p-2 text-center shrink-0 w-12 h-12 flex flex-col justify-center items-center border border-white/5 group-hover:bg-secondary/20 transition-colors">
                          <span className="text-[10px] uppercase font-bold text-secondary leading-none mb-0.5">
                            {event.date.split(' ')[0].substring(0, 3)}
                          </span>
                          <span className="text-sm font-extrabold text-white leading-none">
                            {event.date.split(' ')[1].replace(',', '')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-outfit text-sm font-bold text-white line-clamp-1 group-hover:text-secondary transition-colors">
                            {event.title}
                          </h4>
                          <p className="text-[10px] text-white/60 flex items-center mt-1 line-clamp-1">
                            <MapPin className="w-3 h-3 mr-1" /> {event.location}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => navigate('/events')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                >
                  View All Events <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </RevealSection>

          </div>
        </div>
      </PremiumSection>
    </>
  );
}
