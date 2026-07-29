import { Heart, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface RecentActivity {
  id: string;
  text: string;
  time: string;
  type: string;
}

interface SummaryKpis {
  totalPatients: number;
  totalVolunteers: number;
  activeCampaigns: number;
  donationsReceived: number;
  pendingHospitalTieups: number;
  financialAidRequests: number;
}

interface KpiMetrics {
  recentActivities: RecentActivity[];
  [key: string]: any;
}

export default function OverviewTab({
  summaryKpis,
  kpiMetrics,
  setActiveTab,
}: {
  summaryKpis: SummaryKpis;
  kpiMetrics: KpiMetrics;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPI cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients Managed', value: summaryKpis.totalPatients, icon: Heart, color: 'text-primary bg-primary/10 border-primary/15' },
          { label: 'Registered Volunteers', value: summaryKpis.totalVolunteers, icon: Users, color: 'text-secondary bg-secondary/10 border-secondary/15' },
          { label: 'Campaigns Scheduled', value: summaryKpis.activeCampaigns, icon: Calendar, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Donations Audited (INR)', value: `₹${summaryKpis.donationsReceived.toLocaleString()}`, icon: DollarSign, color: 'text-slate-700 bg-slate-50 border-slate-200' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-outline-variant/30 p-5 shadow-xs flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Second row: Activity & Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Visual Chart Placeholder */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Active Intake Trend (Last 6 Months)
          </h3>
          <div className="flex items-end justify-between gap-4 h-48 pt-4">
            {[
              { month: 'Feb', val: 120, label: '120 Patients' },
              { month: 'Mar', val: 150, label: '150 Patients' },
              { month: 'Apr', val: 210, label: '210 Patients' },
              { month: 'May', val: 190, label: '190 Patients' },
              { month: 'Jun', val: 240, label: '240 Patients' },
              { month: 'Jul', val: 310, label: '310 Patients' },
            ].map((m, i) => {
              const heightPercent = (m.val / 350) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.val}
                  </span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-container transition-all duration-700 group-hover:from-secondary group-hover:to-secondary/80"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Audit Logs / Recent Activity</h3>
            <div className="space-y-3.5">
              {kpiMetrics.recentActivities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs leading-relaxed">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium">{act.text}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('notifications')}
            className="w-full mt-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary hover:bg-slate-100 transition-colors"
          >
            View All Activity Logs
          </button>
        </div>

      </div>
    </div>
  );
}
