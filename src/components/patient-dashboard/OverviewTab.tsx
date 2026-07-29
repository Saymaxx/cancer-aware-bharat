import { FileText, Clock, Building2, CalendarCheck, PlusCircle } from 'lucide-react';
import { SectionHeader, AnimatedCounter } from '../volunteer-dashboard/shared';
import StatusBadge from '../common/StatusBadge';
import type { PatientEnquiry } from '../../types';

export default function OverviewTab({
  patientName,
  enquiries,
  onSubmitNew,
  onViewTimeline,
  setActiveTab,
}: {
  patientName: string;
  enquiries: PatientEnquiry[];
  onSubmitNew: () => void;
  onViewTimeline: (enquiry: PatientEnquiry) => void;
  setActiveTab: (tab: string) => void;
}) {
  const pending = enquiries.filter(e => e.status === 'Pending Admin Review').length;
  const inProgress = enquiries.filter(e =>
    ['Approved by Admin', 'Pending Hospital Assignment', 'Assigned to Hospital', 'Accepted by Hospital'].includes(e.status)
  ).length;
  const confirmed = enquiries.filter(e => e.status === 'Appointment Confirmed' || e.status === 'Completed').length;
  const recent = [...enquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-gradient-to-br from-primary via-primary-container to-primary rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-xl sm:text-2xl font-bold mb-1">Welcome back, {patientName}</h2>
          <p className="text-white/70 text-sm">Track your enquiries and appointments in one place.</p>
        </div>
        <button
          onClick={onSubmitNew}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-primary font-bold text-sm rounded-xl hover:bg-white/90 transition-colors cursor-pointer shadow-lg"
        >
          <PlusCircle className="w-4 h-4" /> Submit New Enquiry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block"><AnimatedCounter value={pending} /></span>
            <span className="text-xs text-slate-500 font-medium">Pending Review</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block"><AnimatedCounter value={inProgress} /></span>
            <span className="text-xs text-slate-500 font-medium">In Progress</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block"><AnimatedCounter value={confirmed} /></span>
            <span className="text-xs text-slate-500 font-medium">Confirmed / Completed</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          icon={FileText}
          title="Recent Enquiries"
          action={
            enquiries.length > 5 ? (
              <button onClick={() => setActiveTab('enquiries')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                View All ({enquiries.length})
              </button>
            ) : undefined
          }
        />
        {recent.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-500">
            You haven't submitted any enquiries yet.
            <button onClick={onSubmitNew} className="block mx-auto mt-3 text-primary font-bold hover:underline cursor-pointer">
              Submit your first enquiry
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(enq => (
              <button
                key={enq.id}
                onClick={() => onViewTimeline(enq)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 transition-colors text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-mono font-bold text-xs text-primary">{enq.enquiryId}</p>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{enq.reason}</p>
                </div>
                <StatusBadge status={enq.status} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
