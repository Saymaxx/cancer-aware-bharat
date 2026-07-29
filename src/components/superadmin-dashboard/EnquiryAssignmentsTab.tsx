import { Stethoscope, Building2, CheckCircle2, AlertTriangle, Search, Download, Clock } from 'lucide-react';
import { PatientEnquiry, Hospital } from '../../types';
import StatusBadge from '../common/StatusBadge';

export default function EnquiryAssignmentsTab({
  pendingHospitalAssignmentCount,
  enquiries,
  superAdminEnquiryFilter,
  setSuperAdminEnquiryFilter,
  searchTerm,
  setSearchTerm,
  handleExportAssignmentsCSV,
  superAdminFilteredEnquiries,
  allRegisteredHospitals,
  setAssigningEnquiry,
  setSelectedHospitalForAssign,
  setAssignRemarks,
  setTimelineEnquiry,
}: {
  pendingHospitalAssignmentCount: number;
  enquiries: PatientEnquiry[];
  superAdminEnquiryFilter: string;
  setSuperAdminEnquiryFilter: (val: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  handleExportAssignmentsCSV: () => void;
  superAdminFilteredEnquiries: PatientEnquiry[];
  allRegisteredHospitals: Hospital[];
  setAssigningEnquiry: (enq: PatientEnquiry | null) => void;
  setSelectedHospitalForAssign: (id: string) => void;
  setAssignRemarks: (val: string) => void;
  setTimelineEnquiry: (enq: PatientEnquiry | null) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{pendingHospitalAssignmentCount}</span>
            <span className="text-xs text-slate-500 font-medium">Pending Hospital Assignment</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {enquiries.filter(e => e.status === 'Assigned to Hospital').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Assigned to Hospital</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-primary-container">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {enquiries.filter(e => e.status === 'Appointment Confirmed').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Appointments Confirmed</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-secondary">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {enquiries.filter(e => e.status === 'Declined by Hospital').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Declined (Needs Reassignment)</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Pending Assignment', 'Assigned to Hospital', 'Declined by Hospital', 'Appointment Confirmed'].map(st => (
            <button
              key={st}
              onClick={() => setSuperAdminEnquiryFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                superAdminEnquiryFilter === st
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} {st === 'Pending Assignment' && pendingHospitalAssignmentCount > 0 ? `(${pendingHospitalAssignmentCount})` : ''}
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
            />
          </div>
          <button
            onClick={handleExportAssignmentsCSV}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Export Hospital Assignments CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-6 py-3.5">Enquiry ID</th>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">City & Preferred Loc</th>
                <th className="px-6 py-3.5">Cancer Stream & Symptoms</th>
                <th className="px-6 py-3.5">Admin & Hospital Notes</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {superAdminFilteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No patient enquiries found matching hospital assignment filter.
                  </td>
                </tr>
              ) : (
                superAdminFilteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                      {enq.enquiryId}
                      <span className="text-[10px] text-slate-400 font-mono block">Ref: {enq.referenceNumber}</span>
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
                      {enq.adminDecision?.remarks && (
                        <p className="text-[11px] text-slate-700 font-medium">
                          <strong>Admin:</strong> {enq.adminDecision.remarks}
                        </p>
                      )}
                      {enq.hospitalDecision?.action === 'Decline' && (
                        <p className="text-[11px] text-slate-700 font-medium">
                          <strong>Declined:</strong> {enq.hospitalDecision.remarks}
                        </p>
                      )}
                      {enq.assignedHospitalName && (
                        <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                          Assigned: {enq.assignedHospitalName}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enq.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {(enq.status === 'Approved by Admin' || enq.status === 'Declined by Hospital' || enq.status === 'Pending Hospital Assignment') && (
                        <button
                          onClick={() => {
                            setAssigningEnquiry(enq);
                            setSelectedHospitalForAssign(enq.hospitalId || allRegisteredHospitals[0]?.id || '');
                            setAssignRemarks('');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{enq.status === 'Declined by Hospital' ? 'Reassign Hospital' : 'Assign Hospital'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setTimelineEnquiry(enq)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
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
