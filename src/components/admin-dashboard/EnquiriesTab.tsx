import { Stethoscope, CheckCircle2, Calendar, AlertCircle, Search, Download, Check, X, Clock, FileText } from 'lucide-react';
import { PatientEnquiry } from '../../types';
import StatusBadge from '../common/StatusBadge';

export default function EnquiriesTab({
  pendingAdminCount,
  enquiries,
  filteredEnquiries,
  enquiryFilter,
  setEnquiryFilter,
  searchTerm,
  setSearchTerm,
  handleExportEnquiriesCSV,
  setShowApproveEnquiryModal,
  setApproveRemarks,
  setShowRejectEnquiryModal,
  setRejectReasonText,
  setTimelineEnquiry,
}: {
  pendingAdminCount: number;
  enquiries: PatientEnquiry[];
  filteredEnquiries: PatientEnquiry[];
  enquiryFilter: string;
  setEnquiryFilter: (val: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  handleExportEnquiriesCSV: () => void;
  setShowApproveEnquiryModal: (enq: PatientEnquiry | null) => void;
  setApproveRemarks: (val: string) => void;
  setShowRejectEnquiryModal: (enq: PatientEnquiry | null) => void;
  setRejectReasonText: (val: string) => void;
  setTimelineEnquiry: (enq: PatientEnquiry | null) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-secondary">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{pendingAdminCount}</span>
            <span className="text-xs text-slate-500 font-medium">Pending Admin Review</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-primary-container">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {enquiries.filter(e => e.status === 'Approved by Admin' || e.status === 'Assigned to Hospital').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Approved by Admin</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-primary-container">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {enquiries.filter(e => e.status === 'Appointment Confirmed').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Confirmed Appointments</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {enquiries.filter(e => e.status === 'Rejected by Admin' || e.status === 'Declined by Hospital').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Rejected / Declined</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Pending Admin Review', 'Approved by Admin', 'Rejected by Admin', 'Appointment Confirmed'].map(st => (
            <button
              key={st}
              onClick={() => setEnquiryFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                enquiryFilter === st
                  ? 'bg-[#004349] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} {st === 'Pending Admin Review' && pendingAdminCount > 0 ? `(${pendingAdminCount})` : ''}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, patient, city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleExportEnquiriesCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Export Enquiries to CSV"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Patient Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-6 py-3.5">Enquiry ID & Ref</th>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Contact & Location</th>
                <th className="px-6 py-3.5">Stream & Symptoms</th>
                <th className="px-6 py-3.5">Uploaded Reports</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No patient enquiries found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary block">{enq.enquiryId}</span>
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
                      <span className="text-[10px] text-slate-500 truncate block max-w-xs">{enq.symptoms || enq.notes || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {enq.uploadedReports && enq.uploadedReports.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          <FileText className="w-3 h-3" /> {enq.uploadedReports.length} Report(s)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No reports</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                      {enq.date}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enq.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {enq.status === 'Pending Admin Review' && (
                        <>
                          <button
                            onClick={() => { setShowApproveEnquiryModal(enq); setApproveRemarks(''); }}
                            className="px-2.5 py-1 bg-primary-container hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Approve Enquiry"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => { setShowRejectEnquiryModal(enq); setRejectReasonText(''); }}
                            className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Reject Enquiry"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setTimelineEnquiry(enq)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="View Timeline & Details"
                      >
                        <Clock className="w-3.5 h-3.5 text-primary" />
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
