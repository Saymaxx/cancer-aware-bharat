import { UserCheck, CheckCircle2, Stethoscope, AlertCircle, Search, Check, X, Clock } from 'lucide-react';
import type { PatientEnquiry } from '../../types';

export default function AssignedEnquiriesTab({
  pendingAssignedEnquiriesCount,
  assignedEnquiriesForThisHospital,
  hospitalEnquiryTabFilter,
  setHospitalEnquiryTabFilter,
  searchTerm,
  setSearchTerm,
  setAcceptingEnquiry,
  setAcceptDate,
  setAcceptTime,
  setAcceptDoctor,
  setAcceptRemarks,
  setDecliningEnquiry,
  setHospitalDeclineReasonText,
  setCompletingEnquiry,
  setCompleteRemarksText,
  setTimelineEnquiry,
}: {
  pendingAssignedEnquiriesCount: number;
  assignedEnquiriesForThisHospital: PatientEnquiry[];
  hospitalEnquiryTabFilter: string;
  setHospitalEnquiryTabFilter: (val: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  setAcceptingEnquiry: (enq: PatientEnquiry) => void;
  setAcceptDate: (val: string) => void;
  setAcceptTime: (val: string) => void;
  setAcceptDoctor: (val: string) => void;
  setAcceptRemarks: (val: string) => void;
  setDecliningEnquiry: (enq: PatientEnquiry) => void;
  setHospitalDeclineReasonText: (val: string) => void;
  setCompletingEnquiry: (enq: PatientEnquiry) => void;
  setCompleteRemarksText: (val: string) => void;
  setTimelineEnquiry: (enq: PatientEnquiry) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{pendingAssignedEnquiriesCount}</span>
            <span className="text-xs text-slate-500 font-medium">Pending Hospital Action</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-primary-container">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {assignedEnquiriesForThisHospital.filter(e => e.status === 'Appointment Confirmed' || e.status === 'Accepted by Hospital').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Appointments Confirmed</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-primary-container">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{assignedEnquiriesForThisHospital.length}</span>
            <span className="text-xs text-slate-500 font-medium">Total Patient Referrals</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-secondary">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {assignedEnquiriesForThisHospital.filter(e => e.status === 'Declined by Hospital').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Declined Cases</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Pending Action', 'Appointment Confirmed', 'Completed', 'Declined by Hospital'].map(st => (
            <button
              key={st}
              onClick={() => setHospitalEnquiryTabFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                hospitalEnquiryTabFilter === st
                  ? 'bg-[#063b42] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} {st === 'Pending Action' && pendingAssignedEnquiriesCount > 0 ? `(${pendingAssignedEnquiriesCount})` : ''}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ID, patient, city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary-container"
          />
        </div>
      </div>

      {/* Assigned Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-6 py-3.5">Enquiry ID & Ref</th>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Contact & Location</th>
                <th className="px-6 py-3.5">Stream & Symptoms</th>
                <th className="px-6 py-3.5">Super Admin Notes / Appointment</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {assignedEnquiriesForThisHospital.filter(e => {
                const matchSearch =
                  e.enquiryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  e.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  e.city.toLowerCase().includes(searchTerm.toLowerCase());
                const matchFilter =
                  hospitalEnquiryTabFilter === 'All' ||
                  (hospitalEnquiryTabFilter === 'Pending Action' && e.status === 'Assigned to Hospital') ||
                  (hospitalEnquiryTabFilter === 'Appointment Confirmed' && (e.status === 'Appointment Confirmed' || e.status === 'Accepted by Hospital')) ||
                  e.status === hospitalEnquiryTabFilter;
                return matchSearch && matchFilter;
              }).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No assigned patient enquiries match the active filter criteria.
                  </td>
                </tr>
              ) : (
                assignedEnquiriesForThisHospital.filter(e => {
                  const matchSearch =
                    e.enquiryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.city.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchFilter =
                    hospitalEnquiryTabFilter === 'All' ||
                    (hospitalEnquiryTabFilter === 'Pending Action' && e.status === 'Assigned to Hospital') ||
                    (hospitalEnquiryTabFilter === 'Appointment Confirmed' && (e.status === 'Appointment Confirmed' || e.status === 'Accepted by Hospital')) ||
                    e.status === hospitalEnquiryTabFilter;
                  return matchSearch && matchFilter;
                }).map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-800 block">{enq.enquiryId}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {enq.referenceNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{enq.patientName}</p>
                      <p className="text-[10px] text-slate-500">{enq.age} yrs • {enq.gender}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{enq.city}</p>
                      <p className="text-[10px] text-slate-500">{enq.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block">{enq.cancerType || enq.reason}</span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-xs">{enq.symptoms || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {enq.superAdminAssignment?.remarks && (
                        <p className="text-[11px] text-indigo-700 font-medium">
                          <strong>Super Admin:</strong> {enq.superAdminAssignment.remarks}
                        </p>
                      )}
                      {enq.appointment && (
                        <div className="mt-1 text-[10px] text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200">
                          <p className="font-bold">📅 {enq.appointment.date} at {enq.appointment.time}</p>
                          <p>👨‍⚕️ {enq.appointment.doctor}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        enq.status === 'Assigned to Hospital' ? 'bg-[#063b42]/10 text-[#063b42] border-[#063b42]/30 animate-pulse' :
                        enq.status === 'Appointment Confirmed' || enq.status === 'Accepted by Hospital' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        enq.status === 'Declined by Hospital' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {enq.status === 'Assigned to Hospital' && (
                        <>
                          <button
                            onClick={() => {
                              setAcceptingEnquiry(enq);
                              setAcceptDate(enq.preferredDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                              setAcceptTime('10:30 AM');
                              setAcceptDoctor('Dr. Siddharth Roy (Surgical Oncology)');
                              setAcceptRemarks('');
                            }}
                            className="px-2.5 py-1 bg-primary-container hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept Patient
                          </button>
                          <button
                            onClick={() => {
                              setDecliningEnquiry(enq);
                              setHospitalDeclineReasonText('');
                            }}
                            className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </>
                      )}
                      {enq.status === 'Appointment Confirmed' && (
                        <button
                          onClick={() => {
                            setCompletingEnquiry(enq);
                            setCompleteRemarksText('');
                          }}
                          className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => setTimelineEnquiry(enq)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                        <span>Timeline</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
