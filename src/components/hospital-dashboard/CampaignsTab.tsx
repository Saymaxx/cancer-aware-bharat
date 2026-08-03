import { Calendar, MapPin } from 'lucide-react';
import type { HospitalCampaign } from '../../hospitalDashboardData';

export default function CampaignsTab({
  campaigns,
}: {
  campaigns: HospitalCampaign[];
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex justify-between items-center">
        <h3 className="font-headline-lg text-lg font-bold text-slate-900">Hospital Collaborative Awareness Drives</h3>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Active Awareness Drives</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Collaborative early detection drives and screening camps co-hosted with Cancer Aware Bharat Trust will be displayed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map(camp => (
            <div key={camp.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200">{camp.category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${camp.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-700'}`}>{camp.status}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{camp.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-container" /> {camp.date} • {camp.time}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-container" /> {camp.venue}</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Hospital Oncologists</p>
                  {camp.assignedDoctors.length === 0 ? (
                    <p className="text-slate-400 text-[11px]">No doctors assigned yet</p>
                  ) : (
                    camp.assignedDoctors.map((doc, idx) => (
                      <p key={idx} className="font-semibold text-slate-700 text-[11px]">• {doc}</p>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Capacity: <strong>{camp.expectedScreenings}</strong></span>
                <span className="text-slate-500 text-[11px]">Volunteers: <strong>{camp.volunteerCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
