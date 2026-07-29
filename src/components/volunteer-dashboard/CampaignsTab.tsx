import { CheckCircle2, CheckCircle, Calendar, MapPin, User, Check, QrCode, FileText, PhoneCall } from 'lucide-react';
import { CountdownDisplay } from './shared';
import type { ActiveCampaign } from '../../volunteerDashboardData';

export default function CampaignsTab({
  myCampaigns,
  handleCheckIn,
  setActivePassModal,
  setActiveProtocolModal,
  setActiveLeadContactModal,
}: {
  myCampaigns: ActiveCampaign[];
  handleCheckIn: (campId: string) => void;
  setActivePassModal: (camp: ActiveCampaign) => void;
  setActiveProtocolModal: (camp: ActiveCampaign) => void;
  setActiveLeadContactModal: (camp: ActiveCampaign) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">

      {/* Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl text-xs flex items-start gap-3 leading-relaxed">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-primary-container mt-0.5" />
        <div>
          <p className="font-bold">Verified & Admin-Approved Campaigns Only</p>
          <p className="text-slate-800/85 mt-0.5">
            Under CAB Regional Governance protocols, volunteers are assigned to campaigns verified and approved by the Regional Admin. Click on any campaign below to download your Digital Event Pass, access camp safety guidelines, or mark your check-in.
          </p>
        </div>
      </div>

      {/* Cards Grid of Admin Approved Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myCampaigns.map((camp) => (
          <div key={camp.id} className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
            {/* Campaign Image */}
            <div className="h-44 relative overflow-hidden">
              <img src={camp.image} alt={camp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Admin Approved
              </span>
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                {camp.type}
              </span>
            </div>

            {/* Campaign Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-headline-lg text-base font-bold text-slate-900">{camp.name}</h3>
                <div className="grid grid-cols-1 gap-2 mt-3 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary shrink-0" /> {camp.date} • {camp.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> {camp.location}</p>
                  <p className="flex items-center gap-2"><User className="w-4 h-4 text-primary shrink-0" /> Regional Lead: {camp.organizer}</p>
                </div>
              </div>

              {/* Action Control Panel for Campaign */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Starts In</p>
                    <CountdownDisplay targetDate={camp.targetDate} />
                  </div>
                  <div>
                    {camp.attendanceStatus === 'Checked In' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Checked In
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(camp.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                      >
                        Check-In Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Buttons Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                  <button
                    onClick={() => setActivePassModal(camp)}
                    className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Event Pass
                  </button>
                  <button
                    onClick={() => setActiveProtocolModal(camp)}
                    className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Guidelines
                  </button>
                  <button
                    onClick={() => setActiveLeadContactModal(camp)}
                    className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Contact Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
