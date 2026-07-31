import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HeartPulse, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import PrescriptionPreview from './PrescriptionPreview';
import { ApiError, submitEnquiry } from '../api/client';

interface PatientEnquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientEnquiryForm({ isOpen, onClose }: PatientEnquiryFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    address: '',
    phone: '',
    symptoms: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const isNameValid = formData.fullName.trim().length >= 2;
  const isAgeValid = Number(formData.age) >= 1 && Number(formData.age) <= 120;
  const isGenderValid = formData.gender === 'Male' || formData.gender === 'Female' || formData.gender === 'Others';
  const isPhoneValid = formData.phone.replace(/\D/g, "").length === 10;
  const isAddressValid = formData.address.trim().length > 3;
  const isSymptomsValid = formData.symptoms.trim().length >= 5;

  const isValid = 
    isNameValid &&
    isAgeValid &&
    isGenderValid &&
    isPhoneValid &&
    isAddressValid &&
    isSymptomsValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setSubmitError('Please fill in all required fields correctly before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // This was previously posting directly to a hardcoded Google Apps
      // Script URL, bypassing the real backend/database entirely -- no
      // record of it ever reached Postgres or any dashboard. Routed through
      // the same submitEnquiry() call EnquiryModal.tsx already uses so it
      // lands in the real enquiry pipeline instead. This quick chatbot-form
      // never asks for a city or an enquiry "reason" the way the full
      // enquiry form does, so address doubles as city and reason gets a
      // fixed label identifying where it came from.
      const created = await submitEnquiry({
        patientName: formData.fullName.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.address.trim(),
        reason: 'General Enquiry (Chatbot)',
        symptoms: formData.symptoms.trim(),
        notes: formData.symptoms.trim(),
      });

      setPatientId(created.enquiryId);
      setReferenceNumber(created.referenceNumber);
      setIsSubmitting(false);
      setIsSuccess(true);

      // Removed form clear from here so prescription preview can access the data.
      // Form clearing is now handled by the 'New Inquiry' button.

      // Fire confetti
      const end = Date.now() + 2 * 1000;
      const colors = ['#183A63', '#ffffff', '#2563eb'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Unable to submit enquiry. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  const handleGeneratePrescription = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPrescription(true);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[110]"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(10px)'
            }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-[24px] shadow-2xl w-[95%] md:w-[90%] lg:w-[900px] max-h-[95vh] flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="shrink-0 px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HeartPulse className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-outfit text-xl font-bold text-slate-800">Patient Enquiry Form</h2>
                    <p className="text-sm text-slate-500">Please fill in your details so our team can contact you.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Inquiry Submitted Successfully</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-4">
                      Your enquiry has been successfully registered with Cancer Aware Bharat.
                    </p>
                    {patientId && (
                      <div className="bg-slate-100 px-6 py-3 rounded-lg mb-6 border border-slate-200">
                        <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block mb-1">Enquiry ID:</span>
                        <span className="text-primary font-bold text-lg">{patientId}</span>
                        {referenceNumber && (
                          <span className="text-slate-500 text-xs font-mono block mt-1">Ref: {referenceNumber}</span>
                        )}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleGeneratePrescription}
                      className="mb-8 px-8 py-3.5 rounded-full bg-primary text-white font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-primary-container shadow-[0_4px_14px_rgba(22,58,95,0.3)] hover:shadow-[0_6px_20px_rgba(22,58,95,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 group relative overflow-hidden"
                    >
                      <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                      Generate Prescription
                      <ArrowRight className="w-4 h-4 -rotate-45 ml-1 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setIsSuccess(false);
                          setPatientId(null);
                          setReferenceNumber(null);
                          setFormData({
                            fullName: '',
                            age: '',
                            gender: '',
                            address: '',
                            phone: '',
                            symptoms: ''
                          });
                        }}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors shadow-md hover:shadow-lg"
                      >
                        New Inquiry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Grid Layout for Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 block">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Age */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 block">Age *</label>
                        <input
                          type="number"
                          name="age"
                          required
                          value={formData.age}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                          placeholder="e.g. 45"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 block">Phone Number *</label>
                        <input
                          type="text"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                          placeholder="10-digit mobile number"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 block">Gender *</label>
                        <div className="flex gap-4">
                          {['Male', 'Female', 'Others'].map((g) => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={formData.gender === g}
                                onChange={() => handleGenderChange(g)}
                                className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                              />
                              <span className="text-sm text-slate-700">{g}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 block">Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all resize-none h-20"
                          placeholder="Enter your city, state or full address"
                        />
                      </div>

                      {/* Comment / Symptoms */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 block">Comment / Symptoms *</label>
                        <textarea
                          name="symptoms"
                          required
                          value={formData.symptoms}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all resize-none h-32"
                          placeholder="Describe your symptoms or write anything you want our doctors to know..."
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Footer Buttons */}
              {!isSuccess && (
                <div className="shrink-0 p-6 bg-white border-t border-slate-100 flex flex-col items-center gap-4 z-10">
                  {submitError && (
                    <div className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 text-center mb-2">
                      {submitError}
                    </div>
                  )}
                  <div className="w-full flex flex-col sm:flex-row items-center gap-4 sm:justify-end">

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-primary-container hover:shadow-[0_4px_20px_rgba(22,58,95,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2 relative z-10">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <span className="relative z-10">Submit Inquiry</span>
                          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* Render the Prescription Preview outside or on top if needed */}
      <PrescriptionPreview 
        isOpen={showPrescription}
        onClose={() => setShowPrescription(false)}
        patientData={formData}
      />
    </AnimatePresence>,
    document.body
  );
}
