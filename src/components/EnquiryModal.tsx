import React, { useState } from 'react';
import { X, CheckCircle, Phone, Stethoscope, Clock, Calendar } from 'lucide-react';
import { INITIAL_HOSPITALS } from '../data';
import { PatientEnquiry } from '../types';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHospitalId?: string; // Preselect hospital if user clicked 'Contact' from hospital tab
}

export default function EnquiryModal({ isOpen, onClose, selectedHospitalId }: EnquiryModalProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [referenceNum, setReferenceNum] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [reason, setReason] = useState('Free Cancer Screening');
  const [hospitalId, setHospitalId] = useState(selectedHospitalId || INITIAL_HOSPITALS[0].id);
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if selectedHospitalId changes or is loaded
  React.useEffect(() => {
    if (selectedHospitalId) {
      setHospitalId(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !age || !phone || !city || !preferredDate) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setErrorMessage('Please enter a valid age.');
      return;
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const refNum = `PAT-2026-${randomNum}`;

    const newEnquiry: PatientEnquiry = {
      id: Math.random().toString(36).substr(2, 9),
      patientName,
      age: ageNum,
      gender,
      city,
      phone,
      reason,
      hospitalId,
      preferredDate,
      status: 'Pending',
      referenceNumber: refNum,
      date: new Date().toLocaleDateString()
    };

    // Store in LocalStorage
    const existing = localStorage.getItem('aware_bharat_patient_enquiries');
    const list = existing ? JSON.parse(existing) : [];
    list.push(newEnquiry);
    localStorage.setItem('aware_bharat_patient_enquiries', JSON.stringify(list));

    setReferenceNum(refNum);
    setFormSubmitted(true);
    setErrorMessage('');
  };

  const selectedHospital = INITIAL_HOSPITALS.find(h => h.id === hospitalId) || INITIAL_HOSPITALS[0];

  const handleReset = () => {
    setFormSubmitted(false);
    setPatientName('');
    setAge('');
    setGender('Female');
    setPhone('');
    setCity('');
    setReason('Free Cancer Screening');
    setHospitalId(INITIAL_HOSPITALS[0].id);
    setPreferredDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.15)] border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-on-primary-container" />
            <span className="font-headline-lg text-xl font-bold">Patient Enquiry & Camp Booking</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="bg-surface-container-low p-3.5 rounded-lg border border-primary-fixed-dim/30 text-xs text-primary leading-relaxed">
                <strong>Need expert medical navigation?</strong> Submit your details below to request a prioritized appointment slot, free screening camp admission, or clinical second opinion at one of our renowned partner hospitals. All inquiries are strictly confidential.
              </div>

              {/* Patient Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="Enter patient's name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                      placeholder="e.g. 45"
                      min="1"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="10-digit phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    City & State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="e.g. Pune, Maharashtra"
                  />
                </div>
              </div>

              {/* Consultation details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Inquiry Reason
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  >
                    <option value="Free Cancer Screening">Free Cancer Screening Camp Admission</option>
                    <option value="Clinical Second Opinion">Clinical Second Opinion from Specialist</option>
                    <option value="Chemotherapy / Radiotherapy guidance">Treatment / Chemotherapy Navigation</option>
                    <option value="Financial Aid / Gov Scheme Assistance">Financial Aid & Government Scheme Guidance</option>
                    <option value="Psychological support / Counseling">Survivor & Caregiver Counseling Circles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Preferred Partner Hospital
                  </label>
                  <select
                    value={hospitalId}
                    onChange={e => setHospitalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  >
                    {INITIAL_HOSPITALS.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Preferred Date of Camp/Appointment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm cursor-pointer"
                  />
                </div>
                <div className="flex items-center text-xs text-on-surface-variant bg-surface-container-low p-2 rounded border border-outline-variant/30">
                  <Clock className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                  <span>Appointments are pre-screened based on immediate clinical urgency. We will notify you via call/SMS.</span>
                </div>
              </div>

              {/* Clinical History/Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Symptoms, diagnosis or medical questions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  placeholder="Provide brief details on current cancer staging, symptoms, past medical reports, or what guidance you are seeking..."
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-md transition-opacity cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 px-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 rounded-full border-2 border-green-400 flex items-center justify-center text-green-500 mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h3 className="font-headline-lg text-2xl text-primary mb-2">Inquiry Submitted Successfully!</h3>
              <p className="font-body-md text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                Thank you, <strong className="text-on-surface">{patientName}</strong>. Your patient navigation request has been created. A certified medical caseworker from Cancer Aware Bharat will call you back within 12-24 hours.
              </p>

              {/* Confirmation Slip */}
              <div className="bg-surface-container border border-primary-fixed-dim rounded-xl p-5 w-full max-w-md shadow-md mb-8 text-left space-y-4">
                <div className="flex justify-between items-center border-b border-primary-fixed-dim/30 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Patient Reference Card</span>
                  <span className="font-mono text-sm font-bold text-secondary bg-secondary-fixed/50 px-3 py-0.5 rounded-full">{referenceNum}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-on-surface-variant block">Patient Name:</span>
                    <p className="font-semibold text-on-surface">{patientName} ({age} / {gender})</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Casework Region:</span>
                    <p className="font-semibold text-on-surface">{city}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-on-surface-variant block">Requested Facility:</span>
                    <p className="font-semibold text-primary font-title-md text-sm">{selectedHospital.name}</p>
                    <p className="text-on-surface-variant">{selectedHospital.address}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Inquiry Stream:</span>
                    <p className="font-semibold text-on-surface">{reason}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Target Date:</span>
                    <p className="font-semibold text-on-surface flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {(() => {
                        try {
                          const d = new Date(preferredDate);
                          if (isNaN(d.getTime())) return preferredDate;
                          return d.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'});
                        } catch (e) {
                          return preferredDate;
                        }
                      })()}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/60 border border-outline-variant/40 rounded-lg text-xs text-on-surface-variant">
                  <strong className="text-primary block mb-1">What to do next:</strong>
                  <ul className="list-decimal pl-4 space-y-1 mt-1">
                    <li>Keep your mobile phone nearby. Our clinical caseworker will call to confirm.</li>
                    <li>Assemble all your previous medical prescriptions, biopsy scans, and blood reports.</li>
                    <li>If attending a screening camp, please arrive fasting if requested by the caseworker.</li>
                  </ul>
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
