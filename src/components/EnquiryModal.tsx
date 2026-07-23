import React, { useState } from 'react';
import { X, CheckCircle, Phone, Stethoscope, Clock, Calendar, Upload, FileText, Trash2, Mail } from 'lucide-react';
import { INITIAL_HOSPITALS } from '../data';
import { PatientEnquiry, UploadedReport } from '../types';
import { enquiryStore } from '../enquiryStore';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHospitalId?: string; // Preselect hospital if user clicked 'Contact' from hospital tab
}

export default function EnquiryModal({ isOpen, onClose, selectedHospitalId }: EnquiryModalProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [createdEnquiry, setCreatedEnquiry] = useState<PatientEnquiry | null>(null);

  // Form inputs
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('Free Cancer Screening');
  const [cancerType, setCancerType] = useState('Breast Cancer');
  const [hospitalId, setHospitalId] = useState(selectedHospitalId || INITIAL_HOSPITALS[0].id);
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedReport[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if selectedHospitalId changes or is loaded
  React.useEffect(() => {
    if (selectedHospitalId) {
      setHospitalId(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  if (!isOpen) return null;

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newReports: UploadedReport[] = files.map((file, idx) => ({
        id: 'rep-' + Date.now() + '-' + idx,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: file.type || 'application/pdf',
        uploadedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      }));
      setUploadedFiles(prev => [...prev, ...newReports]);
    }
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !age || !phone || !city || !preferredDate) {
      setErrorMessage('Please fill in all the required fields (*).');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setErrorMessage('Please enter a valid age between 1 and 120.');
      return;
    }

    // Save using enquiryStore (Step 1 requirement)
    const saved = enquiryStore.saveEnquiry({
      patientName: patientName.trim(),
      age: ageNum,
      gender,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || city,
      city: city.trim(),
      reason,
      cancerType,
      symptoms: notes,
      notes,
      uploadedReports: uploadedFiles,
      preferredHospitalId: hospitalId,
      preferredDate,
      priority: notes.toLowerCase().includes('stage') || notes.toLowerCase().includes('biopsy') ? 'Urgent' : 'Normal'
    });

    setCreatedEnquiry(saved);
    setFormSubmitted(true);
    setErrorMessage('');
  };

  const selectedHospital = INITIAL_HOSPITALS.find(h => h.id === hospitalId) || INITIAL_HOSPITALS[0];

  const handleReset = () => {
    setFormSubmitted(false);
    setCreatedEnquiry(null);
    setPatientName('');
    setAge('');
    setGender('Female');
    setPhone('');
    setEmail('');
    setCity('');
    setAddress('');
    setReason('Free Cancer Screening');
    setCancerType('Breast Cancer');
    setHospitalId(INITIAL_HOSPITALS[0].id);
    setPreferredDate('');
    setNotes('');
    setUploadedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#004349] px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-secondary-container" />
            <span className="font-headline-lg text-xl font-bold">Patient Navigation & Camp Booking</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="bg-teal-50/70 p-3.5 rounded-xl border border-teal-200/80 text-xs text-teal-900 leading-relaxed">
                <strong>Need expert medical navigation?</strong> Submit your details below to request a prioritized appointment slot, free screening camp admission, or clinical second opinion. All inquiries enter our 2-tier approval workflow immediately.
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
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
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
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
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
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
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
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="10-digit phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    City & State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="e.g. Pune, Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Cancer Type / Category
                  </label>
                  <select
                    value={cancerType}
                    onChange={e => setCancerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  >
                    <option value="Breast Cancer">Breast Cancer</option>
                    <option value="Cervical Cancer">Cervical Cancer</option>
                    <option value="Oral / Head & Neck Cancer">Oral / Head & Neck Cancer</option>
                    <option value="Prostate Cancer">Prostate Cancer</option>
                    <option value="Lung Cancer">Lung Cancer</option>
                    <option value="Gastrointestinal Cancer">Gastrointestinal Cancer</option>
                    <option value="Pediatric Oncology">Pediatric Oncology</option>
                    <option value="General Screening">General Screening & Prevention</option>
                  </select>
                </div>
              </div>

              {/* Consultation details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Inquiry Stream
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
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
                    Preferred Hospital Node
                  </label>
                  <select
                    value={hospitalId}
                    onChange={e => setHospitalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
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
                    Preferred Target Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm cursor-pointer"
                  />
                </div>
                <div className="flex items-center text-xs text-on-surface-variant bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <Clock className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                  <span>Submissions automatically populate the Regional Admin Approval Queue.</span>
                </div>
              </div>

              {/* Symptoms/Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Symptoms, Diagnosis details, or Medical Questions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  placeholder="Provide details on symptoms, duration, biopsy results, or current oncology staging..."
                />
              </div>

              {/* Upload Medical Reports */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Upload Medical Reports & Prescriptions (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors">
                  <input
                    type="file"
                    id="enquiry-file-upload"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleSimulatedFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="enquiry-file-upload" className="cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-primary">
                    <Upload className="w-4 h-4" />
                    <span>Choose Medical Report files (PDF, Scans, Biopsy)</span>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-xs">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-500">({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(file.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-md transition-opacity cursor-pointer flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 px-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h3 className="font-headline-lg text-2xl text-primary mb-1">Inquiry Submitted Successfully!</h3>
              <p className="font-body-md text-xs text-on-surface-variant max-w-md mb-5 leading-relaxed">
                Thank you, <strong className="text-on-surface">{patientName}</strong>. Your enquiry has entered the 2-tier approval workflow and will appear immediately in the Regional Admin dashboard.
              </p>

              {/* Confirmation Slip */}
              {createdEnquiry && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full max-w-md shadow-sm mb-6 text-left space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Enquiry ID</span>
                      <span className="font-mono text-sm font-black text-primary">{createdEnquiry.enquiryId}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                      Ref: {createdEnquiry.referenceNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Patient Name:</span>
                      <p className="font-semibold text-slate-800">{createdEnquiry.patientName} ({createdEnquiry.age} / {createdEnquiry.gender})</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Current Status:</span>
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block text-[11px] mt-0.5">
                        {createdEnquiry.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Inquiry Stream:</span>
                      <p className="font-semibold text-slate-800">{createdEnquiry.reason}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Target Hospital:</span>
                      <p className="font-semibold text-primary">{createdEnquiry.preferredHospitalName || selectedHospital.name}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                    <strong className="text-primary block mb-1">Workflow Stage 1 Completed:</strong>
                    <p className="text-[11px]">
                      Your enquiry is now queued under <strong>Pending Admin Review</strong>. Once approved by Regional Admin, Super Admin will assign your case to the hospital.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 transition-opacity"
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
