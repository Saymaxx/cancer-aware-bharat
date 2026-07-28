import React, { useState } from 'react';
import { X, CheckCircle, Heart, Award } from 'lucide-react';
import { VolunteerRegistration } from '../types';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VolunteerModal({ isOpen, onClose }: VolunteerModalProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [registeredId, setRegisteredId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [domain, setDomain] = useState('General Volunteer');
  const [area, setArea] = useState('Educational Campaigns');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [motivation, setMotivation] = useState('');
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !motivation) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }
    if (!consent) {
      setErrorMessage('Please agree to the Volunteer Code of Conduct.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const volunteerId = `V-2026-${randomNum}`;

    const newRegistration: VolunteerRegistration = {
      id: Math.random().toString(36).substr(2, 9),
      name: fullName,
      email,
      phone,
      area: `${domain} - ${area}`,
      availableDays: selectedDays,
      motivation,
      date: new Date().toLocaleDateString(),
      volunteerId
    };

    // Store in localStorage
    const existing = localStorage.getItem('aware_bharat_volunteers');
    const list = existing ? JSON.parse(existing) : [];
    list.push(newRegistration);
    localStorage.setItem('aware_bharat_volunteers', JSON.stringify(list));

    setRegisteredId(volunteerId);
    setFormSubmitted(true);
    setErrorMessage('');
  };

  const handleReset = () => {
    setFormSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setDomain('General Volunteer');
    setArea('Educational Campaigns');
    setSelectedDays([]);
    setMotivation('');
    setConsent(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="volunteer-modal-title"
    >
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.15)] border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-secondary-container" fill="currentColor" />
            <span id="volunteer-modal-title" className="font-headline-lg text-xl font-bold">Join as a Volunteer</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="bg-surface-container-low p-4 rounded-lg border border-primary-fixed-dim/30 text-xs text-primary font-medium leading-relaxed">
                Thank you for your willingness to serve. Volunteers are the absolute lifeblood of Cancer Aware Bharat. Your clinical expertise or human empathy can touch, guide, and save lives in local communities.
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Your Profile/Domain
                  </label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  >
                    <option value="General Volunteer">General Volunteer</option>
                    <option value="Oncologist / Physician">Oncologist / Physician</option>
                    <option value="Nurse / Clinical Assistant">Nurse / Clinical Assistant</option>
                    <option value="Cancer Survivor Advocate">Cancer Survivor Advocate</option>
                    <option value="Medical Student">Medical / Nursing Student</option>
                    <option value="Corporate Professional">Corporate Professional</option>
                  </select>
                </div>
              </div>

              {/* Area of Interest */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Primary Area of Interest
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { value: 'Educational Campaigns', label: 'Education & Warning Sign Campaigns' },
                    { value: 'Free Screening Support', label: 'On-site Screening Camps' },
                    { value: 'Patient Navigation Support', label: 'Patient Guidance & Translation' },
                    { value: 'Admin & Operations', label: 'Logistics & Administrative Help' },
                    { value: 'Counseling & Support Groups', label: 'Psychological Support Circles' },
                    { value: 'Tech & Digital Awareness', label: 'Design, Writing & Portal Tech' }
                  ].map(opt => (
                    <label 
                      key={opt.value}
                      className={`flex items-start p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        area === opt.value 
                          ? 'border-primary bg-surface-container text-primary font-semibold' 
                          : 'border-outline-variant/50 hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="radio"
                        name="areaOfInterest"
                        value={opt.value}
                        checked={area === opt.value}
                        onChange={() => setArea(opt.value)}
                        className="sr-only"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Available Days for Campaigns
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {daysList.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-primary border-primary text-white shadow-sm' 
                            : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-variant/40'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Why do you want to join Cancer Aware Bharat? <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  placeholder="Share what inspires you to contribute to cancer detection and support..."
                />
              </div>

              {/* Code of Conduct Consent */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant flex items-start space-x-3">
                <input
                  id="conduct-checkbox"
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded mt-0.5 cursor-pointer"
                />
                <label htmlFor="conduct-checkbox" className="text-xs text-on-surface-variant select-none leading-relaxed cursor-pointer">
                  I agree to the <span className="text-primary font-bold">Volunteer Code of Conduct</span>. I pledge to interact with patients, survivors, and medical personnel with absolute dignity, integrity, empathy, and respect.
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-md transition-opacity cursor-pointer"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 px-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 rounded-full border-2 border-green-400 flex items-center justify-center text-green-500 mb-4 animate-pulse">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h3 className="font-headline-lg text-2xl text-primary mb-2">Registration Complete!</h3>
              <p className="font-body-md text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                Welcome to the family, <strong className="text-on-surface">{fullName}</strong>! Your application is registered. Our community outreach coordinator will review your schedule and reach out to guide you further.
              </p>

              {/* Volunteer Card */}
              <div className="bg-surface-container border border-primary-fixed-dim rounded-xl p-5 w-full max-w-sm shadow-md mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Award className="w-24 h-24 text-primary" />
                </div>
                <div className="text-left space-y-3">
                  <div className="flex justify-between items-center border-b border-primary-fixed-dim/30 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Aware Bharat Volunteer</span>
                    <span className="font-mono text-xs font-bold text-secondary bg-secondary-fixed/50 px-2.5 py-0.5 rounded-full">{registeredId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-on-surface-variant">Name:</span>
                      <p className="font-semibold text-on-surface">{fullName}</p>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Assigned Area:</span>
                      <p className="font-semibold text-on-surface">{area}</p>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Profile:</span>
                      <p className="font-semibold text-on-surface">{domain}</p>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Active Since:</span>
                      <p className="font-semibold text-on-surface">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-95 transition-opacity"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
