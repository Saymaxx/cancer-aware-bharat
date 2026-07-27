import React, { useState } from 'react';
import { Search, Calendar, MapPin, Users, Heart, ChevronDown, ChevronUp, CheckCircle, History, ArrowRight } from 'lucide-react';
import { INITIAL_EVENTS } from '../data';
import { Event } from '../types';

interface EventsTabProps {
  onOpenEnquiry: () => void;
}

export default function EventsTab({ onOpenEnquiry }: EventsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Blood Donation' | 'Screening Camp' | 'Workshop'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Simulated live slots counter that persists in react state
  const [liveEvents, setLiveEvents] = useState<Event[]>(INITIAL_EVENTS);

  // Past events data with local camp photos
  const pastEvents = [
    {
      id: 'past-1',
      title: 'Patna Rural Screening Assembly',
      date: 'Dec 12, 2025',
      location: 'Gaya Panchayat Bhavan, Bihar',
      impact: '350+ Villagers Checked',
      summary: 'Operated 2 mobile diagnostic units in collaboration with Patna Oncology partners. Identified 12 early-stage pre-malignant oral lesions, successfully mapping patients to tertiary oncology wards within 10 days.',
      image: '/events/event-7.jpeg'
    },
    {
      id: 'past-2',
      title: 'Nagpur Breast Cancer Awareness Drive',
      date: 'Nov 05, 2025',
      location: 'Government College Grounds, Nagpur',
      impact: '420+ Women Guided',
      summary: 'Conducted a comprehensive tutorial on Breast Self-Examination BSE protocols. Deployed a portable low-cost thermal scanner to flag suspicious thermal anomalies in 8 asymptomatic women, now under observation.',
      image: '/events/event-8.jpeg'
    },
    {
      id: 'past-3',
      title: 'Mumbai Tobacco Prevention Teen Campaign',
      date: 'Oct 14, 2024',
      location: '12 Municipal Schools, Bandra East',
      impact: '1,800+ Students Pledged',
      summary: 'Delivered an interactive audio-visual presentation outlining the carcinogenic impacts of tobacco and vape cartridges. Established student-led anti-tobacco cells in 8 schools to sustain awareness peer-to-peer.',
      image: '/events/event-9.jpeg'
    },
    {
      id: 'past-4',
      title: 'Varanasi Grassroots Health & Mammography Drive',
      date: 'Sep 28, 2024',
      location: 'Chandauli Block Center, UP',
      impact: '510+ Screenings',
      summary: 'Mobilized rural families for free breast and oral screening under expert surgical oncology guidance.',
      image: '/events/event-10.jpeg'
    }
  ];

  const [expandedPastId, setExpandedPastId] = useState<string | null>(null);

  const filteredEvents = liveEvents.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || e.type === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Page header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="section-badge mx-auto">Campaign Schedule</span>
        <h1 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Upcoming Diagnostic Camps & Events
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Book free admissions to our localized screening drives. Ensure early cancer screening for you and your loved ones entirely free of charge.
        </p>
      </section>

      {/* Main Events list and filters */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Active Events Directory Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Controls Box */}
          <div className="card-premium !rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant/50" />
              <input
                type="text"
                placeholder="Search active camps by title, city, or venue..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-premium !pl-9 !py-2.5 !text-xs"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { val: 'all', label: 'All' },
                { val: 'Screening Camp', label: 'Screening' },
                { val: 'Blood Donation', label: 'Blood Drives' },
                { val: 'Workshop', label: 'Workshops' }
              ].map(cat => (
                <button
                  key={cat.val}
                  onClick={() => setCategoryFilter(cat.val as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${categoryFilter === cat.val
                      ? 'gradient-primary text-white shadow-sm'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Events Cards List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="p-10 text-center card-premium">
                <p className="font-outfit text-sm text-primary font-bold">No upcoming campaigns matched your search criteria.</p>
                <p className="text-xs text-on-surface-variant mt-1">Try resetting the filter search box above.</p>
              </div>
            ) : (
              filteredEvents.map(camp => {
                const isExpanded = expandedEventId === camp.id;
                const remainingSlots = camp.capacity - camp.registeredCount;
                const capacityPercent = (camp.registeredCount / camp.capacity) * 100;

                return (
                  <div key={camp.id} className="card-premium overflow-hidden">
                    <div className="p-5 flex flex-col md:flex-row gap-5 items-start">
                      {/* Event Mini Thumbnail Image */}
                      <div className="w-full md:w-36 h-24 rounded-xl bg-surface-container overflow-hidden flex-shrink-0">
                        <img src={camp.image} alt={camp.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Info layout */}
                      <div className="flex-grow space-y-2 text-left">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/8 text-primary px-2.5 py-1 rounded-lg">
                            {camp.type}
                          </span>
                          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Active Booking
                          </span>
                        </div>

                        <h3 className="font-outfit text-base font-bold text-on-surface">{camp.title}</h3>

                        <div className="flex flex-wrap gap-4 text-xs font-medium text-on-surface-variant">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> {camp.date} • {camp.time}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> {camp.location}
                          </p>
                        </div>
                      </div>

                      {/* Expander Trigger */}
                      <button
                        onClick={() => setExpandedEventId(isExpanded ? null : camp.id)}
                        className="p-2 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors self-end md:self-center cursor-pointer"
                        title="Show description"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
                      </button>
                    </div>

                    {/* Collapsible Expansion Box */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-outline-variant/10 bg-surface-container-low/30 space-y-4">
                        <div className="space-y-1.5 pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">Campaign Description</span>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {camp.description}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-outline-variant/10">
                          <div className="text-xs space-y-2 flex-1">
                            <span className="text-on-surface-variant">Current Availability:</span>
                            <div>
                              <p className="font-bold text-primary text-sm">
                                {remainingSlots > 0 ? `${remainingSlots} Free Slots Left` : 'Fully Booked'}
                                <span className="text-xs text-on-surface-variant font-normal ml-1">out of {camp.capacity}</span>
                              </p>
                              <div className="h-1.5 bg-outline-variant/15 rounded-full overflow-hidden mt-2 max-w-[200px]">
                                <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${capacityPercent}%` }} />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={onOpenEnquiry}
                            disabled={remainingSlots <= 0}
                            className="btn-primary !py-2.5 !px-5 !text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none shrink-0"
                          >
                            {remainingSlots > 0 ? 'Reserve My Free Seat' : 'Waiting List Full'}
                            {remainingSlots > 0 && <ArrowRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Historic Camps / Past Success Gallery */}
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-2">
            <h2 className="font-outfit text-primary text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <History className="w-4 h-4 text-primary" />
              </div>
              Historic Assembly Gallery
            </h2>
            <p className="text-xs text-on-surface-variant">A glimpse at our successful cancer screening campaigns.</p>
          </div>

          <div className="space-y-4">
            {pastEvents.map(past => {
              const isPastExpanded = expandedPastId === past.id;

              return (
                <div key={past.id} className="card-subtle overflow-hidden">
                  <div className="h-32 relative bg-surface-container overflow-hidden">
                    <img src={past.image} alt={past.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    <span className="absolute bottom-2 left-2 glass text-xs font-bold text-primary px-2.5 py-1 rounded-lg shadow-sm">
                      {past.impact}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 text-left">
                    <span className="text-[10px] text-on-surface-variant/60 font-medium">{past.date} • {past.location}</span>
                    <h4 className="font-outfit text-sm font-bold text-on-surface leading-tight line-clamp-1">{past.title}</h4>

                    {isPastExpanded ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {past.summary}
                        </p>
                        <button
                          onClick={() => setExpandedPastId(null)}
                          className="text-[11px] text-primary font-semibold hover:underline flex items-center cursor-pointer"
                        >
                          Show Less <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedPastId(past.id)}
                        className="text-[11px] text-primary font-semibold hover:underline flex items-center cursor-pointer"
                      >
                        Read Success Summary <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
