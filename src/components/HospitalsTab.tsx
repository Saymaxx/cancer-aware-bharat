import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Mail, Globe, ShieldCheck, Heart, Info, ArrowUpRight, CheckCircle, Map, Building2 } from 'lucide-react';
import { INITIAL_HOSPITALS } from '../data';
import { Hospital, HospitalPartnerRequest } from '../types';
import MapContainer from './MapContainer';
import PremiumSection from './common/PremiumSection';

interface HospitalsTabProps {
  onOpenEnquiry: (hospitalId?: string) => void;
}

export default function HospitalsTab({ onOpenEnquiry }: HospitalsTabProps) {
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'north' | 'south' | 'east' | 'west'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Center of Excellence' | 'Community Partner'>('all');

  // Partnership form states
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [hospName, setHospName] = useState('');
  const [repName, setRepName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [motivation, setMotivation] = useState('');
  const [formError, setFormError] = useState('');

  const filteredHospitals = INITIAL_HOSPITALS.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRegion = regionFilter === 'all' || h.region === regionFilter;
    const matchesType = typeFilter === 'all' || h.type === typeFilter;

    return matchesSearch && matchesRegion && matchesType;
  });

  const handlePartnerRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !repName || !email || !phone || !city) {
      setFormError('Please fill in all the required fields.');
      return;
    }

    const newRequest = {
      id: 'HOSP-APP-' + Math.floor(1000 + Math.random() * 9000),
      name: hospName,
      hospitalName: hospName,
      contactName: repName,
      designation,
      contactEmail: email,
      email,
      contactPhone: phone,
      phone,
      city,
      state: 'Delhi',
      address: `${city}, India`,
      specialties: specialties ? specialties.split(',').map(s => s.trim()) : ['General Oncology'],
      motivation,
      appliedDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      nabhAccredited: true,
      bedCount: 150,
      documents: [
        { name: 'NABH Accreditation Certificate', verified: true },
        { name: 'Hospital Registration License', verified: true },
        { name: 'Fire Safety Clearance', verified: true },
      ],
      recommendedBy: null,
      recommendationNotes: null,
      status: 'Pending Review'
    };

    // Save request to LocalStorage
    const existing = localStorage.getItem('aware_bharat_hospital_requests');
    const list = existing ? JSON.parse(existing) : [];
    list.push(newRequest);
    localStorage.setItem('aware_bharat_hospital_requests', JSON.stringify(list));

    setFormSubmitted(true);
    setFormError('');
  };

  const handleResetForm = () => {
    setShowRequestForm(false);
    setFormSubmitted(false);
    setHospName('');
    setRepName('');
    setDesignation('');
    setEmail('');
    setPhone('');
    setCity('');
    setSpecialties('');
    setMotivation('');
  };

  return (
    <>
      <PremiumSection variant="warm-1" withBottomDivider="wave">
        <div className="space-y-12">
      {/* Tab Header Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="section-badge mx-auto">Our Network</span>
        <h1 className="font-outfit text-primary text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Our Nationwide Oncology Partners
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          We integrate only with recognized clinical centers and supportive community hospitals across India to maintain standard diagnostic oncology paths.
        </p>

        {/* Hospital Portal Access Button */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/hospital/login')}
              className="btn-primary !text-xs"
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital Partner Login / Apply Portal</span>
            </button>
          </div>
      </section>

      {/* Network Map Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="font-outfit text-primary text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center"><Map className="w-4 h-4 text-primary" /></div>
              Interactive Hospital Map
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">Explore clinical locations and partners across the country.</p>
          </div>
          <button
            onClick={() => navigate('/hospital/login')}
            className="btn-accent !py-2 !px-4 !text-xs shrink-0"
          >
            Join Network <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Rendering Container */}
        <MapContainer 
          onSelectHospital={(h) => setSelectedHospital(h)} 
          onOpenContact={(id) => onOpenEnquiry(id)} 
        />
      </section>

      {/* Main Directory & Filters */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Directory search and results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 border border-outline-variant/40 rounded-2xl shadow-xs space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-on-surface-variant/70" />
              <input
                type="text"
                placeholder="Search partner by name, city, or specialty (e.g. Radiation)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              />
            </div>

            {/* Region Filter Buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Filter by Region</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'all', label: 'All Regions' },
                  { value: 'north', label: 'North India' },
                  { value: 'south', label: 'South India' },
                  { value: 'east', label: 'East India' },
                  { value: 'west', label: 'West India' }
                ].map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRegionFilter(r.value as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      regionFilter === r.value 
                        ? 'bg-primary border-primary text-white shadow-xs' 
                        : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-variant/30'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter Buttons */}
            <div className="space-y-2 pt-1 border-t border-outline-variant/10">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Filter by Center Type</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'all', label: 'All Center Types' },
                  { value: 'Center of Excellence', label: 'Centers of Excellence' },
                  { value: 'Community Partner', label: 'Community Partners' }
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(t.value as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      typeFilter === t.value 
                        ? 'bg-secondary border-secondary text-white shadow-xs' 
                        : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-variant/30'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hospital Listings List */}
          <div className="space-y-4">
            {filteredHospitals.length === 0 ? (
              <div className="p-8 text-center bg-white border border-outline-variant/30 rounded-2xl">
                <p className="font-title-md text-base text-primary font-bold">No hospitals matched your query.</p>
                <p className="text-xs text-on-surface-variant mt-1">Try clearing your filters or searching for another term like Delhi or Support.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setRegionFilter('all'); setTypeFilter('all'); }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredHospitals.map(hosp => (
                <div 
                  key={hosp.id} 
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    selectedHospital?.id === hosp.id ? 'border-primary ring-2 ring-primary/25' : 'border-outline-variant/40'
                  }`}
                  onClick={() => setSelectedHospital(hosp)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Hospital Logo / Initial Letter Badge */}
                    <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-outline-variant/30 overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                      {hosp.logo ? (
                        <img src={hosp.logo} alt={hosp.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="font-headline-lg text-xl font-bold text-primary">{hosp.name[0]}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          hosp.type === 'Center of Excellence' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-secondary/10 text-secondary'
                        }`}>
                          {hosp.type}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded-full capitalize">
                          {hosp.region} India
                        </span>
                      </div>
                      <h3 className="font-title-md text-base font-bold text-primary">{hosp.name}</h3>
                      <p className="text-xs text-on-surface-variant font-medium flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {hosp.city}, {hosp.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-stretch gap-2 w-full md:w-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHospital(hosp);
                      }}
                      className="flex-1 md:flex-none px-3.5 py-1.5 bg-surface-variant text-primary text-xs font-bold rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEnquiry(hosp.id);
                      }}
                      className="flex-1 md:flex-none px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 shadow-sm flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Contact
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Hospital Detailed Inspector */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 shadow-xs min-h-[400px] flex flex-col justify-between">
            {selectedHospital ? (
              <div className="space-y-6">
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      selectedHospital.type === 'Center of Excellence' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'bg-secondary/10 text-secondary border border-secondary/20'
                    }`}>
                      {selectedHospital.type}
                    </span>
                    <button 
                      onClick={() => setSelectedHospital(null)}
                      className="text-on-surface-variant hover:text-on-surface text-xs font-bold p-1 rounded-full hover:bg-surface-container-high transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <h2 className="font-headline-lg text-xl font-bold text-primary leading-tight">{selectedHospital.name}</h2>
                  <p className="text-xs text-on-surface-variant font-semibold flex items-center gap-0.5">
                    <MapPin className="w-4 h-4 text-primary" /> {selectedHospital.address}
                  </p>
                </div>

                {/* Main description */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">About the Institute</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {selectedHospital.description}
                  </p>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Core Oncological Specialties</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHospital.specialties.map(spec => (
                      <span key={spec} className="bg-white text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary-fixed-dim/30 shadow-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact info card */}
                <div className="p-3.5 bg-white border border-outline-variant/30 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Direct Inquiries</span>
                  <div className="space-y-1.5 text-xs text-on-surface">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-4 h-4 text-primary" /> {selectedHospital.phone}
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-4 h-4 text-primary" /> {selectedHospital.email}
                    </p>
                  </div>
                </div>

                {/* Button Action */}
                <button
                  onClick={() => onOpenEnquiry(selectedHospital.id)}
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Book Consultation / Ask Question
                </button>
              </div>
            ) : (
              /* Stale Inspector state */
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
                <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center text-primary">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-title-md text-sm text-primary font-bold">Select a Facility</h3>
                  <p className="text-xs text-on-surface-variant max-w-[240px] mt-1 leading-relaxed">
                    Click "Details" on any hospital card or click on a map pin to inspect contact channels, specialized clinical programs, and map coordinates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enroll Hospital Modal/Form section */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-xl rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.15)] border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-secondary px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-secondary-container" />
                <span className="font-headline-lg text-lg font-bold">Join our Nationwide Network</span>
              </div>
              <button onClick={handleResetForm} className="text-white hover:text-white p-1 rounded-full">
                ✕
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto flex-grow">
              {!formSubmitted ? (
                <form onSubmit={handlePartnerRequestSubmit} className="space-y-4">
                  
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                      {formError}
                    </div>
                  )}

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Are you a hospital coordinator, chief oncologist, or executive director wanting to join Cancer Aware Bharat? Apply below to integrate your facility's diagnostic channels and screening slots into our network.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Hospital/Clinical Center Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={hospName}
                        onChange={e => setHospName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                        placeholder="e.g. Apollo Cancer Center Pune"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          Contact Representative Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={repName}
                          onChange={e => setRepName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                          placeholder="e.g. Dr. Siddharth Roy"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={e => setDesignation(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                          placeholder="e.g. Chief Medical Director"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          Official Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                          placeholder="coordinator@hospital.org"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          City of Operation <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                          placeholder="e.g. Pune, Maharashtra"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                        placeholder="Direct contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Cancer Specialties Offered (e.g. Mammography, Chemo)
                      </label>
                      <input
                        type="text"
                        value={specialties}
                        onChange={e => setSpecialties(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                        placeholder="e.g. Immunotherapy, Surgical Oncology, Free PAP Screening"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Why does your facility want to partner with us?
                      </label>
                      <textarea
                        rows={3}
                        value={motivation}
                        onChange={e => setMotivation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                        placeholder="Share your interest in running free camps or assisting patient navigation..."
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-outline-variant/10">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-1/3 py-2 rounded-lg border border-outline text-xs font-semibold text-on-surface-variant"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-grow py-2 rounded-lg bg-secondary text-white font-bold text-xs"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 px-4 space-y-4 flex flex-col items-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-primary">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-headline-lg text-lg text-primary font-bold">Application Registered</h3>
                    <p className="text-xs text-on-surface-variant mt-1 max-w-sm leading-relaxed">
                      Thank you for applying, <strong>{repName}</strong>. Our clinical alliance coordinator will review <strong>{hospName}</strong>'s infrastructure capabilities and contact you within 3 business days to set up screening standards protocols.
                    </p>
                  </div>
                  <button
                    onClick={handleResetForm}
                    className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
      </PremiumSection>
    </>
  );
}
