import {
  Users, Stethoscope, CheckCircle2, Calendar, UserCheck, FileText,
  DollarSign, ShieldCheck, TrendingUp, Activity,
} from 'lucide-react';
import { MONTHLY_PATIENTS_TREATED } from '../../hospitalDashboardData';
import type { AssignedPatient, NgoReferral, HospitalActivityLog } from '../../hospitalDashboardData';
import type { HospitalProfile } from './shared';

interface KpiMetrics {
  totalReferredPatients: number;
  patientsUnderTreatment: number;
  completedTreatments: number;
  upcomingAwarenessCamps: number;
  assignedDoctorsCount: number;
  pendingMedicalReports: number;
  financialAidRequestsCount: number;
  partnershipStatus: string;
}

export default function OverviewTab({
  profile,
  kpiMetrics,
  patients,
  referrals,
  activityLogs,
  setActiveTab,
  setSelectedReferralModal,
}: {
  profile: HospitalProfile;
  kpiMetrics: KpiMetrics;
  patients: AssignedPatient[];
  referrals: NgoReferral[];
  activityLogs: HospitalActivityLog[];
  setActiveTab: (tab: string) => void;
  setSelectedReferralModal: (ref: NgoReferral) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">

      {/* Partner Welcome Banner */}
      <div className="bg-gradient-to-r from-[#063b42] via-[#0d5c63] to-slate-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold border border-white/10">
            Hospital Partner Console • {profile.city}
          </span>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            Collaborating with Cancer Aware Bharat Trust to provide standardized oncology treatment, diagnostic referrals, and financial aid verification.
          </p>
        </div>
        <div className="relative z-10 flex gap-2 shrink-0">
          <button onClick={() => setActiveTab('patients')} className="px-4 py-2.5 bg-white text-[#063b42] rounded-xl text-xs font-bold hover:bg-slate-100 shadow-md cursor-pointer transition-all">
            View Assigned Patients
          </button>
          <button onClick={() => setActiveTab('referrals')} className="px-4 py-2.5 bg-slate-400 text-[#063b42] rounded-xl text-xs font-bold hover:bg-slate-300 shadow-md cursor-pointer transition-all">
            Pending Referrals ({referrals.filter(r => r.status === 'Pending Action').length})
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Referred Patients', val: kpiMetrics.totalReferredPatients, icon: Users, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Under Treatment', val: kpiMetrics.patientsUnderTreatment, icon: Stethoscope, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
          { label: 'Completed Treatments', val: kpiMetrics.completedTreatments, icon: CheckCircle2, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Awareness Camps', val: kpiMetrics.upcomingAwarenessCamps, icon: Calendar, color: 'text-purple-700 bg-purple-50 border-purple-200' },
          { label: 'Assigned Doctors', val: kpiMetrics.assignedDoctorsCount, icon: UserCheck, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Pending Reports', val: kpiMetrics.pendingMedicalReports, icon: FileText, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Aid Verifications', val: kpiMetrics.financialAidRequestsCount, icon: DollarSign, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
          { label: 'Partnership Status', val: kpiMetrics.partnershipStatus, icon: ShieldCheck, color: 'text-slate-700 bg-slate-50 border-slate-200' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xl font-black text-slate-900 truncate">{kpi.val}</p>
              <p className="text-[11px] text-slate-500 font-semibold truncate">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Treatment Trends & Referrals Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Visual Chart Placeholder: Patient Treatment Progress */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-container" /> Monthly Treated Patients Trend
            </h3>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">+18% Growth</span>
          </div>
          {patients.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center space-y-1.5 text-slate-400">
              <Activity className="w-8 h-8 text-primary-container/40" />
              <p className="text-xs font-bold text-slate-700">No Patient Treatment History</p>
              <p className="text-[11px] text-slate-500 max-w-xs">Monthly patient treatment progress will plot here automatically as patients receive care.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-44 pt-4">
              {MONTHLY_PATIENTS_TREATED.map((m, idx) => {
                const heightPct = (m.count / 35) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.count}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-[#063b42] to-primary rounded-t-lg group-hover:from-primary-container group-hover:to-slate-400 transition-all duration-300"
                    />
                    <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* NGO Pending Referrals Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary-container" /> Incoming NGO Referrals
            </h3>
            <button onClick={() => setActiveTab('referrals')} className="text-xs font-bold text-slate-700 hover:underline">View All</button>
          </div>
          {referrals.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-1.5">
              <UserCheck className="w-7 h-7 mx-auto text-primary-container/40" />
              <p className="text-xs font-bold text-slate-700">No Pending Referrals</p>
              <p className="text-[11px] text-slate-500">Incoming referrals from CAB Trust will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.slice(0, 3).map(ref => (
                <div key={ref.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-xs">{ref.patientName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        ref.priority === 'Critical' ? 'bg-red-100 text-red-700' : ref.priority === 'Urgent' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-700'
                      }`}>{ref.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{ref.cancerType} • {ref.recommendedDepartment}</p>
                  </div>
                  <button onClick={() => setSelectedReferralModal(ref)} className="px-3 py-1 bg-[#063b42] text-white rounded-lg text-[10px] font-bold hover:opacity-90 cursor-pointer">
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-container" /> Recent Hospital Audit Trail
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Module</th>
                <th className="p-3">Action Description</th>
                <th className="p-3">Actor / Doctor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activityLogs.slice(0, 4).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="p-3 text-slate-500 font-mono">{log.timestamp}</td>
                  <td className="p-3 font-semibold text-slate-700">{log.module}</td>
                  <td className="p-3 text-slate-900 font-medium">{log.action}</td>
                  <td className="p-3 text-slate-600">{log.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
