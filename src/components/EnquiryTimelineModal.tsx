import React from 'react';
import { X, CheckCircle, Clock, User, Building2, Shield, Calendar, FileText, AlertCircle, FileCheck, Stethoscope, ArrowRight } from 'lucide-react';
import { PatientEnquiry, TimelineEvent } from '../types';

interface EnquiryTimelineModalProps {
  enquiry: PatientEnquiry | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EnquiryTimelineModal({ enquiry, isOpen, onClose }: EnquiryTimelineModalProps) {
  if (!isOpen || !enquiry) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Admin Review':
        return 'bg-slate-50 text-slate-700 border-slate-300';
      case 'Approved by Admin':
      case 'Pending Hospital Assignment':
        return 'bg-slate-50 text-slate-700 border-slate-300';
      case 'Assigned to Hospital':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      case 'Accepted by Hospital':
      case 'Appointment Confirmed':
        return 'bg-slate-50 text-slate-700 border-slate-300';
      case 'Rejected by Admin':
      case 'Declined by Hospital':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const getStageIcon = (stage: string) => {
    if (stage.includes('Submitted')) return <User className="w-4 h-4 text-primary-container" />;
    if (stage.includes('Admin Approved')) return <Shield className="w-4 h-4 text-primary-container" />;
    if (stage.includes('Admin Rejected')) return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (stage.includes('Assigned')) return <Building2 className="w-4 h-4 text-indigo-600" />;
    if (stage.includes('Hospital Accepted')) return <CheckCircle className="w-4 h-4 text-primary-container" />;
    if (stage.includes('Hospital Declined')) return <AlertCircle className="w-4 h-4 text-secondary" />;
    if (stage.includes('Appointment')) return <Calendar className="w-4 h-4 text-primary-container" />;
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#004349] px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Stethoscope className="w-5 h-5 text-secondary-container" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-secondary-container bg-white/10 px-2 py-0.5 rounded">
                  {enquiry.enquiryId}
                </span>
                <span className="text-xs text-white/70">Ref: {enquiry.referenceNumber}</span>
              </div>
              <h3 className="font-headline-lg text-lg font-bold text-white">
                Patient Workflow Tracking & Timeline
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          
          {/* Patient Header Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-lg text-slate-900">{enquiry.patientName}</h4>
                <span className="text-xs text-slate-500 font-medium">({enquiry.age} yrs / {enquiry.gender})</span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-3">
                <span>📍 {enquiry.city}{enquiry.state ? `, ${enquiry.state}` : ''}</span>
                <span>📞 {enquiry.phone}</span>
                {enquiry.email && <span>✉️ {enquiry.email}</span>}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(enquiry.status)}`}>
                {enquiry.status}
              </span>
              <span className="text-[11px] text-slate-500">Submitted: {enquiry.date}</span>
            </div>
          </div>

          {/* Medical Summary Bento Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Inquiry Details</span>
              <p><strong className="text-slate-800">Reason / Stream:</strong> {enquiry.reason}</p>
              {enquiry.cancerType && <p><strong className="text-slate-800">Cancer Type / Diagnosis:</strong> {enquiry.cancerType}</p>}
              {enquiry.symptoms && <p className="text-slate-600"><strong className="text-slate-800">Symptoms / Notes:</strong> {enquiry.symptoms}</p>}
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Hospital & Appointment Details</span>
              <p><strong className="text-slate-800">Assigned Facility:</strong> {enquiry.assignedHospitalName || enquiry.preferredHospitalName || 'Pending Assignment'}</p>
              {enquiry.appointment ? (
                <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                  <p className="font-bold text-xs">✅ Appointment Confirmed ({enquiry.appointment.appointmentId})</p>
                  <p>📅 Date: {enquiry.appointment.date} at {enquiry.appointment.time}</p>
                  <p>👨‍⚕️ Doctor: {enquiry.appointment.doctor}</p>
                </div>
              ) : (
                <p className="text-slate-500 italic">No confirmed appointment scheduled yet.</p>
              )}
            </div>
          </div>

          {/* Uploaded Documents Section */}
          {enquiry.uploadedReports && enquiry.uploadedReports.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <h5 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> Uploaded Medical Documents & Reports ({enquiry.uploadedReports.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {enquiry.uploadedReports.map(rep => (
                  <div key={rep.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div className="truncate mr-2">
                      <p className="font-semibold text-slate-800 truncate">{rep.name}</p>
                      <span className="text-[10px] text-slate-500">{rep.size} • {rep.uploadedAt}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded">
                      Attached
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Visual Workflow Timeline */}
          <div className="border-t border-slate-200 pt-4">
            <h5 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Step-by-Step Workflow Timeline
            </h5>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {enquiry.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative group">
                  {/* Circle Marker */}
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center text-xs shadow-xs">
                    {getStageIcon(event.stage)}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                      <span className="font-bold text-xs text-slate-900">{event.stage}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{event.description}</p>
                    {event.actor && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong className="text-slate-600">Actor:</strong> {event.actor}
                      </p>
                    )}
                    {event.remarks && (
                      <div className="mt-1.5 p-2 bg-white rounded border border-slate-200 text-xs text-slate-700 italic">
                        "{event.remarks}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">Cancer Aware Bharat Patient Navigation Protocol v2.4</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
          >
            Close Timeline
          </button>
        </div>

      </div>
    </div>
  );
}
