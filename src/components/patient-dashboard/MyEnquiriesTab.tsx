import { useState, useMemo } from 'react';
import { Clock, PlusCircle, CalendarCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import type { PatientEnquiry } from '../../types';

const FILTERS = ['All', 'Pending Admin Review', 'In Progress', 'Appointment Confirmed', 'Completed', 'Rejected / Declined'] as const;

export default function MyEnquiriesTab({
  enquiries,
  loading,
  error,
  onSubmitNew,
  onViewTimeline,
}: {
  enquiries: PatientEnquiry[];
  loading: boolean;
  error: string | null;
  onSubmitNew: () => void;
  onViewTimeline: (enquiry: PatientEnquiry) => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return enquiries;
    if (filter === 'In Progress') {
      return enquiries.filter(e =>
        ['Approved by Admin', 'Pending Hospital Assignment', 'Assigned to Hospital', 'Accepted by Hospital'].includes(e.status)
      );
    }
    if (filter === 'Rejected / Declined') {
      return enquiries.filter(e => e.status === 'Rejected by Admin' || e.status === 'Declined by Hospital');
    }
    return enquiries.filter(e => e.status === filter);
  }, [enquiries, filter]);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={onSubmitNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-95 transition-opacity cursor-pointer shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" /> New Enquiry
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-10 shadow-xs flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-xs font-semibold">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-10 shadow-xs text-center text-sm text-slate-500">
          No enquiries match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(enq => (
            <button
              key={enq.id}
              onClick={() => onViewTimeline(enq)}
              className="text-left bg-white rounded-2xl border border-outline-variant/30 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-primary">{enq.enquiryId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ref: {enq.referenceNumber}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{enq.reason}</p>
                  {enq.assignedHospitalName && (
                    <p className="text-xs text-slate-500 mt-0.5">Hospital: {enq.assignedHospitalName}</p>
                  )}
                </div>
                <StatusBadge status={enq.status} size="md" />
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted {enq.date}</span>
                {enq.appointment && (
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <CalendarCheck className="w-3 h-3" /> Appointment {enq.appointment.date} at {enq.appointment.time}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
