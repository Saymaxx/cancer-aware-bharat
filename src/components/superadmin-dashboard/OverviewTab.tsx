import {
  Heart, Users, Globe, Building2, AlertCircle, Calendar, DollarSign, Shield,
  Megaphone, UserCog, Activity, TrendingUp,
} from 'lucide-react';
import { SUPER_ADMIN_KPI, INITIAL_AUDIT_LOGS, MONTHLY_PATIENT_INTAKE, type HospitalApplication, type SuperAdminAccount } from '../../superAdminDashboardData';

export default function OverviewTab({
  hospitals,
  admins,
  setActiveTab,
}: {
  hospitals: HospitalApplication[];
  admins: SuperAdminAccount[];
  setActiveTab: (tab: string) => void;
}) {
  const kpi = SUPER_ADMIN_KPI;
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Patients', value: kpi.totalPatients.toLocaleString(), icon: Heart, color: 'from-rose-500 to-pink-600' },
          { label: 'Volunteers', value: kpi.totalVolunteers.toLocaleString(), icon: Users, color: 'from-primary to-primary-container' },
          { label: 'Total Users', value: kpi.totalUsers.toLocaleString(), icon: Globe, color: 'from-primary to-cyan-600' },
          { label: 'Partner Hospitals', value: String(hospitals.filter(h => h.status === 'Approved').length + 4), icon: Building2, color: 'from-violet-500 to-purple-600' },
          { label: 'Pending Tie-ups', value: String(hospitals.filter(h => h.status === 'Pending Review' || h.status === 'Recommended by Admin').length), icon: AlertCircle, color: 'from-secondary to-secondary' },
          { label: 'Active Campaigns', value: String(kpi.activeCampaigns), icon: Calendar, color: 'from-indigo-500 to-primary-container' },
          { label: 'Donations (INR)', value: '₹' + kpi.totalDonations.toLocaleString(), icon: DollarSign, color: 'from-primary to-primary-container' },
          { label: 'Financial Aid Cases', value: String(kpi.financialAidCases), icon: Shield, color: 'from-pink-500 to-rose-600' },
          { label: 'Awareness Programs', value: String(kpi.awarenessPrograms), icon: Megaphone, color: 'from-cyan-500 to-primary-container' },
          { label: 'Admin Accounts', value: String(admins.length), icon: UserCog, color: 'from-slate-500 to-gray-600' },
          { label: 'System Health', value: kpi.systemHealthScore + '%', icon: Activity, color: 'from-primary to-primary-container' },
          { label: 'Monthly Growth', value: '+' + kpi.monthlyGrowthRate + '%', icon: TrendingUp, color: 'from-purple-500 to-indigo-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">{card.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Patient Intake Trend (2026)
          </h3>
          <div className="flex items-end justify-between gap-3 h-48 pt-4">
            {MONTHLY_PATIENT_INTAKE.map((m, i) => {
              const maxVal = Math.max(...MONTHLY_PATIENT_INTAKE.map(x => x.count));
              const pct = (m.count / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-400 transition-all duration-700 group-hover:from-purple-600 group-hover:to-pink-400" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Audit Activity</h3>
          <div className="space-y-3">
            {INITIAL_AUDIT_LOGS.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-xs">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.severity === 'Critical' ? 'bg-red-500' : log.severity === 'Warning' ? 'bg-secondary' : 'bg-primary'}`} />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{log.action}</p>
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab('audit')} className="w-full mt-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-100 transition-colors">
            View All Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
}
